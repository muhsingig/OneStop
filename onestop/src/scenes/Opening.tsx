import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {evolvePath, getLength, getPointAtLength} from '@remotion/paths';
import {C, MONO, SANS, SERIF, creamA} from '../theme';
import {T} from '../timeline';
import {ease, mix, prog, shake, sp, tw} from '../lib/anim';
import {metroRoute, metroSeg, Pt} from '../lib/metro';
import {Reveal} from '../components/Reveal';
import {RING, Wordmark, ring1X, wordW} from '../components/Wordmark';

// ------------------------------------------------------------------ geometry
export const WM_SIZE = 230;
const W_FULL = wordW(WM_SIZE);
const W_ONE = wordW(WM_SIZE, 0, 3);
const YC = 500;
const RC: Pt = [960 - W_FULL / 2 + ring1X(WM_SIZE), YC]; // first O, final lockup
const SHIFT_A = (W_FULL - W_ONE) / 2; // "ONE" alone is centred
const MERGE: Pt = [RC[0] + SHIFT_A, YC];
const RING_D = RING.d * WM_SIZE;
const RING_RM = RING_D / 2 - (RING.stroke * WM_SIZE) / 2;

// ------------------------------------------------------------------ the hook
const WORDS = ['STRATEGY', 'ads', 'SEO', 'SOCIAL', 'content', 'WEB', 'DATA', 'EVENTS'];
const STATIONS: Pt[] = [
	[300, 330],
	[720, 190],
	[1190, 300],
	[1620, 210],
	[1580, 640],
	[1120, 850],
	[640, 720],
	[250, 880],
];
const SEG_COLORS = [C.marigold, C.berry, C.cobalt];
const WORD_TILT = [0, -3, 0, 2, -2, -5, 0, 3];

const HookWord: React.FC<{i: number; lt: number}> = ({i, lt}) => {
	const base: React.CSSProperties = {fontFamily: SANS, fontWeight: 900, lineHeight: 1, color: C.cream};
	switch (i) {
		case 0:
			return (
				<Reveal
					text="STRATEGY"
					f={lt}
					start={-7}
					stagger={0.9}
					dur={10}
					style={{...base, fontSize: 230, letterSpacing: '-0.045em'}}
				/>
			);
		case 1: {
			const s = tw(lt, 0, 10, 1.7, 1);
			return (
				<div
					style={{
						fontFamily: SERIF,
						fontStyle: 'italic',
						fontSize: 340,
						lineHeight: 1,
						color: C.marigold,
						transform: `scale(${s})`,
						filter: `blur(${tw(lt, 0, 8, 16, 0)}px)`,
						opacity: tw(lt, 0, 3, 0, 1, ease.linear),
						paddingRight: 30,
					}}
				>
					ads
				</div>
			);
		}
		case 2:
			return (
				<div
					style={{
						...base,
						fontSize: 330,
						color: 'transparent',
						WebkitTextStroke: `5px ${C.cream}`,
						letterSpacing: `${tw(lt, 0, 12, 0.55, -0.02)}em`,
						marginRight: `${-tw(lt, 0, 12, 0.55, -0.02)}em`,
					}}
				>
					SEO
				</div>
			);
		case 3: {
			const sx = tw(lt, 0, 8, 0, 1);
			return (
				<div style={{position: 'relative', padding: '10px 36px 18px'}}>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							background: C.berry,
							transform: `scaleX(${sx})`,
							transformOrigin: '0% 50%',
						}}
					/>
					<div
						style={{
							...base,
							position: 'relative',
							fontSize: 200,
							color: C.ink,
							letterSpacing: '-0.04em',
							transform: `translateX(${tw(lt, 1, 10, -70, 0)}px)`,
							clipPath: `inset(0 ${(1 - sx) * 100}% 0 0)`,
						}}
					>
						SOCIAL
					</div>
				</div>
			);
		}
		case 4:
			return (
				<div
					style={{
						fontFamily: SERIF,
						fontStyle: 'italic',
						fontSize: 290,
						lineHeight: 1,
						color: C.cream,
						transform: `translateX(${tw(lt, 0, 11, 180, 0)}px) skewX(${tw(lt, 0, 11, -22, 0)}deg)`,
						opacity: tw(lt, 0, 3, 0, 1, ease.linear),
						paddingRight: 30,
					}}
				>
					content
				</div>
			);
		case 5: {
			const s = sp(lt, 0, {damping: 9, stiffness: 320});
			return (
				<div
					style={{
						background: C.cobalt,
						padding: '6px 40px 16px',
						transform: `scale(${0.3 + 0.7 * s})`,
					}}
				>
					<div style={{...base, fontSize: 260, letterSpacing: '-0.04em'}}>WEB</div>
				</div>
			);
		}
		case 6: {
			const glyphs = '#%&@$*+=<>/01';
			const txt = 'DATA'
				.split('')
				.map((ch, k) => (lt >= 2 + k * 1.6 ? ch : glyphs[Math.floor(random(`d${k}${Math.floor(lt)}`) * glyphs.length)]))
				.join('');
			return (
				<div style={{fontFamily: MONO, fontWeight: 700, fontSize: 210, lineHeight: 1, color: C.marigold}}>
					<span style={{color: creamA(0.45)}}>[</span>
					{txt}
					<span style={{color: creamA(0.45)}}>]</span>
				</div>
			);
		}
		default:
			return (
				<div style={{position: 'relative'}}>
					<Reveal
						text="EVENTS"
						f={lt}
						start={0}
						stagger={1}
						dur={11}
						rotate={14}
						style={{...base, fontSize: 240, letterSpacing: '-0.045em'}}
					/>
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							bottom: -6,
							height: 16,
							background: C.marigold,
							transform: `scaleX(${tw(lt, 3, 10, 0, 1)})`,
							transformOrigin: '0 50%',
						}}
					/>
				</div>
			);
	}
};

