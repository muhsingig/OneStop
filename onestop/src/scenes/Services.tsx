import React from 'react';
import {AbsoluteFill, interpolateColors} from 'remotion';
import {C, MONO, SANS, SERIF, creamA} from '../theme';
import {ease, prog, sp, tw} from '../lib/anim';
import {Reveal} from '../components/Reveal';
import {Icon} from '../components/Icons';
import {BRANDS, SERVICES} from '../data';

const GRID_X = 120;
const GRID_W = 1680;
const GAP = 22;
const TILE_W = (GRID_W - GAP * 3) / 4;
const TILE_H = 200;
const ROW_Y = [322, 322 + TILE_H + GAP];
const TILE_COLORS = [C.marigold, C.berry, C.cobalt];
export const SUCK_TARGET = {x: 960, y: 360};

export const Services: React.FC<{t: number}> = ({t}) => {
	const suck = ease.inCubic(prog(t, 148, 27));
	const suckBlur = suck * 14;
	const marqueeX = 40 - t * 9.5;
	const sweep = tw(t, 84, 44, -700, 2600, ease.inOutCubic);
	return (
		<AbsoluteFill style={{background: C.ink}}>
			<AbsoluteFill
				style={{
					backgroundImage: `radial-gradient(${creamA(0.07)} 1.3px, transparent 1.9px)`,
					backgroundSize: '36px 36px',
					backgroundPosition: `${-t * 0.4}px 0px`,
				}}
			/>
			<AbsoluteFill
				style={{
					transformOrigin: `${SUCK_TARGET.x}px ${SUCK_TARGET.y}px`,
					transform: `scale(${1 - suck * 0.98}) rotate(${-14 * suck}deg)`,
					filter: suckBlur > 0.3 ? `blur(${suckBlur}px)` : undefined,
					opacity: 1 - prog(t, 168, 7),
				}}
			>
				{/* heading */}
				<div style={{position: 'absolute', left: GRID_X, top: 112}}>
					<Reveal
						text="05 — ONE STOP FOR"
						f={t}
						start={0}
						stagger={0.5}
						dur={12}
						style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.3em', color: C.marigold}}
					/>
					<div style={{display: 'flex', alignItems: 'baseline', gap: 26, marginTop: 14}}>
						<Reveal
							text="everything"
							f={t}
							start={2}
							stagger={1}
							dur={18}
							style={{
								fontFamily: SANS,
								fontWeight: 900,
								fontSize: 124,
								lineHeight: 1,
								letterSpacing: '-0.045em',
								color: C.cream,
							}}
						/>
						<Reveal
							text="digital."
							f={t}
							start={10}
							stagger={1.2}
							dur={18}
							style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 138, lineHeight: 1, color: C.marigold}}
						/>
					</div>
				</div>

				{/* the grid */}
				{SERVICES.map((sv, i) => {
					const col = TILE_COLORS[i % 3];
					const x = GRID_X + (i % 4) * (TILE_W + GAP);
					const y = ROW_Y[Math.floor(i / 4)];
					const at = 8 + Math.round(7.5 * i);
					const s = sp(t, at, {damping: 12, stiffness: 240});
					const pulseT = prog(t, 118 + i * 2.6, 16);
					const pulse = Math.sin(Math.PI * pulseT);
					const bg = interpolateColors(pulse, [0, 1], [C.ink2, col]);
					const fg = interpolateColors(pulse, [0, 1], [C.cream, C.ink]);
					const local = sweep - x;
					return (
						<div
							key={sv.label}
							style={{
								position: 'absolute',
								left: x,
								top: y,
								width: TILE_W,
								height: TILE_H,
								borderRadius: 20,
								background: bg,
								border: `1.5px solid ${creamA(0.1)}`,
								boxSizing: 'border-box',
								overflow: 'hidden',
								transform: `translateY(${(1 - s) * 60}px) scale(${0.82 + 0.18 * s})`,
								opacity: t < at ? 0 : Math.min(1, (t - at) / 5),
							}}
						>
							<div
								style={{
									position: 'absolute',
									inset: 0,
									background: `linear-gradient(105deg, transparent ${local - 160}px, ${creamA(0.14)} ${local}px, transparent ${local + 160}px)`,
								}}
							/>
							<div
								style={{
									position: 'absolute',
									left: 26,
									top: 26,
									width: 12,
									height: 12,
									borderRadius: 6,
									background: pulse > 0.5 ? C.ink : col,
									boxShadow: `0 0 12px ${col}`,
								}}
							/>
							<div
								style={{
									position: 'absolute',
									right: 24,
									top: 20,
									fontFamily: MONO,
									fontSize: 15,
									letterSpacing: '0.2em',
									color: pulse > 0.5 ? C.ink : creamA(0.4),
								}}
							>
								{String(i + 1).padStart(2, '0')}
							</div>
							<div style={{position: 'absolute', left: 26, top: 62}}>
								<Icon name={sv.icon} progress={ease.outCubic(prog(t, at + 3, 22))} color={fg} size={60} />
							</div>
							<div style={{position: 'absolute', left: 26, bottom: 24}}>
								<Reveal
									text={sv.label}
									f={t}
									start={at + 4}
									stagger={0.6}
									dur={14}
									style={{fontFamily: SANS, fontWeight: 800, fontSize: 34, letterSpacing: '-0.015em', color: fg}}
								/>
							</div>
						</div>
					);
				})}

				{/* where we've been */}
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 820,
						width: 1920,
						height: 96,
						borderTop: `1.5px solid ${creamA(0.14)}`,
						borderBottom: `1.5px solid ${creamA(0.14)}`,
						clipPath: `inset(0 ${(1 - ease.outExpo(prog(t, 24, 30))) * 100}% 0 0)`,
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: 470,
							right: 0,
							top: 0,
							bottom: 0,
							overflow: 'hidden',
							maskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
							WebkitMaskImage: 'linear-gradient(90deg, transparent, black 8%, black 92%, transparent)',
						}}
					>
						<div
							style={{
								position: 'absolute',
								left: marqueeX,
								top: 0,
								height: 96,
								display: 'flex',
								alignItems: 'center',
								gap: 34,
								whiteSpace: 'nowrap',
							}}
						>
							{[...BRANDS, ...BRANDS].map((b, i) => (
								<React.Fragment key={i}>
									<span
										style={{
											fontFamily: SANS,
											fontWeight: 800,
											fontSize: 50,
											letterSpacing: '-0.02em',
											color: C.cream,
										}}
									>
										{b}
									</span>
									<span
										style={{
											width: 12,
											height: 12,
											borderRadius: 6,
											background: TILE_COLORS[i % 3],
											flexShrink: 0,
										}}
									/>
								</React.Fragment>
							))}
						</div>
					</div>
					<div
						style={{
							position: 'absolute',
							left: GRID_X,
							top: 28,
							padding: '9px 16px',
							borderRadius: 30,
							background: C.marigold,
							fontFamily: MONO,
							fontWeight: 700,
							fontSize: 15,
							letterSpacing: '0.2em',
							color: C.ink,
						}}
					>
						WHERE WE’VE BEEN →
					</div>
				</div>
			</AbsoluteFill>
			{/* everything collapses into a single stop */}
			{t > 164 ? (
				<div
					style={{
						position: 'absolute',
						left: SUCK_TARGET.x - 16,
						top: SUCK_TARGET.y - 16,
						width: 32,
						height: 32,
						borderRadius: 16,
						background: C.cream,
						boxShadow: `0 0 ${tw(t, 160, 20, 10, 60)}px ${C.cream}`,
						transform: `scale(${tw(t, 164, 12, 0, 1, ease.outBack) * tw(t, 174, 6, 1, 0.7, ease.inCubic)})`,
					}}
				/>
			) : null}
		</AbsoluteFill>
	);
};
