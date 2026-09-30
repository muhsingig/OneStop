# OneStop — 30s motion piece

1920×1080 · 60 fps · 120 BPM (1 beat = 30 frames). Concept: three transit lines
(Muhsin / Pavitra / Hatim) that meet at one station — ONESTOP.

| Frames | Section |
| --- | --- |
| 0–240 | Hook: 8 services flash on 8th notes and build a messy route map, which collapses into "ONE" |
| 240–480 | Drop: "STOP" slams in, lines arrive, names chime, then the camera zooms through the O |
| 480–1200 | One line per member (station per beat), whip-pans between them |
| 1200–1440 | Breakdown: the crew photos, marigold petals |
| 1440–1620 | Second drop: services grid and a "where we've been" marquee, then everything collapses to a point |
| 1620–1800 | Boom: end card, three-note station chime, iris closes on the stop |

## Edit
- Copy (roles, stations, chips, services, brands): `src/data.ts`
- Timing constants: `src/timeline.ts` (the soundtrack in `scripts/synth.py` uses the same frames)
- Colours / fonts: `src/theme.ts`

## Commands
```
npm run dev                                  # Remotion Studio
python scripts/synth.py                      # regenerate public/audio/onestop.wav
node scripts/stills.mjs 0 400 640            # PNG stills into out/stills
npx remotion render OneStop out/OneStop.mp4 --crf 17 --audio-bitrate 320k
```
`remotion.config.ts` points at the headless Chrome in the Toy Kingdom project because this
folder's path is too long for Windows to launch the copy inside node_modules.