const HookMap: React.FC<{f: number}> = ({f}) => {
	if (f > 214) return null;
	// collapse towards the merge point
	const pos: Pt[] = STATIONS.map((p, i) => {
		const k = ease.inOutExpo(prog(f, 180 + i * 1.5, 17));
		return [mix(p[0], MERGE[0], k), mix(p[1], MERGE[1], k)];
	});
	const routeFade = 1 - prog(f, 188, 16);
	const labelFade = 1 - prog(f, 178, 10);
	const route = metroRoute(pos);
	const len = getLength(route);
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
				{pos.slice(1).map((b, i) => {
					const a = pos[i];
					const d = metroSeg(a, b);
					const pr = ease.inOutCubic(prog(f, 15 * i + 5, 12));
					if (pr <= 0) return null;
					const ev = evolvePath(pr, d);
					return (
						<path
							key={i}
							d={d}
							fill="none"
							stroke={SEG_COLORS[i % 3]}
							strokeWidth={11}
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeDasharray={ev.strokeDasharray}
							strokeDashoffset={ev.strokeDashoffset}
							opacity={routeFade}
						/>
					);
				})}
				{/* the long way round: a train runs the whole messy route */}
				{f >= 122 && f < 180
					? [0, 1, 2, 3].map((k) => {
							const t = ease.inOutCubic(prog(f - k * 1.4, 122, 54));
							const pt = getPointAtLength(route, len * t);
							return (
								<circle
									key={k}
									cx={pt.x}
									cy={pt.y}
									r={10 - k * 2}
									fill={C.cream}
									opacity={(1 - k * 0.25) * (1 - prog(f, 174, 6))}
									style={{filter: k === 0 ? `drop-shadow(0 0 10px ${C.cream})` : undefined}}
								/>
							);
						})
					: null}
				{pos.map((p, i) => {
					const s = sp(f, 15 * i + 1, {damping: 10, stiffness: 320});
					if (f < 15 * i + 1) return null;
					const merged = f > 200;
					return (
						<g key={i} transform={`translate(${p[0]} ${p[1]}) scale(${s})`}>
							<circle r={15} fill={merged ? C.cream : C.ink} stroke={C.cream} strokeWidth={6} />
						</g>
					);
				})}
			</svg>
			{STATIONS.map((p, i) =>
				f >= 15 * i + 3 ? (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: p[0] + 26,
							top: p[1] - 38,
							fontFamily: MONO,
							fontSize: 15,
							letterSpacing: '0.18em',
							color: creamA(0.6 * labelFade),
							whiteSpace: 'nowrap',
							clipPath: `inset(0 ${(1 - ease.outExpo(prog(f, 15 * i + 3, 12))) * 100}% 0 0)`,
						}}
					>
						{String(i + 1).padStart(2, '0')} {WORDS[i].toUpperCase()}
					</div>
				) : null,
			)}
		</AbsoluteFill>
	);
};

