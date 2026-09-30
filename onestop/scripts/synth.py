"""
OneStop — procedural soundtrack.

120 BPM, 60 fps video => 1 beat = 0.5 s = 30 frames, 1 bar = 2 s = 120 frames.
Every hit in here is placed on the same timeline the video uses (see src/timeline.ts),
so cuts, pops and whooshes land exactly on picture.

Run:  python scripts/synth.py   ->  public/audio/onestop.wav
"""
import numpy as np
from scipy import signal
from scipy.io import wavfile
from pathlib import Path

SR = 48000
DUR = 30.0
N = int(SR * DUR)
BEAT = 0.5
BAR = 2.0
rng = np.random.default_rng(20261001)


def F(frame):
    """video frame (60fps) -> seconds"""
    return frame / 60.0


def T(d):
    return np.arange(int(d * SR)) / SR


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


NOTE = {"C": 0, "C#": 1, "Db": 1, "D": 2, "D#": 3, "Eb": 3, "E": 4, "F": 5, "F#": 6,
        "Gb": 6, "G": 7, "G#": 8, "Ab": 8, "A": 9, "A#": 10, "Bb": 10, "B": 11}


def n(name):
    """'D4' -> midi"""
    pitch, octave = name[:-1], int(name[-1])
    return 12 * (octave + 1) + NOTE[pitch]


# ---------------------------------------------------------------- filters
def sos(kind, fc, order=2):
    if kind == "bp":
        return signal.butter(order, fc, "bandpass", fs=SR, output="sos")
    return signal.butter(order, fc, kind, fs=SR, output="sos")


def lp(x, fc, order=2):
    return signal.sosfilt(sos("low", min(fc, SR * 0.45), order), x)


def hp(x, fc, order=2):
    return signal.sosfilt(sos("high", fc, order), x)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(sos("bp", [lo, min(hi, SR * 0.45)], order), x)


