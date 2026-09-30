import React, {CSSProperties} from 'react';
import {C, SANS} from '../theme';

// Letters sit in fixed-width boxes so the lockup geometry is known up front
// (the lines have to hit the first O exactly, and the camera zooms through it).
export const LETTERS = ['O', 'N', 'E', 'S', 'T', 'O', 'P'] as const;
const ADV: Record<string, number> = {N: 0.735, E: 0.6, S: 0.64, T: 0.6, P: 0.66};
export const RING = {d: 0.76, stroke: 0.165, side: 0.035};

export const letterW = (ch: string) => (ch === 'O' ? RING.d + 2 * RING.side : ADV[ch]);
export const wordW = (size: number, from = 0, to: number = LETTERS.length) =>
	LETTERS.slice(from, to).reduce((a, ch) => a + letterW(ch), 0) * size;
/** x of the first ring's centre, measured from the wordmark's left edge */
export const ring1X = (size: number) => (RING.side + RING.d / 2) * size;

export type LetterFx = {
	x?: number;
	y?: number;
	s?: number;
	r?: number;
	o?: number;
	/** 0..1 horizontal wipe-in from the left */
	wipe?: number;
	blur?: number;
};

export const Wordmark: React.FC<{
	size: number;
	fx?: (i: number) => LetterFx;
	ring1?: React.ReactNode;
	ring2?: React.ReactNode;
	color?: string;
	style?: CSSProperties;
}> = ({size, fx, ring1, ring2, color = C.cream, style}) => {
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				height: size,
				fontFamily: SANS,
				fontWeight: 900,
				fontSize: size,
				lineHeight: 1,
				color,
				...style,
			}}
		>
			{LETTERS.map((ch, i) => {
				const e = fx?.(i) ?? {};
				const transform = `translate(${e.x ?? 0}px, ${e.y ?? 0}px) scale(${e.s ?? 1}) rotate(${e.r ?? 0}deg)`;
				const clip = e.wipe !== undefined ? `inset(-20% ${(1 - e.wipe) * 100}% -20% -20%)` : undefined;
				const common: CSSProperties = {
					transform,
					opacity: e.o ?? 1,
					clipPath: clip,
					filter: e.blur ? `blur(${e.blur}px)` : undefined,
				};
				if (ch === 'O') {
					const d = RING.d * size;
					return (
						<div
							key={i}
							style={{
								width: letterW('O') * size,
								height: size,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								position: 'relative',
							}}
						>
							<div style={{position: 'relative', width: d, height: d, ...common}}>
								{i === 0 ? ring1 : ring2}
								<div
									style={{
										position: 'absolute',
										inset: 0,
										borderRadius: '50%',
										border: `${RING.stroke * size}px solid ${color}`,
									}}
								/>
							</div>
						</div>
					);
				}
				return (
					<div
						key={i}
						style={{
							width: ADV[ch] * size,
							height: size,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<span style={{display: 'inline-block', ...common}}>{ch}</span>
					</div>
				);
			})}
		</div>
	);
};
