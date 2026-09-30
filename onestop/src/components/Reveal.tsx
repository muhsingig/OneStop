import React, {CSSProperties} from 'react';
import {ease, prog} from '../lib/anim';

type Props = {
	text: string;
	f: number;
	start: number;
	by?: 'char' | 'word';
	stagger?: number;
	dur?: number;
	/** starting offset as % of the unit's height */
	from?: number;
	exitAt?: number;
	exitDur?: number;
	exitStagger?: number;
	rotate?: number;
	style?: CSSProperties;
	unitStyle?: (i: number, n: number) => CSSProperties;
	mask?: boolean;
};

/** Masked, staggered text reveal — every headline in the film goes through this. */
export const Reveal: React.FC<Props> = ({
	text,
	f,
	start,
	by = 'char',
	stagger = 1.5,
	dur = 16,
	from = 110,
	exitAt,
	exitDur = 12,
	exitStagger,
	rotate = 0,
	style,
	unitStyle,
	mask = true,
}) => {
	const units = by === 'char' ? Array.from(text) : text.split(/(\s+)/);
	const animated = units.filter((u) => u.trim().length > 0).length;
	let k = -1;
	return (
		<span style={{display: 'inline-flex', whiteSpace: 'pre', ...style}}>
			{units.map((u, i) => {
				if (u.trim().length === 0) {
					return <span key={i}>{by === 'char' ? ' ' : u.replace(/ /g, ' ')}</span>;
				}
				k++;
				const pIn = ease.outExpo(prog(f, start + k * stagger, dur));
				let y = (1 - pIn) * from;
				let r = (1 - pIn) * rotate;
				if (exitAt !== undefined) {
					const pOut = ease.inExpo(prog(f, exitAt + k * (exitStagger ?? stagger * 0.6), exitDur));
					y -= pOut * from;
					r -= pOut * rotate * -1;
				}
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							overflow: mask ? 'hidden' : 'visible',
							padding: '0.12em 0.1em 0.16em',
							margin: '-0.12em -0.1em -0.16em',
							verticalAlign: 'top',
						}}
					>
						<span
							style={{
								display: 'inline-block',
								transform: `translateY(${y}%) rotate(${r}deg)`,
								transformOrigin: '0% 100%',
								...unitStyle?.(k, animated),
							}}
						>
							{u}
						</span>
					</span>
				);
			})}
		</span>
	);
};