def sweep_bp(x, centers, q=1.2, block=256):
    """time-varying band-pass; `centers` is a per-sample array of centre freqs"""
    out = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), block):
        c = float(np.clip(centers[min(i, len(centers) - 1)], 60, SR * 0.4))
        lo, hi = c / (1 + 0.5 / q), min(c * (1 + 0.5 / q), SR * 0.45)
        s = signal.butter(2, [lo, hi], "bandpass", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((s.shape[0], 2))
        out[i:i + block], zi = signal.sosfilt(s, x[i:i + block], zi=zi)
    return out


def sweep_lp(x, cutoffs, block=256):
    out = np.zeros_like(x)
    zi = None
    for i in range(0, len(x), block):
        c = float(np.clip(cutoffs[min(i, len(cutoffs) - 1)], 40, SR * 0.45))
        s = signal.butter(2, c, "low", fs=SR, output="sos")
        if zi is None:
            zi = np.zeros((s.shape[0], 2))
        out[i:i + block], zi = signal.sosfilt(s, x[i:i + block], zi=zi)
    return out


def noise(d):
    return rng.standard_normal(int(d * SR))


def env_exp(t, decay, attack=0.002):
    return np.minimum(1.0, t / max(attack, 1e-6)) * np.exp(-t / decay)


def adsr(length, a, d, s, r):
    t = np.arange(length) / SR
    total = length / SR
    rel = max(a + d, total - r)
    return np.interp(t, [0, a, a + d, rel, total + 1e-9], [0, 1, s, s, 0])


# ---------------------------------------------------------------- buses
class Bus:
    def __init__(self):
        self.x = np.zeros((2, N))

    def add(self, sig, t0, gain=1.0, pan=0.0):
        i0 = int(round(t0 * SR))
        if sig.ndim == 1:
            a = (pan + 1) * np.pi / 4
            sig = np.vstack([sig * np.cos(a), sig * np.sin(a)]) * np.sqrt(2)
        if i0 < 0:
            sig = sig[:, -i0:]
            i0 = 0
        m = min(sig.shape[1], N - i0)
        if m > 0:
            self.x[:, i0:i0 + m] += sig[:, :m] * gain


dry = Bus()        # drums / bass — no reverb
music = Bus()      # tonal parts, gets sidechain
fx = Bus()         # whooshes, impacts
verb_send = Bus()  # reverb send
delay_send = Bus()


def both(sig, t0, gain, pan=0.0, bus=None, verb=0.0, delay=0.0):
    (bus or music).add(sig, t0, gain, pan)
    if verb:
        verb_send.add(sig, t0, gain * verb, pan)
    if delay:
        delay_send.add(sig, t0, gain * delay, pan)


# ---------------------------------------------------------------- instruments
def kick(level=1.0, dur=0.5, f0=170, f1=46, pd=0.04, ad=0.30, muffled=False):
    t = T(dur)
    f = f1 + (f0 - f1) * np.exp(-t / pd)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(t, ad, 0.0008)
    click = hp(noise(dur) * np.exp(-t / 0.003), 1800) * 0.35
    s = body + (0 if muffled else click)
    s = np.tanh(1.8 * s) / np.tanh(1.8)
    if muffled:
        s = lp(s, 260, 2)
    return s * level


def clap(dur=0.45):
    t = T(dur)
    nz = noise(dur)
    e = np.zeros_like(t)
    for off in (0.0, 0.009, 0.019):
        tt = np.clip(t - off, 0, None)
        e += (t >= off) * np.exp(-tt / 0.006)
    e += (t >= 0.028) * np.exp(-np.clip(t - 0.028, 0, None) / 0.11) * 0.7
    return bp(nz * e, 900, 5200, 2) * 0.9


def hat(open_=False, dur=None):
    dur = dur or (0.32 if open_ else 0.07)
    t = T(dur)
    s = hp(noise(dur), 7500, 4) * env_exp(t, 0.11 if open_ else 0.018, 0.0005)
    return s


def pluck(midi, dur=0.9, bright=1.0):
    t = T(dur)
    f = mtof(midi)
    K = int(min(60, 14000 / f))
    s = np.zeros_like(t)
    for k in range(1, K + 1):
        dec = 0.55 / (1 + 0.35 * k * bright)
        s += (1 / k) * np.sin(2 * np.pi * k * f * t) * np.exp(-t / dec)
    s += 0.5 * np.sin(2 * np.pi * f * t) * np.exp(-t / 0.5)
    return s * env_exp(t, 10, 0.002) * 0.45


def saw_voice(f, t, fc, phase):
    K = int(min(48, 16000 / f))
    k = np.arange(1, K + 1)[:, None]
    gains = (1 / k) / np.sqrt(1 + (k * f / fc) ** 4)
    return (gains * np.sin(2 * np.pi * k * f * t[None, :] + k * phase)).sum(0)


def supersaw(midis, dur, fc, detune=(-14, -6, 0, 7, 13), width=0.8):
    t = T(dur)
    out = np.zeros((2, len(t)))
    for m in midis:
        for j, dc in enumerate(detune):
            f = mtof(m) * 2 ** (dc / 1200)
            v = saw_voice(f, t, fc, rng.uniform(0, 2 * np.pi))
            p = ((j / (len(detune) - 1)) * 2 - 1) * width
            a = (p + 1) * np.pi / 4
            out[0] += v * np.cos(a)
            out[1] += v * np.sin(a)
    return out / (len(midis) * len(detune)) * 2.2


def stab(midis, dur=0.28):
    t = T(dur)
    s = supersaw(midis, dur, 3200)
    # brightness envelope: blend bright attack with darker body
    dark = np.vstack([lp(s[0], 900), lp(s[1], 900)])
    mix = np.exp(-t / 0.05)
    s = s * mix + dark * (1 - mix)
    return s * env_exp(t, 0.16, 0.003)


def pad(midis, dur, fc=1500, a=0.5, r=0.9):
    s = supersaw(midis, dur, fc)
    e = adsr(s.shape[1], a, 0.3, 0.85, r)
    return s * e


def bass(midi, dur=0.22):
    t = T(dur)
    f = mtof(midi)
    sub = np.sin(2 * np.pi * f * t) * 0.8
    mid = saw_voice(f, t, 900, 0.0) * 0.95
    s = (sub + mid) * adsr(len(t), 0.004, 0.05, 0.8, 0.06)
    return np.tanh(1.4 * s)


def tick(freq=2600, dur=0.05):
    t = T(dur)
    return (np.sin(2 * np.pi * freq * t) * np.exp(-t / 0.012)
            + 0.3 * hp(noise(dur), 5000) * np.exp(-t / 0.004))


def vibe(midi, dur=2.6):
    """station chime: vibraphone-ish tuned bar"""
    t = T(dur)
    f = mtof(midi)
    s = (np.sin(2 * np.pi * f * t) * np.exp(-t / 1.6)
         + 0.32 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t / 0.45)
         + 0.08 * np.sin(2 * np.pi * 10 * f * t) * np.exp(-t / 0.1))
    s *= 1 + 0.12 * np.sin(2 * np.pi * 5.5 * t)
    return s * np.minimum(1, t / 0.002) * 0.6


