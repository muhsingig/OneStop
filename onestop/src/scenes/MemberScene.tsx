import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {C, MONO, SANS, SERIF, creamA, inkA} from '../theme';
import {ease, mix, prog, sp, tw, wobble} from '../lib/anim';
import {Reveal} from '../components/Reveal';
import {Member} from '../data';

const LINE_Y = 792;
const STATION_X = [330, 760, 1190, 1620];
// line grows station-to-station, arriving on every beat (t = 30, 60, 90, 120)
const SEGMENTS = [
	{from: -140, to: 0, start: 4, dur: 26},
	{from: 0, to: 1, start: 42, dur: 18},
	{from: 1, to: 2, start: 72, dur: 18},
	{from: 2, to: 3, start: 102, dur: 18},
	{from: 3, to: 2300, start: 134, dur: 30},
];
const ARRIVE = [30, 60, 90, 120];

const Check: React.FC<{color: string}> = ({color}) => (
	<svg width={16} height={16} viewBox="0 0 16 16" style={{marginRight: 10}}>
		<path d="M2 8.5 L6.2 12.5 L14 3.5" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const PORTRAIT = {x: 1632, y: 402, r: 208};

/** The member's photo, framed as a station: ring draws on, photo irises open, a dial orbits. */
const Portrait: React.FC<{m: Member; t: number; drift: number}> = ({m, t, drift}) => {
	const {r} = PORTRAIT;
	const ph = m.photo;
	const k = (2 * r) / ph.side;
	const reveal = ease.outExpo(prog(t, 6, 26));
	const ringDraw = ease.outExpo(prog(t, 0, 30));
	const imgScale = tw(t, 6, 44, 1.32, 1.06) - tw(t, 50, 200, 0, 0.05, ease.linear);
	const bob = wobble(m.key + 'bob', t, 0.015) * 6;
	const pill = sp(t, 26, {damping: 11, stiffness: 260});
	const circ = 2 * Math.PI * r;
	return (
		<div
			style={{
				position: 'absolute',
				left: PORTRAIT.x + drift - r,
				top: PORTRAIT.y - r + bob,
				width: 2 * r,
				height: 2 * r,
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: -70,
					borderRadius: '50%',
					background: `radial-gradient(circle, ${m.color}50, transparent 62%)`,
					opacity: reveal,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: '50%',
					overflow: 'hidden',
					clipPath: `circle(${reveal * 50}% at 50% 50%)`,
					background: C.ink2,
				}}
			>
				<Img
					src={staticFile(ph.src)}
					style={{
						position: 'absolute',
						maxWidth: 'none',
						width: ph.w * k,
						height: ph.h * k,
						left: r - ph.cx * k,
						top: r - ph.cy * k,
						transform: `scale(${imgScale})`,
						transformOrigin: `${ph.cx * k}px ${ph.cy * k}px`,
					}}
				/>
				<AbsoluteFill style={{background: `linear-gradient(180deg, transparent 58%, ${inkA(0.4)})`}} />
			</div>
			<svg
				width={2 * r + 100}
				height={2 * r + 100}
				style={{position: 'absolute', left: -50, top: -50, overflow: 'visible'}}
			>
				<g transform={`translate(${r + 50} ${r + 50})`}>
					<circle
						r={r}
						fill="none"
						stroke={C.cream}
						strokeWidth={12}
						strokeDasharray={circ}
						strokeDashoffset={circ * (1 - ringDraw)}
						transform="rotate(-90)"
					/>
					<g transform={`rotate(${t * 0.55 - 40})`} opacity={reveal}>
						<circle r={r + 28} fill="none" stroke={m.color} strokeWidth={2.5} strokeDasharray="3 11" />
						<circle cx={r + 28} cy={0} r={8} fill={m.color} />
					</g>
				</g>
			</svg>
			<div
				style={{
					position: 'absolute',
					left: r,
					top: 2 * r - 4,
					transform: `translate(-50%, -50%) scale(${t < 26 ? 0 : pill})`,
					display: 'flex',
					alignItems: 'center',
					gap: 10,
					padding: '9px 18px',
					borderRadius: 30,
					background: m.color,
					color: C.ink,
					fontFamily: MONO,
					fontWeight: 700,
					fontSize: 14,
					letterSpacing: '0.22em',
					whiteSpace: 'nowrap',
				}}
			>
				<span
					style={{
						width: 8,
						height: 8,
						borderRadius: 4,
						background: C.ink,
						opacity: Math.floor(t / 15) % 2 ? 0.3 : 1,
					}}
				/>
				NOW ARRIVING
			</div>
		</div>
	);
};

export const MemberScene: React.FC<{m: Member; t: number; zoomIn?: boolean}> = ({m, t, zoomIn}) => {
	const col = m.color;
	const nameDrift = tw(t, -12, 264, 26, -34, ease.linear);
	const lineDrift = tw(t, -12, 264, 60, -90, ease.linear);
	const bgDrift = tw(t, -12, 264, 40, -40, ease.linear);
	const xs = STATION_X.map((x) => x + lineDrift);

	// resolve how far the line has been drawn
	const resolve = (v: number) => (v >= 0 && v < 10 ? xs[v] : v + (v < 0 ? lineDrift : 0));
	let drawn = -400;
	for (const s of SEGMENTS) {
		if (t >= s.start) drawn = mix(resolve(s.from), resolve(s.to), ease.inOutCubic(prog(t, s.start, s.dur)));
	}

	// train runs the finished line
	const trainT = prog(t, 146, 88);
	const trainX = mix(-200, 2200, ease.inOutQuart(trainT));

	const enter = zoomIn
		? {
				s: tw(t, 0, 26, 1.4, 1),
				o: tw(t, 0, 6, 0, 1, ease.linear),
				b: tw(t, 0, 16, 14, 0),
			}
		: {s: 1, o: 1, b: 0};

	return (
		<AbsoluteFill
			style={{
				background: C.ink,
				transform: `scale(${enter.s})`,
				opacity: enter.o,
				filter: enter.b > 0.2 ? `blur(${enter.b}px)` : undefined,
			}}
		>
			{/* colour glow + dot grid */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at ${82 + wobble(m.key + 'g', t, 0.01) * 4}% 18%, ${col}40, transparent 52%)`,
				}}
			/>
			<AbsoluteFill
				style={{
					backgroundImage: `radial-gradient(${creamA(0.07)} 1.3px, transparent 1.9px)`,
					backgroundSize: '36px 36px',
					backgroundPosition: `${bgDrift}px 0px`,
				}}
			/>
			{/* giant outlined line number */}
			<div
				style={{
					position: 'absolute',
					right: 60 - bgDrift * 0.6,
					top: 20,
					fontFamily: SANS,
					fontWeight: 900,
					fontSize: 620,
					lineHeight: 1,
					letterSpacing: '-0.05em',
					color: 'transparent',
					WebkitTextStroke: `2px ${creamA(0.09)}`,
					transform: `translateY(${tw(t, -10, 40, 80, 0)}px)`,
				}}
			>
				{m.index}
			</div>

			<Portrait m={m} t={t} drift={nameDrift * 0.5} />

			{/* header: line badge */}
			<div
				style={{
					position: 'absolute',
					left: 110,
					top: 104,
					display: 'flex',
					alignItems: 'center',
					gap: 20,
				}}
			>
				<div
					style={{
						width: 60,
						height: 60,
						borderRadius: 30,
						background: col,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: SANS,
						fontWeight: 900,
						fontSize: 30,
						color: C.ink,
						transform: `scale(${sp(t, -8, {damping: 10, stiffness: 260})}) rotate(${tw(t, -8, 20, -90, 0)}deg)`,
					}}
				>
					{m.key}
				</div>
				<div style={{fontFamily: MONO, fontSize: 17, letterSpacing: '0.24em', lineHeight: 1.5}}>
					<Reveal text={`LINE ${m.index}`} f={t} start={-4} stagger={0.6} dur={12} style={{color: col, fontWeight: 700}} />
					<br />
					<Reveal text="TOWARDS ONESTOP →" f={t} start={2} stagger={0.5} dur={12} style={{color: creamA(0.6)}} />
				</div>
			</div>

			{/* the name, with two lagging outline echoes */}
			<div style={{position: 'absolute', left: 104 + nameDrift, top: 168}}>
				{[2, 1].map((k) => (
					<div
						key={k}
						style={{
							position: 'absolute',
							left: k * (9 + wobble(m.key + k, t, 0.02) * 3),
							top: k * (9 + wobble(m.key + 'y' + k, t, 0.02) * 3),
							opacity: 0.55 / k,
						}}
					>
						<Reveal
							text={m.first}
							f={t}
							start={4 + k * 4}
							stagger={2}
							dur={22}
							style={{
								fontFamily: SANS,
								fontWeight: 900,
								fontSize: 300,
								lineHeight: 1,
								letterSpacing: '-0.045em',
								color: 'transparent',
								WebkitTextStroke: `2.5px ${col}`,
							}}
						/>
					</div>
				))}
				<Reveal
					text={m.first}
					f={t}
					start={2}
					stagger={2}
					dur={22}
					style={{
						position: 'relative',
						fontFamily: SANS,
						fontWeight: 900,
						fontSize: 300,
						lineHeight: 1,
						letterSpacing: '-0.045em',
						color: C.cream,
					}}
				/>
			</div>

			{/* surname — role */}
			<div
				style={{
					position: 'absolute',
					left: 114 + nameDrift * 0.8,
					top: 500,
					display: 'flex',
					alignItems: 'baseline',
					gap: 28,
				}}
			>
				<Reveal
					text={m.last}
					f={t}
					start={16}
					stagger={0.8}
					dur={14}
					style={{fontFamily: MONO, fontWeight: 500, fontSize: 24, letterSpacing: '0.42em', color: creamA(0.6)}}
				/>
				<div
					style={{
						width: tw(t, 20, 20, 0, 70),
						height: 2,
						background: creamA(0.4),
						alignSelf: 'center',
					}}
				/>
				<Reveal
					text={m.role}
					by="word"
					f={t}
					start={24}
					stagger={3}
					dur={20}
					style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 88, color: col, lineHeight: 1}}
				/>
			</div>

			{/* skill chips */}
			<div
				style={{
					position: 'absolute',
					left: 110 + nameDrift * 0.6,
					top: 624,
					display: 'flex',
					gap: 14,
				}}
			>
				{m.chips.map((c, i) => {
					const at = 38 + i * 5;
					const s = sp(t, at, {damping: 11, stiffness: 280});
					return (
						<div
							key={c.label}
							style={{
								display: 'flex',
								alignItems: 'center',
								padding: '11px 22px',
								borderRadius: 40,
								border: `1.5px solid ${c.cert ? col : creamA(0.28)}`,
								background: c.cert ? `${col}1F` : 'transparent',
								fontFamily: MONO,
								fontWeight: 500,
								fontSize: 19,
								letterSpacing: '0.04em',
								color: c.cert ? col : creamA(0.85),
								transform: `translateY(${(1 - s) * 30}px) scale(${0.7 + 0.3 * s})`,
								opacity: t < at ? 0 : Math.min(1, (t - at) / 4),
							}}
						>
							{c.cert ? <Check color={col} /> : null}
							{c.label}
						</div>
					);
				})}
			</div>

			{/* the line */}
			<div
				style={{
					position: 'absolute',
					left: -400,
					top: LINE_Y - 10,
					width: Math.max(0, drawn + 400),
					height: 20,
					background: col,
					borderRadius: 10,
				}}
			/>
			{trainT > 0 && trainT < 1 ? (
				<div
					style={{
						position: 'absolute',
						left: trainX - 110,
						top: LINE_Y - 5,
						width: 110,
						height: 10,
						borderRadius: 5,
						background: `linear-gradient(90deg, transparent, ${C.cream})`,
						boxShadow: `0 0 18px ${C.cream}`,
					}}
				/>
			) : null}
			{xs.map((x, k) => {
				const at = ARRIVE[k];
				if (t < at - 1) return null;
				const s = sp(t, at - 1, {damping: 9, stiffness: 320});
				const pass = Math.exp(-(((trainX - x) / 60) ** 2)) * (trainT > 0 && trainT < 1 ? 1 : 0);
				const st = m.stations[k];
				return (
					<React.Fragment key={k}>
						<div
							style={{
								position: 'absolute',
								left: x - 24,
								top: LINE_Y - 24,
								width: 48,
								height: 48,
								borderRadius: 24,
								background: C.ink,
								border: `8px solid ${C.cream}`,
								boxSizing: 'border-box',
								transform: `scale(${s * (1 + 0.3 * pass)})`,
								boxShadow: pass > 0.1 ? `0 0 ${30 * pass}px ${C.cream}` : undefined,
							}}
						/>
						{/* arrival ping */}
						<div
							style={{
								position: 'absolute',
								left: x - 24,
								top: LINE_Y - 24,
								width: 48,
								height: 48,
								borderRadius: 24,
								border: `3px solid ${col}`,
								transform: `scale(${1 + ease.outCubic(prog(t, at, 26)) * 2.6})`,
								opacity: 1 - prog(t, at, 26),
							}}
						/>
						<div
							style={{
								position: 'absolute',
								left: x - 200,
								width: 400,
								top: LINE_Y + 44,
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								gap: 10,
							}}
						>
							<Reveal
								text={st.name}
								f={t}
								start={at + 1}
								stagger={0.8}
								dur={14}
								style={{fontFamily: SANS, fontWeight: 800, fontSize: 36, color: C.cream, letterSpacing: '-0.01em'}}
							/>
							<Reveal
								text={st.sub}
								f={t}
								start={at + 5}
								stagger={0.4}
								dur={12}
								style={{fontFamily: MONO, fontSize: 16, letterSpacing: '0.16em', color: creamA(0.62)}}
							/>
						</div>
					</React.Fragment>
				);
			})}
		</AbsoluteFill>
	);
};