const HookText: React.FC<{f: number}> = ({f}) => {
	const wi = Math.floor(f / 15);
	const counterStops = f < 180 ? Math.min(8, wi + 1) : 1;
	const counterFade = 1 - prog(f, 200, 12);
	const mono: React.CSSProperties = {
		position: 'absolute',
		fontFamily: MONO,
		letterSpacing: '0.2em',
		color: creamA(0.55),
		fontSize: 15,
	};
	return (
		<AbsoluteFill>
			{f < 120 ? (
				<div
					style={{
						position: 'absolute',
						left: 960,
						top: 540,
						transform: `translate(-50%, -50%) rotate(${WORD_TILT[wi]}deg)`,
					}}
				>
					{/* +2: every word is already on screen on its first frame — no blank flicker between cuts */}
					<HookWord i={wi} lt={f - wi * 15 + 2} />
				</div>
			) : null}
			{f >= 118 && f < 184 ? (
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 452,
						textAlign: 'center',
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					<Reveal
						text="that's a lot of stops."
						by="word"
						f={f}
						start={120}
						stagger={4}
						dur={18}
						exitAt={172}
						exitDur={10}
						style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 132, color: C.cream, lineHeight: 1}}
					/>
				</div>
			) : null}
			{f >= 184 && f < 236 ? (
				<div
					style={{
						position: 'absolute',
						left: MERGE[0] - 300,
						width: 600,
						top: YC - 250,
						display: 'flex',
						justifyContent: 'center',
						opacity: 1 - prog(f, 222, 12),
						transform: `translateY(${tw(f, 212, 24, 0, -30, ease.inCubic)}px)`,
					}}
				>
					<Reveal
						text="or just —"
						f={f}
						start={186}
						stagger={1.2}
						dur={14}
						style={{fontFamily: MONO, fontSize: 34, letterSpacing: '0.3em', color: creamA(0.75)}}
					/>
				</div>
			) : null}
			{/* route-planner counters */}
			<div style={{...mono, left: 80, top: 64, opacity: counterFade}}>ROUTE PLANNER</div>
			<div
				style={{
					...mono,
					left: 80,
					top: 90,
					fontSize: 30,
					color: C.cream,
					letterSpacing: '0.08em',
					opacity: counterFade,
				}}
			>
				STOPS <span style={{color: counterStops > 1 ? C.berry : C.marigold}}>{String(counterStops).padStart(2, '0')}</span>
			</div>
			<div style={{...mono, right: 80, top: 64, textAlign: 'right', opacity: counterFade}}>TRANSFERS</div>
			<div
				style={{
					...mono,
					right: 80,
					top: 90,
					fontSize: 30,
					color: C.cream,
					letterSpacing: '0.08em',
					textAlign: 'right',
					opacity: counterFade,
				}}
			>
				{String(Math.max(0, counterStops - 1)).padStart(2, '0')}
			</div>
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ lockup
const LINE_DY = [-30, 0, 30];
const LINE_COLS = [C.marigold, C.berry, C.cobalt];

