import React from 'react';
import {AbsoluteFill, Img, random, staticFile} from 'remotion';
import {C, HAND, MONO, SANS, SERIF, creamA} from '../theme';
import {ease, prog, sp, tw, wobble} from '../lib/anim';
import {Reveal} from '../components/Reveal';

const Petals: React.FC<{t: number}> = ({t}) => (
	<AbsoluteFill style={{pointerEvents: 'none'}}>
		{Array.from({length: 28}, (_, i) => {
			const r = (k: string) => random(`petal-${i}-${k}`);
			const size = 12 + r('s') * 22;
			const depth = size / 34; // bigger = closer
			const speed = 1.1 + depth * 2.2;
			const x0 = r('x') * 2040 - 60;
			const y0 = r('y') * 1300;
			const y = ((y0 + (t + 40) * speed) % 1300) - 110;
			const x = x0 + Math.sin((t + r('p') * 400) * (0.018 + r('f') * 0.02)) * (24 + r('a') * 50);
			const spin = (t + r('p') * 300) * (2 + r('r') * 4);
			const warm = r('c') > 0.5;
			return (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: x,
						top: y,
						width: size,
						height: size * 1.35,
						borderRadius: '60% 40% 60% 40% / 70% 70% 30% 30%',
						background: warm
							? 'linear-gradient(160deg, #FFD15A, #FF9A1F)'
							: 'linear-gradient(160deg, #FFB81C, #F06A10)',
						transform: `rotate(${spin}deg) rotateX(${spin * 1.7}deg)`,
						filter: depth > 0.8 ? `blur(${(depth - 0.8) * 9}px)` : undefined,
						opacity: 0.55 + depth * 0.35,
						boxShadow: 'inset -2px -3px 6px rgba(120,30,0,0.35)',
					}}
				/>
			);
		})}
	</AbsoluteFill>
);

const Polaroid: React.FC<{
	src: string;
	w: number;
	h: number;
	pad: number;
	bottom: number;
	t: number;
	zoom: [number, number];
	children?: React.ReactNode;
}> = ({src, w, h, pad, bottom, t, zoom, children}) => (
	<div
		style={{
			position: 'relative',
			width: w + pad * 2,
			height: h + pad + bottom,
			background: '#F7F1E6',
			padding: pad,
			paddingBottom: bottom,
			boxSizing: 'border-box',
			boxShadow: '0 40px 80px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.3)',
		}}
	>
		<div style={{width: w, height: h, overflow: 'hidden', position: 'relative'}}>
			<Img
				src={staticFile(src)}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `scale(${tw(t, 0, 244, zoom[0], zoom[1], ease.linear)})`,
				}}
			/>
			{/* subtle warm grade */}
			<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(255,184,28,0.06), rgba(59,11,19,0.12))'}} />
		</div>
		{children}
	</div>
);

export const Crew: React.FC<{t: number}> = ({t}) => {
	const p1 = sp(t, 2, {damping: 15, stiffness: 90});
	const p2 = sp(t, 88, {damping: 13, stiffness: 110});
	const drift = tw(t, 0, 240, 0, -26, ease.linear);
	const push = tw(t, 150, 90, 1, 1.05, ease.inCubic);
	return (
		<AbsoluteFill style={{background: C.oxblood, overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at ${70 + wobble('crew', t, 0.008) * 6}% 25%, rgba(255,184,28,0.22), transparent 50%), radial-gradient(circle at 10% 90%, rgba(236,47,123,0.16), transparent 45%)`,
				}}
			/>
			<AbsoluteFill
				style={{
					backgroundImage: `radial-gradient(${creamA(0.06)} 1.3px, transparent 1.9px)`,
					backgroundSize: '36px 36px',
					backgroundPosition: `0px ${drift}px`,
				}}
			/>
			<AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 50%'}}>
				{/* copy */}
				<div style={{position: 'absolute', left: 120, top: 262 + drift * 0.5}}>
					<Reveal
						text="04 — THE CREW"
						f={t}
						start={6}
						stagger={0.6}
						dur={12}
						style={{fontFamily: MONO, fontWeight: 700, fontSize: 18, letterSpacing: '0.3em', color: C.marigold}}
					/>
					<div style={{height: 26}} />
					<Reveal
						text="Three lines,"
						by="word"
						f={t}
						start={10}
						stagger={6}
						dur={24}
						style={{
							fontFamily: SANS,
							fontWeight: 900,
							fontSize: 132,
							lineHeight: 1,
							letterSpacing: '-0.045em',
							color: C.cream,
						}}
					/>
					<div style={{height: 8}} />
					<Reveal
						text="one crew."
						by="word"
						f={t}
						start={30}
						stagger={7}
						dur={26}
						style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 164, lineHeight: 1, color: C.marigold}}
					/>
					<div style={{height: 40}} />
					<div
						style={{
							width: tw(t, 56, 30, 0, 520),
							height: 2,
							background: creamA(0.35),
							marginBottom: 22,
						}}
					/>
					<div style={{fontFamily: MONO, fontSize: 19, letterSpacing: '0.2em', lineHeight: 1.9, color: creamA(0.72)}}>
						<Reveal text="DIGITAL STRATEGY · JAI HIND COLLEGE" f={t} start={60} stagger={0.35} dur={12} />
						<br />
						<Reveal text="MUMBAI · CLASS OF ’27" f={t} start={70} stagger={0.35} dur={12} />
					</div>
				</div>

				{/* photo 1 */}
				<div
					style={{
						position: 'absolute',
						left: 1300 - 256,
						top: 500 - 356 + drift,
						transform: `translateY(${(1 - p1) * 1000}px) rotate(${-4 - (1 - p1) * 14 + wobble('ph1', t, 0.01) * 0.6}deg)`,
					}}
				>
					<Polaroid src="img/crew-mirror.jpg" w={480} h={640} pad={16} bottom={40} t={t} zoom={[1.14, 1.03]}>
						<div
							style={{
								position: 'absolute',
								left: '50%',
								top: -18,
								width: 160,
								height: 40,
								marginLeft: -80,
								background: 'rgba(255,184,28,0.78)',
								transform: 'rotate(3deg)',
								boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
							}}
						/>
					</Polaroid>
				</div>

				{/* photo 2 */}
				{t >= 86 ? (
					<div
						style={{
							position: 'absolute',
							left: 1650 - 174,
							top: 740 - 252 + drift * 1.4,
							transform: `translate(${(1 - p2) * 800}px, ${(1 - p2) * -120}px) rotate(${7 + (1 - p2) * 30 + wobble('ph2', t, 0.012) * 0.8}deg)`,
						}}
					>
						<Polaroid src="img/crew-selfie.jpg" w={320} h={427} pad={14} bottom={64} t={t} zoom={[1.12, 1.02]}>
							<div
								style={{
									position: 'absolute',
									left: 16,
									bottom: 14,
									fontFamily: HAND,
									fontWeight: 600,
									fontSize: 31,
									color: '#2A1712',
									transform: 'rotate(-2deg)',
									clipPath: `inset(-20% ${(1 - ease.inOutCubic(prog(t, 112, 26))) * 100}% -20% 0)`,
									whiteSpace: 'nowrap',
								}}
							>
								strategy meeting, probably.
							</div>
							<div
								style={{
									position: 'absolute',
									left: -28,
									top: 6,
									width: 130,
									height: 36,
									background: 'rgba(236,47,123,0.72)',
									transform: 'rotate(-38deg)',
								}}
							/>
						</Polaroid>
					</div>
				) : null}
			</AbsoluteFill>
			<Petals t={t} />
		</AbsoluteFill>
	);
};
