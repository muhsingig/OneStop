import React from 'react';
import {AbsoluteFill, Img, random, staticFile} from 'remotion';
import {C, creamA} from '../theme';

/** Ink backdrop with a slowly drifting transit-map dot grid and a vignette. */
export const Background: React.FC<{f: number; color?: string; grid?: number}> = ({
	f,
	color = C.ink,
	grid = 0.07,
}) => (
	<AbsoluteFill style={{background: color}}>
		<AbsoluteFill
			style={{
				backgroundImage: `radial-gradient(${creamA(grid)} 1.3px, transparent 1.9px)`,
				backgroundSize: '36px 36px',
				backgroundPosition: `${-f * 0.12}px ${-f * 0.05}px`,
			}}
		/>
		<AbsoluteFill
			style={{
				background: 'radial-gradient(ellipse 75% 70% at 50% 45%, transparent 35%, rgba(0,0,0,0.55) 100%)',
			}}
		/>
	</AbsoluteFill>
);

/** Film grain: pre-baked noise tiles, re-rolled at 30 fps. */
export const Grain: React.FC<{f: number; opacity?: number}> = ({f, opacity = 0.11}) => {
	const k = Math.floor(f / 2);
	const tile = k % 8;
	const ox = Math.floor(random(`gx${k}`) * 256);
	const oy = Math.floor(random(`gy${k}`) * 256);
	return (
		<AbsoluteFill
			style={{
				backgroundImage: `url(${staticFile(`grain/g${tile}.png`)})`,
				backgroundSize: '256px 256px',
				backgroundPosition: `${ox}px ${oy}px`,
				mixBlendMode: 'overlay',
				opacity,
				pointerEvents: 'none',
			}}
		/>
	);
};

// keep Img referenced so the grain tiles are prefetched by the bundler
export const PreloadGrain: React.FC = () => (
	<div style={{display: 'none'}}>
		{Array.from({length: 8}, (_, i) => (
			<Img key={i} src={staticFile(`grain/g${i}.png`)} />
		))}
	</div>
);