def tom(dur=0.6, f0=150, f1=72):
    t = T(dur)
    f = f1 + (f0 - f1) * np.exp(-t / 0.06)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(t, 0.28, 0.001)
    s += hp(noise(dur), 2500) * np.exp(-t / 0.006) * 0.3
    return np.tanh(1.5 * s)


def whoosh(dur=0.6, lo=300, hi=4500, peak=0.55, pan_from=-0.8, pan_to=0.8):
    t = T(dur)
    x = t / dur
    shape = np.where(x < peak, x / peak, 1 - (x - peak) / (1 - peak))
    centers = lo * (hi / lo) ** np.clip(shape, 0, 1)
    s = sweep_bp(noise(dur), centers, q=0.9) * np.sin(np.pi * np.clip(x, 0, 1)) ** 2
    s = s / (np.abs(s).max() + 1e-9)
    pans = pan_from + (pan_to - pan_from) * x
    a = (pans + 1) * np.pi / 4
    return np.vstack([s * np.cos(a), s * np.sin(a)]) * np.sqrt(2)


def riser(dur, lo=250, hi=9000):
    t = T(dur)
    x = t / dur
    centers = lo * (hi / lo) ** (x ** 1.6)
    s = sweep_bp(noise(dur), centers, q=1.4)
    s = s / (np.abs(s).max() + 1e-9)
    # rising tone underneath
    f = 180 * (6.0 ** (x ** 1.8))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25
    return (s + tone) * (x ** 2.2)


