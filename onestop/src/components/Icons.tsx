import React from 'react';
import {evolvePath} from '@remotion/paths';

// 64×64 line icons, each a list of strokes so they can draw themselves on.
const ICONS: Record<string, string[]> = {
	compass: [
		'M 32 6 A 26 26 0 1 1 31.99 6',
		'M 32 18 L 38 32 L 32 46 L 26 32 Z',
		'M 32 29 L 32 35',
	],
	target: [
		'M 32 8 A 24 24 0 1 1 31.99 8',
		'M 32 20 A 12 12 0 1 1 31.99 20',
		'M 32 29 A 3 3 0 1 1 31.99 29',
		'M 58 6 L 36 28',
		'M 58 6 L 50 6 M 58 6 L 58 14',
	],
	search: ['M 27 8 A 18 18 0 1 1 26.99 8', 'M 40 40 L 58 58', 'M 19 26 A 8 8 0 0 1 27 18'],
	bubble: [
		'M 12 10 L 52 10 Q 58 10 58 16 L 58 40 Q 58 46 52 46 L 26 46 L 14 56 L 16 46 L 12 46 Q 6 46 6 40 L 6 16 Q 6 10 12 10 Z',
		'M 32 38 L 22 28 Q 18 22 24 19 Q 29 17 32 23 Q 35 17 40 19 Q 46 22 42 28 Z',
	],
	play: ['M 8 12 L 56 12 Q 60 12 60 16 L 60 48 Q 60 52 56 52 L 8 52 Q 4 52 4 48 L 4 16 Q 4 12 8 12 Z', 'M 26 22 L 42 32 L 26 42 Z'],
	browser: [
		'M 8 10 L 56 10 Q 60 10 60 14 L 60 50 Q 60 54 56 54 L 8 54 Q 4 54 4 50 L 4 14 Q 4 10 8 10 Z',
		'M 4 22 L 60 22',
		'M 11 16 L 12 16 M 17 16 L 18 16 M 23 16 L 24 16',
		'M 12 32 L 34 32 M 12 40 L 28 40 M 42 30 L 52 30 L 52 44 L 42 44 Z',
	],
	bars: ['M 6 56 L 58 56', 'M 14 56 L 14 36', 'M 28 56 L 28 20', 'M 42 56 L 42 30', 'M 56 56 L 56 10'],
	ticket: [
		'M 6 16 L 58 16 L 58 26 Q 52 32 58 38 L 58 48 L 6 48 L 6 38 Q 12 32 6 26 Z',
		'M 22 16 L 22 48',
		'M 40 24 L 42.5 29.5 L 48 30 L 44 34 L 45 40 L 40 37 L 35 40 L 36 34 L 32 30 L 37.5 29.5 Z',
	],
};

export const Icon: React.FC<{name: string; progress: number; color: string; size?: number}> = ({
	name,
	progress,
	color,
	size = 64,
}) => (
	<svg width={size} height={size} viewBox="0 0 64 64" style={{overflow: 'visible'}}>
		{ICONS[name].map((d, i) => {
			const p = Math.min(1, Math.max(0, progress * 1.4 - i * 0.12));
			if (p <= 0) return null;
			const ev = evolvePath(p, d);
			return (
				<path
					key={i}
					d={d}
					fill="none"
					stroke={color}
					strokeWidth={3.2}
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeDasharray={ev.strokeDasharray}
					strokeDashoffset={ev.strokeDashoffset}
				/>
			);
		})}
	</svg>
);