const RingLines: React.FC<{f: number}> = ({f}) => {
	const xStart = -(RC[0] + SHIFT_A + 80);
	return (
		<svg
			width={1}
			height={1}
			style={{position: 'absolute', left: RING_D / 2, top: RING_D / 2, overflow: 'visible'}}
		>
			{/* shockwaves */}
			{[0, 4].map((d, k) => {
				const p = prog(f, T.drop + d, 36);
				if (p <= 0 || p >= 1) return null;
				return (
					<circle
						key={k}
						r={RING_D / 2 + ease.outCubic(p) * (760 - k * 200)}
						fill="none"
						stroke={k ? C.marigold : C.cream}
						strokeWidth={mix(8, 1, p)}
						opacity={(1 - p) * 0.8}
					/>
				);
			})}
			{LINE_DY.map((dy, i) => {
				const xEnd = -Math.sqrt(RING_RM * RING_RM - dy * dy);
				const pr = ease.outExpo(prog(f, T.drop + i * 2, 28));
				if (pr <= 0) return null;
				const tip = xStart + (xEnd - xStart) * pr;
				return (
					<g key={i}>
						<line x1={xStart - 1600} y1={dy} x2={tip} y2={dy} stroke={LINE_COLS[i]} strokeWidth={22} />
						{/* trains running into the stop */}
						{f > T.drop + 30
							? [0, 1].map((n) => {
									const per = 64;
									const ph = (((f - T.drop - 30 - i * 19 - n * 32) % per) + per) % per;
									const t = ease.inOutCubic(ph / per);
									const x2 = Math.min(mix(xStart, xEnd + 10, t), xEnd - 4);
									const x1 = x2 - 70;
									if (x1 > xEnd - 30) return null;
									return (
										<line
											key={n}
											x1={x1}
											y1={dy}
											x2={x2}
											y2={dy}
											stroke={C.cream}
											strokeOpacity={0.85}
											strokeWidth={8}
											strokeLinecap="round"
										/>
									);
								})
							: null}
					</g>
				);
			})}
		</svg>
	);
};