def impact(dur=3.2, big=1.0):
    t = T(dur)
    f = 30 + 45 * np.exp(-t / 0.18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(t, 0.9 * big, 0.001)
    body = lp(noise(dur), 700) * env_exp(t, 0.12, 0.0005) * 1.6
    crack = hp(noise(dur), 2500) * env_exp(t, 0.02, 0.0003) * 0.9
    crash = hp(noise(dur), 4500, 2) * env_exp(t, 0.7 * big, 0.001) * 0.35
    return np.tanh(1.3 * (sub * 1.2 + body + crack + crash))


def reverse_swell(dur=0.9):
    t = T(dur)
    s = hp(noise(dur), 1800) * np.exp(-t / (dur * 0.35))
    s = lp(s, 9000)
    s = s[::-1] * (t / dur) ** 0.4
    return s / (np.abs(s).max() + 1e-9)


def snare(dur=0.25, tone=190):
    t = T(dur)
    body = np.sin(2 * np.pi * tone * t) * np.exp(-t / 0.05)
    nz = bp(noise(dur), 1200, 8000) * np.exp(-t / 0.07)
    return (0.6 * body + nz) * 0.8


def paper(dur=0.16):
    t = T(dur)
    s = bp(noise(dur), 1500, 7000) * np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.5
    thump = np.sin(2 * np.pi * 95 * t) * np.exp(-t / 0.05) * 0.8
    return s * 0.7 + thump


# ---------------------------------------------------------------- arrangement
kick_times = []

# chord roots / voicings (key of D minor, ends on D major)
CH = {
    "Dm": [n("D4"), n("F4"), n("A4")],
    "Bb": [n("D4"), n("F4"), n("Bb4")],
    "F":  [n("C4"), n("F4"), n("A4")],
    "C":  [n("C4"), n("E4"), n("G4")],
    "Gm": [n("D4"), n("G4"), n("Bb4")],
    "D":  [n("D4"), n("F#4"), n("A4"), n("D5")],
}
ROOT = {"Dm": n("D2"), "Bb": n("Bb1"), "F": n("F2"), "C": n("C2"), "Gm": n("G1"), "D": n("D2")}
PROG = ["Dm", "Bb", "F", "C"]

# --- HOOK (0 - 4 s): one rising pluck per flashed word, muffled pulse underneath
hook_notes = ["D4", "F4", "A4", "C5", "D5", "F5", "A5", "C6"]
for i, nm in enumerate(hook_notes):
    t0 = F(15 * i)
    both(pluck(n(nm), 0.9, 1.0), t0, 0.75, pan=(-0.35 if i % 2 else 0.35), verb=0.3, delay=0.3)
    dry.add(tick(3200 + 180 * i, 0.04), t0, 0.12, pan=(0.5 if i % 2 else -0.5))
for b in range(6):                      # muffled heartbeat kick 0 .. 3 s
    dry.add(kick(0.55, muffled=True), b * BEAT)
for i in range(16):                     # soft 16th hats creeping in
    t0 = 0.0 + i * 0.125
    dry.add(hat(), t0, 0.1 + 0.08 * (i % 4 == 2))
# "that's a lot of stops" (2 - 3 s): lower Bb arpeggio, quieter
for i, nm in enumerate(["Bb3", "D4", "F4", "Bb4", "D5", "F4", "D4", "Bb3"]):
    both(pluck(n(nm), 0.7, 0.6), 2.0 + i * 0.125, 0.28, pan=(-0.5 if i % 2 else 0.5), verb=0.3, delay=0.35)
# train running along the route
fx.add(whoosh(1.05, 250, 2400, 0.6, -0.9, 0.9), 2.0, 0.28)
# collapse: suck-in into "ONE"
fx.add(reverse_swell(0.5), F(210) - 0.5, 0.45)
# "ONE"
dry.add(tom(0.7), F(210), 0.8)
both(pluck(n("D3"), 1.2, 0.4), F(210), 0.5, verb=0.5)
# riser into the drop (cut 2 frames early for a breath)
r = riser(F(238) - 2.4)
music.add(r, 2.4, 0.33)
verb_send.add(r, 2.4, 0.12)

# --- MAIN GROOVE bars 2..9 (4 - 20 s) and bars 12..13a (24 - 26.5 s)
def groove(bar_from, bar_to, chords, arp=False, hats16=False, stop_at=None):
    for bi, bar in enumerate(range(bar_from, bar_to)):
        t_bar = bar * BAR
        ch = chords[bi % len(chords)]
        for b in range(4):
            tb = t_bar + b * BEAT
            if stop_at is not None and tb >= stop_at:
                continue
            dry.add(kick(1.0, ad=0.2), tb, 0.8)
            kick_times.append(tb)
            if b in (1, 3):
                dry.add(clap(), tb, 0.95)
                verb_send.add(clap(), tb, 0.3)
            dry.add(hat(open_=True), tb + BEAT / 2, 0.3)
        for s16 in range(16):
            ts = t_bar + s16 * BEAT / 4
            if stop_at is not None and ts >= stop_at:
                continue
            if s16 % 4 != 2 and (hats16 or s16 % 2 == 0):
                dry.add(hat(), ts, 0.17 if s16 % 2 else 0.24, pan=0.25)
        # bass: pumping off-beat 8ths + root on 1
        for e8 in range(8):
            te = t_bar + e8 * BEAT / 2
            if stop_at is not None and te >= stop_at:
                continue
            if e8 % 2 == 1 or e8 == 0:
                oct_up = 12 if e8 in (3, 7) else 0
                music.add(bass(ROOT[ch] + oct_up, 0.2), te, 0.34)
        # syncopated chord stabs (3-3-2 feel)
        for s16 in (0, 3, 6, 10, 12):
            ts = t_bar + s16 * BEAT / 4
            if stop_at is not None and ts >= stop_at:
                continue
            both(stab(CH[ch], 0.3), ts, 0.95, verb=0.3)
        if arp:
            tones = CH[ch] + [m + 12 for m in CH[ch]]
            pattern = [0, 2, 4, 1, 3, 5, 2, 4]
            for s16 in range(16):
                ts = t_bar + s16 * BEAT / 4
                if stop_at is not None and ts >= stop_at:
                    continue
                m = tones[pattern[s16 % 8] % len(tones)] + 12
                both(pluck(m, 0.35, 1.4), ts, 0.34, pan=(0.45 if s16 % 2 else -0.45), delay=0.3)


groove(2, 6, PROG)                              # logo + Muhsin
groove(6, 10, PROG, arp=True)                   # Pavitra + Hatim (lift)
groove(12, 14, ["Dm", "Bb"], arp=True, hats16=True, stop_at=26.5)   # services

# DROP 1 impact
fx.add(impact(2.6, 1.0), 4.0, 0.75)
verb_send.add(impact(2.6, 1.0), 4.0, 0.25)

# logo names chime (frames 300/315/330) — the "three lines" motif
for i, nm in enumerate(["D5", "F5", "A5"]):
    both(vibe(n(nm), 2.4), F(300 + 15 * i), 0.34, pan=(-0.4 + 0.4 * i), verb=0.45, delay=0.2)

# zoom-through the ring (frames 440 -> 480)
fx.add(whoosh(0.72, 200, 6000, 0.92, 0.0, 0.0), F(440), 0.42)
fx.add(reverse_swell(0.6), F(480) - 0.6, 0.25)

# member entrances + station arrivals
member_starts = [480, 720, 960]
member_note = [n("A5"), n("D6"), n("F6")]
for mi, ms in enumerate(member_starts):
    fx.add(impact(1.2, 0.4), F(ms), 0.32)
    for k in range(4):                          # station pops on each beat
        tf = ms + 30 * (k + 1)
        dry.add(tick(2400 + 300 * k, 0.05), F(tf), 0.16, pan=-0.6 + 0.4 * k)
        both(vibe(member_note[mi] + [0, 3, 7, 12][k] - 12, 0.6), F(tf), 0.08, verb=0.3)
    for c in range(6):                          # skill chips
        dry.add(tick(4200, 0.03), F(ms + 40 + 6 * c), 0.05, pan=0.6)

# whip transitions
fx.add(whoosh(0.5, 300, 5200, 0.5, 0.0, 0.0), F(720) - 0.25, 0.55)   # vertical whip
fx.add(whoosh(0.5, 300, 5200, 0.5, 0.9, -0.9), F(960) - 0.25, 0.55)  # horizontal whip
fx.add(whoosh(0.7, 250, 4000, 0.45, -0.9, 0.9), F(1200) - 0.4, 0.55) # stripe wipe

# --- BREAKDOWN bars 10..11 (20 - 24 s): the crew
music.add(pad(CH["Bb"] + [n("F5")], 2.3, 1400, 0.25, 0.6), 20.0, 0.34)
music.add(pad(CH["C"] + [n("G5")], 2.3, 1600, 0.25, 0.6), 22.0, 0.34)
verb_send.add(pad(CH["Bb"], 2.3, 1200), 20.0, 0.12)
for bi, ch in enumerate(["Bb", "C"]):
    tones = CH[ch] + [m + 12 for m in CH[ch]]
    for s8 in range(8):
        ts = 20.0 + bi * BAR + s8 * BEAT / 2
        both(pluck(tones[[0, 2, 4, 1, 3, 5, 4, 2][s8]] + 12, 0.5, 0.5), ts, 0.14,
             pan=(0.5 if s8 % 2 else -0.5), verb=0.3, delay=0.45)
    music.add(bass(ROOT[ch], 1.6) * np.linspace(1, 0.2, int(1.6 * SR)), 20.0 + bi * BAR, 0.28)
dry.add(impact(1.6, 0.5), 20.0, 0.3)
# soft claps with big room on beat 3 of each bar
for tb in (21.0, 23.0):
    dry.add(clap(), tb, 0.25)
    verb_send.add(clap(), tb, 0.35)
# photo cards landing (frames 1210, 1290)
fx.add(paper(), F(1210), 0.35)
fx.add(paper(), F(1290), 0.35)
# build: snare roll + riser into drop 2 (23 -> 24 s)
roll_t = 22.0
step = 0.25
while roll_t < 23.95:
    lvl = 0.15 + 0.45 * ((roll_t - 22.0) / 2.0) ** 1.5
    dry.add(snare(0.2, 180 + 120 * (roll_t - 22.0)), roll_t, lvl)
    roll_t += step
    if roll_t > 23.0:
        step = 0.0625
    elif roll_t > 22.5:
        step = 0.125
rz = riser(1.95)
music.add(rz, 22.0, 0.3)

# --- DROP 2 (24 s): services
fx.add(impact(2.0, 0.7), 24.0, 0.6)
for i in range(8):                               # tiles on 16ths from frame 1448
    tf = 1448 + round(7.5 * i)
    dry.add(tick(2000 + 220 * i, 0.05), F(tf), 0.2, pan=-0.7 + 0.2 * i)
fx.add(whoosh(0.5, 400, 6000, 0.5, -0.6, 0.6), F(1560) - 0.2, 0.3)   # tile wave

# suck-in (26.5 -> 27 s) then the final BOOM
fx.add(reverse_swell(0.5), 26.5, 0.6)
fx.add(impact(3.0, 1.4), 27.0, 0.95)
verb_send.add(impact(3.0, 1.4), 27.0, 0.3)
final = pad(CH["D"] + [n("A3")], 2.9, 2600, 0.005, 1.6)
music.add(final, 27.0, 0.42)
verb_send.add(final, 27.0, 0.25)
music.add(bass(n("D2"), 2.6) * np.exp(-T(2.6) / 1.0), 27.0, 0.45)
# sonic logo: three rising chimes, then the octave
for i, nm in enumerate(["D5", "F#5", "A5", "D6"]):
    both(vibe(n(nm), 2.0), F(1680 + 15 * i), 0.36 if i < 3 else 0.28, pan=(-0.4 + 0.27 * i),
         verb=0.5, delay=0.2)

# ---------------------------------------------------------------- mixing
t_all = np.arange(N) / SR
# sidechain from the groove kicks
duck = np.ones(N)
for tk in kick_times:
    i0 = int(tk * SR)
    L = int(0.32 * SR)
    seg = t_all[:L]
    shape = 1 - 0.62 * np.exp(-seg / 0.09) * np.minimum(1, seg / 0.004 + 0.4)
    m = min(L, N - i0)
    duck[i0:i0 + m] = np.minimum(duck[i0:i0 + m], shape[:m])
music.x *= duck

# ping-pong delay (dotted 8th)
d = int(0.375 * SR)
delay_out = np.zeros((2, N))
src = delay_send.x.sum(0) * 0.5
fb = 0.42
for tap in range(1, 7):
    off = d * tap
    if off >= N:
        break
    ch = tap % 2
    delay_out[ch, off:] += src[:N - off] * fb ** (tap - 1)
delay_out = np.vstack([lp(hp(delay_out[0], 300), 5000), lp(hp(delay_out[1], 300), 5000)])

# convolution reverb, stereo synthetic room
ir_len = int(2.4 * SR)
ti = np.arange(ir_len) / SR
irs = []
for c in range(2):
    ir = rng.standard_normal(ir_len) * np.exp(-ti / 0.42)
    ir = lp(ir, 7000) * 0.6 + lp(ir, 2500) * 0.4
    ir[: int(0.018 * SR)] = 0
    irs.append(ir / np.sqrt((ir ** 2).sum()))
verb_out = np.vstack([signal.fftconvolve(verb_send.x[c], irs[c])[:N] for c in range(2)])
verb_out = np.vstack([hp(verb_out[0], 250), hp(verb_out[1], 250)])

mix = dry.x * 1.0 + music.x * 1.0 + fx.x * 1.0 + delay_out * 0.55 + verb_out * 1.1

# gentle master: low-cut, tilt, soft clip, fade tail
mix = np.vstack([hp(mix[0], 30), hp(mix[1], 30)])
# tilt: tame the sub, open up presence + air so it translates to phone speakers
lows = np.vstack([lp(mix[0], 110), lp(mix[1], 110)])
highs = np.vstack([hp(mix[0], 2500), hp(mix[1], 2500)])
mix = mix - 0.5 * lows + 1.0 * highs
peak = np.abs(mix).max()
mix = mix / peak * 2.1
mix = np.tanh(mix * 1.2) / np.tanh(1.2 * 2.1)
fade = np.ones(N)
fl = int(0.35 * SR)
fade[-fl:] = np.linspace(1, 0, fl) ** 2
mix *= fade
mix = mix / np.abs(mix).max() * 10 ** (-1.0 / 20)

import sys
out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "public" / "audio" / "onestop.wav"
out.parent.mkdir(parents=True, exist_ok=True)
wavfile.write(out, SR, (mix.T * 32767).astype(np.int16))
rms = np.sqrt((mix ** 2).mean())
print(f"wrote {out}  ({DUR}s, peak -1 dBFS, rms {20 * np.log10(rms):.1f} dBFS)")
