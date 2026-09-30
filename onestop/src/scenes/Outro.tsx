import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, MONO, SERIF, creamA} from '../theme';
import {ease, mix, prog, shake, sp, tw} from '../lib/anim';
import {Reveal} from '../components/Reveal';
import {Wordmark} from '../components/Wordmark';
import {SUCK_TARGET} from './Services';

const CX = SUCK_TARGET.x;
const CY = SUCK_TARGET.y;
const R_OUT = 92;
const STROKE = 34;
const LINE_W = 26;

// three lines meet at one stop: from the left, the top and the right
const LINES = [
	{color: C.marigold, dx: -1, dy: 0, len: CX + 40, delay: 0},
	{color: C.berry, dx: 0, dy: -1, len: CY + 40, delay: 2},
	{color: C.cobalt, dx: 1, dy: 0, len: 1920 - CX + 40, delay: 4},
];

export const Outro: React.FC<{t: number}> = ({t}) => {
	const ring = sp(t, 0, {damping: 9, stiffness: 200});
	const sh = shake('outro', t, 0, 22, 9);
	const flash = Math.exp(-t / 3.5) * 0.7;
	const push = 1 + 0.04 * ease.inOutCubic(prog(t, 16, 150));
	const rm = R_OUT - STROKE / 2;

	// iris: close to the ring, hold a beat, then shut
	const irisR =
		t < 150
			? 2400
			: t < 172
				? mix(2400, R_OUT + 18, ease.inOutCubic(prog(t, 150, 18)))
				: mix(R_OUT + 18, 0, ease.inCubic(prog(t, 172, 6)));

	return (
		<AbsoluteFill style={{background: C.ink}}>
			<AbsoluteFill
				style={{
					backgroundImage: `radial-gradient(${creamA(0.07)} 1.3px, transparent 1.9px)`,
					backgroundSize: '36px 36px',
					backgroundPosition: `${t * 0.2}px 0px`,
					opacity: tw(t, 0, 20, 0, 1),
				}}
			/>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at ${CX}px ${CY}px, rgba(255,184,28,${0.16 * tw(t, 0, 30, 1.8, 1)}), transparent 45%)`,
				}}
			/>
			<AbsoluteFill
				style={{
					transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${push})`,
					transformOrigin: `${CX}px ${CY}px`,
				}}
			>
				<svg width={1920} height={1080} style={{position: 'absolute', overflow: 'visible'}}>
					{LINES.map((l, i) => {
						const p = ease.outExpo(prog(t, l.delay, 22));
						const x1 = CX + l.dx * rm;
						const y1 = CY + l.dy * rm;
						const x2 = CX + l.dx * (rm + l.len * p);
						const y2 = CY + l.dy * (rm + l.len * p);
						return (
							<g key={i}>
								<line x1={x1} y1={y1} x2={x2} y2={y2} stroke={l.color} strokeWidth={LINE_W} />
								{/* station ticks along each line */}
								{[1, 2, 3].map((k) => {
									const d = rm + 120 + k * 170;
									if (d > rm + l.len * p - 10 || d > l.len) return null;
									const px = CX + l.dx * d;
									const py = CY + l.dy * d;
									const pop = ease.outBack(prog(t, l.delay + 8 + k * 3, 12));
									return (
										<circle
											key={k}
											cx={px}
											cy={py}
											r={12 * pop}
											fill={C.ink}
											stroke={C.cream}
											strokeWidth={5}
										/>
									);
								})}
								{/* trains arriving */}
								{t > 40
									? [0, 1].map((n) => {
											const per = 70;
											const ph = (((t - 40 - i * 13 - n * 35) % per) + per) % per;
											const q = ease.inOutCubic(ph / per);
											const d = mix(l.len, rm + 30, q);
											if (d < rm + 60) return null;
											const px = CX + l.dx * d;
											const py = CY + l.dy * d;
											return (
												<line
													key={n}
													x1={px}
													y1={py}
													x2={px + l.dx * 60}
													y2={py + l.dy * 60}
													stroke={C.cream}
													strokeOpacity={0.8}
													strokeWidth={9}
													strokeLinecap="round"
												/>
											);
										})
									: null}
							</g>
						);
					})}
					{[0, 5].map((d, k) => {
						const p = prog(t, d, 40);
						if (p <= 0 || p >= 1) return null;
						return (
							<circle
								key={k}
								cx={CX}
								cy={CY}
								r={R_OUT + ease.outCubic(p) * (900 - 300 * k)}
								fill="none"
								stroke={k ? C.marigold : C.cream}
								strokeWidth={mix(10, 1, p)}
								opacity={(1 - p) * 0.8}
							/>
						);
					})}
					<circle
						cx={CX}
						cy={CY}
						r={rm * (0.1 + 0.9 * ring)}
						fill={C.ink}
						stroke={C.cream}
						strokeWidth={STROKE * (0.1 + 0.9 * ring)}
					/>
					<circle cx={CX} cy={CY} r={10 * sp(t, 20, {damping: 8})} fill={C.marigold} />
				</svg>

				{/* wordmark */}
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 560,
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					<Wordmark
						size={168}
						fx={(i) => {
							const at = 5 + i * 2;
							const p = ease.outExpo(prog(t, at, 20));
							return {y: (1 - p) * 120, o: t < at ? 0 : Math.min(1, (t - at) / 5), blur: (1 - p) * 8};
						}}
					/>
				</div>
				<div style={{position: 'absolute', left: 0, right: 0, top: 772, display: 'flex', justifyContent: 'center', gap: 20}}>
					<Reveal
						text="Everything digital."
						by="word"
						f={t}
						start={28}
						stagger={5}
						dur={20}
						style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: C.cream, lineHeight: 1}}
					/>
					<Reveal
						text="One stop."
						by="word"
						f={t}
						start={40}
						stagger={5}
						dur={20}
						style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 64, color: C.marigold, lineHeight: 1}}
					/>
				</div>
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 880,
						display: 'flex',
						justifyContent: 'center',
						gap: 60,
					}}
				>
					{[
						['MUHSIN', C.marigold],
						['PAVITRA', C.berry],
						['HATIM', C.cobalt],
					].map(([name, col], i) => {
						const at = 60 + i * 15;
						const s = sp(t, at, {damping: 9, stiffness: 300});
						return (
							<div key={name} style={{display: 'flex', alignItems: 'center', gap: 16}}>
								<div
									style={{
										width: 16,
										height: 16,
										borderRadius: 8,
										background: col,
										boxShadow: `0 0 14px ${col}`,
										transform: `scale(${t < at ? 0 : s})`,
									}}
								/>
								<Reveal
									text={name}
									f={t}
									start={at + 1}
									stagger={1}
									dur={12}
									style={{fontFamily: MONO, fontWeight: 500, fontSize: 26, letterSpacing: '0.3em', color: creamA(0.9)}}
								/>
							</div>
						);
					})}
				</div>
			</AbsoluteFill>
			{flash > 0.01 ? <AbsoluteFill style={{background: C.cream, opacity: flash}} /> : null}
			{t >= 150 ? (
				<AbsoluteFill
					style={{
						background: `radial-gradient(circle at ${CX}px ${CY}px, transparent ${irisR}px, #000 ${irisR + 1.5}px)`,
					}}
				/>
			) : null}
		</AbsoluteFill>
	);
};
