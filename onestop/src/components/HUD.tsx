import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, MONO, creamA} from '../theme';
import {T, FPS, W} from '../timeline';
import {ease, prog, tw} from '../lib/anim';

const STOPS = [
	{at: 0, label: 'INTRO', color: C.cream},
	{at: T.muhsin, label: 'MUHSIN', color: C.marigold},
	{at: T.pavitra, label: 'PAVITRA', color: C.berry},
	{at: T.hatim, label: 'HATIM', color: C.cobalt},
	{at: T.crew, label: 'CREW', color: C.marigold},
	{at: T.services, label: 'SERVICES', color: C.cream},
	{at: T.outro, label: 'ONESTOP', color: C.cream},
];

const X0 = 120;
const X1 = W - 120;
const xAt = (frame: number) => X0 + (X1 - X0) * (frame / T.end);

/** Designer's frame: corner marks, running timecode, a journey bar with every stop. */
export const HUD: React.FC<{f: number}> = ({f}) => {
	const show = ease.outExpo(prog(f, T.drop + 8, 30)) * (1 - ease.inCubic(prog(f, 1738, 26)));
	if (show <= 0) return null;
	const arm = 44 * ease.outExpo(prog(f, T.drop + 8, 26));
	const cur = [...STOPS].reverse().find((s) => f >= s.at) ?? STOPS[0];
	const s = Math.floor(f / FPS);
	const fr = f % FPS;
	const tc = `00:00:${String(s).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
	const barIn = ease.outExpo(prog(f, T.drop + 14, 40));
	const head = xAt(f);

	const corner = (x: number, y: number, sx: number, sy: number) => (
		<div
			style={{
				position: 'absolute',
				left: x,
				top: y,
				width: arm,
				height: arm,
				borderLeft: `2px solid ${creamA(0.5)}`,
				borderTop: `2px solid ${creamA(0.5)}`,
				transform: `scale(${sx}, ${sy})`,
				transformOrigin: '0 0',
			}}
		/>
	);

	const label: React.CSSProperties = {
		position: 'absolute',
		fontFamily: MONO,
		fontSize: 15,
		letterSpacing: '0.22em',
		color: creamA(0.6),
		fontWeight: 500,
	};

	return (
		<AbsoluteFill style={{opacity: show, pointerEvents: 'none'}}>
			{corner(40, 40, 1, 1)}
			{corner(W - 40, 40, -1, 1)}
			{corner(40, 1040, 1, -1)}
			{corner(W - 40, 1040, -1, -1)}
			<div style={{...label, left: 72, top: 58}}>
				<span style={{color: C.cream}}>ONESTOP</span> / LINE MAP
			</div>
			<div style={{...label, right: 72, top: 58, textAlign: 'right'}}>
				<span style={{color: cur.color}}>●</span> {cur.label} &nbsp; {tc}
			</div>
			{/* journey bar */}
			<div
				style={{
					position: 'absolute',
					left: X0,
					top: 1018,
					width: (X1 - X0) * barIn,
					height: 2,
					background: creamA(0.16),
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: X0,
					top: 1018,
					width: Math.max(0, head - X0) * barIn,
					height: 2,
					background: cur.color,
				}}
			/>
			{STOPS.map((st, i) => {
				const x = xAt(st.at);
				const passed = f >= st.at;
				const pop = ease.outBack(prog(f, T.drop + 20 + i * 3, 14));
				return (
					<div key={st.label} style={{position: 'absolute', left: x, top: 1019, opacity: barIn}}>
						<div
							style={{
								position: 'absolute',
								left: -6,
								top: -6,
								width: 12,
								height: 12,
								borderRadius: 6,
								background: passed ? st.color : C.ink,
								border: `2px solid ${passed ? st.color : creamA(0.4)}`,
								transform: `scale(${pop})`,
								boxSizing: 'border-box',
							}}
						/>
						<div
							style={{
								...label,
								fontSize: 11,
								top: -30,
								left: 0,
								transform: 'translateX(-50%)',
								whiteSpace: 'nowrap',
								color: cur === st ? st.color : creamA(passed ? 0.55 : 0.3),
							}}
						>
							{st.label}
						</div>
					</div>
				);
			})}
			{/* playhead */}
			<div
				style={{
					position: 'absolute',
					left: head - 9,
					top: 1010,
					width: 18,
					height: 18,
					borderRadius: 9,
					background: cur.color,
					boxShadow: `0 0 18px ${cur.color}`,
					opacity: barIn,
					transform: `scale(${tw(f % 30, 0, 12, 1.35, 1, ease.outCubic)})`,
				}}
			/>
		</AbsoluteFill>
	);
};