const Lockup: React.FC<{f: number}> = ({f}) => {
	if (f < 206) return null;
	const shift = f < T.drop ? SHIFT_A : SHIFT_A * (1 - ease.outExpo(prog(f, T.drop, 22)));
	const split = Math.exp(-Math.max(0, f - T.drop) / 4) * (f >= T.drop ? 1 : 0);
	const mergeDot = f < 213;
	const fx = (i: number) => {
		if (i === 0) {
			const s = sp(f, 210, {damping: 10, stiffness: 240});
			return {s: f < 210 ? 0 : 0.08 + 0.92 * s, o: f < 210 ? 0 : 1};
		}
		if (i <= 2) {
			const p = ease.outExpo(prog(f, 212 + (i - 1) * 3, 14));
			return {wipe: p, x: (1 - p) * -60, o: f < 212 ? 0 : 1};
		}
		const at = T.drop + (i - 3) * 3;
		const s = sp(f, at, {damping: 12, stiffness: 260});
		return {y: (1 - s) * -330, r: (1 - s) * (-10 + 6 * (i - 3)), o: f < at ? 0 : 1};
	};
	return (
		<AbsoluteFill>
			{mergeDot ? (
				<div
					style={{
						position: 'absolute',
						left: MERGE[0] - 15,
						top: MERGE[1] - 15,
						width: 30,
						height: 30,
						borderRadius: 15,
						background: C.cream,
						boxShadow: `0 0 30px ${C.cream}`,
					}}
				/>
			) : null}
			<div
				style={{
					position: 'absolute',
					left: 960 - W_FULL / 2 + shift,
					top: YC - WM_SIZE / 2,
					filter:
						split > 0.02
							? `drop-shadow(${-14 * split}px 0 0 ${C.berry}) drop-shadow(${14 * split}px 0 0 ${C.cobalt})`
							: undefined,
				}}
			>
				<Wordmark size={WM_SIZE} fx={fx} ring1={<RingLines f={f} />} style={{letterSpacing: 0}} />
			</div>
			{/* tagline */}
			<div style={{position: 'absolute', left: 0, right: 0, top: YC - 250, display: 'flex', justifyContent: 'center'}}>
				<Reveal
					text="three lines."
					by="word"
					f={f}
					start={348}
					stagger={5}
					dur={20}
					style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 72, color: C.cream, lineHeight: 1}}
				/>
				<span style={{width: 22}} />
				<Reveal
					text="one stop."
					by="word"
					f={f}
					start={358}
					stagger={5}
					dur={20}
					style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 72, color: C.marigold, lineHeight: 1}}
				/>
			</div>
			{/* names */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: YC + 168,
					display: 'flex',
					justifyContent: 'center',
					gap: 64,
				}}
			>
				{[
					['MUHSIN', C.marigold],
					['PAVITRA', C.berry],
					['HATIM', C.cobalt],
				].map(([name, col], i) => {
					const at = T.names + i * 15;
					const s = sp(f, at, {damping: 9, stiffness: 300});
					return (
						<div key={name} style={{display: 'flex', alignItems: 'center', gap: 18}}>
							<div
								style={{
									width: 18,
									height: 18,
									borderRadius: 9,
									background: col,
									transform: `scale(${f < at ? 0 : s})`,
									boxShadow: `0 0 16px ${col}`,
								}}
							/>
							<Reveal
								text={name}
								f={f}
								start={at + 1}
								stagger={1}
								dur={12}
								style={{fontFamily: MONO, fontWeight: 500, fontSize: 30, letterSpacing: '0.3em', color: C.cream}}
							/>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

// ------------------------------------------------------------------ scene
export const Opening: React.FC<{f: number}> = ({f}) => {
	// camera
	let s = 1;
	let r = 0;
	let x = 0;
	let y = 0;
	if (f < T.drop) {
		s = 1 + 0.03 * (f / T.drop);
		r = tw(f, 0, T.drop, -0.6, 0.3, ease.linear);
		if (f < 120) s += 0.04 * Math.exp(-(f % 15) / 3.5);
	} else {
		s = 1 + 0.035 * ease.inOutCubic(prog(f, 250, 190));
	}
	const sh1 = shake('drop', f, T.drop, 18, 8);
	const sh0 = shake('one', f, 210, 6, 5);
	x += sh1.x + sh0.x;
	y += sh1.y + sh0.y;
	r += sh1.r;
	const pz = ease.inExpo(prog(f, T.zoom, 40));
	const k = ease.inOutCubic(prog(f, T.zoom, 40));
	x += (960 - RC[0]) * k;
	y += (540 - RC[1]) * k;
	r += 9 * pz;
	const zoom = 1 + 30 * pz;
	const flash = f >= T.drop ? Math.exp(-(f - T.drop) / 3) * 0.55 : 0;

	const content = (scaleMul: number, key: string, opacity = 1) => (
		<AbsoluteFill
			key={key}
			style={{
				transformOrigin: `${RC[0]}px ${RC[1]}px`,
				transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s * zoom * scaleMul})`,
				opacity,
			}}
		>
			<HookMap f={f} />
			<HookText f={f} />
			<Lockup f={f} />
		</AbsoluteFill>
	);

	return (
		<AbsoluteFill>
			{pz > 0.02
				? [0.93, 0.86, 0.78].map((m, i) => content(1 - (1 - m) * Math.min(1, pz * 3), `ghost${i}`, 0.22))
				: null}
			{content(1, 'main')}
			{flash > 0.01 ? <AbsoluteFill style={{background: C.cream, opacity: flash}} /> : null}
		</AbsoluteFill>
	);
};
