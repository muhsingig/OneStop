import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C} from '../theme';
import {H, W, WHIP} from '../timeline';
import {ease, prog} from '../lib/anim';

type Dir = 'up' | 'left';
type WhipSpec = {at: number; dir: Dir};

const whipOffset = (g: number, spec: WhipSpec, entering: boolean) => {
	const p = ease.inOutExpo(prog(g, spec.at - WHIP / 2, WHIP));
	const size = spec.dir === 'up' ? H : W;
	const d = entering ? (1 - p) * size : -p * size;
	return spec.dir === 'up' ? {x: 0, y: d} : {x: d, y: 0};
};

/**
 * Whip-pan wrapper: slides a whole scene in/out with a directional motion blur
 * whose strength follows the actual per-frame velocity.
 */
export const Whip: React.FC<{
	g: number;
	id: string;
	enter?: WhipSpec;
	exit?: WhipSpec;
	children: React.ReactNode;
}> = ({g, id, enter, exit, children}) => {
	const at = (gg: number) => {
		let x = 0;
		let y = 0;
		if (enter) {
			const o = whipOffset(gg, enter, true);
			x += o.x;
			y += o.y;
		}
		if (exit) {
			const o = whipOffset(gg, exit, false);
			x += o.x;
			y += o.y;
		}
		return {x, y};
	};
	const now = at(g);
	const prev = at(g - 0.5);
	const next = at(g + 0.5);
	const vx = Math.abs(next.x - prev.x);
	const vy = Math.abs(next.y - prev.y);
	const bx = Math.min(80, vx * 0.35);
	const by = Math.min(80, vy * 0.35);
	const blurred = bx > 0.3 || by > 0.3;
	return (
		<AbsoluteFill style={{transform: `translate(${now.x}px, ${now.y}px)`}}>
			{blurred ? (
				<svg width="0" height="0" style={{position: 'absolute'}}>
					<filter id={`whip-${id}`} x="-20%" y="-20%" width="140%" height="140%">
						<feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} />
					</filter>
				</svg>
			) : null}
			<AbsoluteFill style={{filter: blurred ? `url(#whip-${id})` : undefined}}>{children}</AbsoluteFill>
		</AbsoluteFill>
	);
};

/** Three brand-coloured bands sweep across on a diagonal, trailed by the next scene's colour. */
export const StripeWipe: React.FC<{g: number; at: number; to: string}> = ({g, at, to}) => {
	const band = 17;
	const stagger = 3;
	const bands = [C.marigold, C.berry, C.cobalt, to];
	const start = at - band - stagger * (bands.length - 1);
	if (g < start || g >= at) return null;
	const slope = 0.42; // horizontal lean per px of height
	const span = W + H * slope + 40;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{bands.map((col, i) => {
				const p = ease.inOutCubic(prog(g, start + i * stagger, band));
				const edge = -H * slope - 40 + span * p * 1.02;
				const pts = `0px 0px, ${edge + H * slope}px 0px, ${edge}px ${H}px, 0px ${H}px`;
				return (
					<AbsoluteFill
						key={i}
						style={{background: col, clipPath: `polygon(${pts})`}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

/** Horizontal blinds close top-to-bottom. */
export const Blinds: React.FC<{g: number; at: number; color: string; count?: number}> = ({
	g,
	at,
	color,
	count = 9,
}) => {
	const start = at - 20;
	if (g < start || g > at + 1) return null;
	const h = H / count;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{Array.from({length: count}, (_, i) => {
				const p = ease.inOutCubic(prog(g, start + i * 1.2, 20 - count * 1.2 + 1));
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: 0,
							top: i * h - 0.5,
							width: W,
							height: h + 1,
							background: color,
							transform: `scaleY(${p})`,
							transformOrigin: i % 2 ? '50% 0%' : '50% 100%',
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
