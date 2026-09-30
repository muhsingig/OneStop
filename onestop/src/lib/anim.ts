import {spring, SpringConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {FPS} from '../timeline';

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const prog = (f: number, start: number, dur: number) =>
	clamp01((f - start) / dur);

type Ease = (t: number) => number;
export const ease = {
	linear: ((t) => t) as Ease,
	outCubic: ((t) => 1 - (1 - t) ** 3) as Ease,
	inCubic: ((t) => t ** 3) as Ease,
	inOutCubic: ((t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)) as Ease,
	outQuart: ((t) => 1 - (1 - t) ** 4) as Ease,
	inQuart: ((t) => t ** 4) as Ease,
	inOutQuart: ((t) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2)) as Ease,
	outQuint: ((t) => 1 - (1 - t) ** 5) as Ease,
	outExpo: ((t) => (t >= 1 ? 1 : 1 - 2 ** (-10 * t))) as Ease,
	inExpo: ((t) => (t <= 0 ? 0 : 2 ** (10 * t - 10))) as Ease,
	inOutExpo: ((t) =>
		t <= 0
			? 0
			: t >= 1
				? 1
				: t < 0.5
					? 2 ** (20 * t - 10) / 2
					: (2 - 2 ** (-20 * t + 10)) / 2) as Ease,
	outBack: ((t) => {
		const s = 1.70158;
		return 1 + (s + 1) * (t - 1) ** 3 + s * (t - 1) ** 2;
	}) as Ease,
	inBack: ((t) => {
		const s = 1.70158;
		return (s + 1) * t ** 3 - s * t ** 2;
	}) as Ease,
};

/** tween: value at frame f of an animation starting at `start` lasting `dur` */
export const tw = (
	f: number,
	start: number,
	dur: number,
	from: number,
	to: number,
	e: Ease = ease.outExpo,
) => from + (to - from) * e(prog(f, start, dur));

export const sp = (f: number, start: number, config: Partial<SpringConfig> = {}) =>
	spring({
		frame: f - start,
		fps: FPS,
		config: {damping: 14, stiffness: 170, mass: 1, ...config},
	});

/** smooth organic drift, returns -1..1 */
export const wobble = (seed: string, f: number, speed = 0.01) =>
	noise2D(seed, f * speed, 0);

/** decaying camera shake after a hit */
export const shake = (seed: string, f: number, at: number, amp = 14, decay = 7) => {
	if (f < at) return {x: 0, y: 0, r: 0};
	const k = Math.exp(-(f - at) / decay) * amp;
	return {
		x: noise2D(seed + 'x', (f - at) * 0.6, 1) * k,
		y: noise2D(seed + 'y', (f - at) * 0.6, 2) * k,
		r: noise2D(seed + 'r', (f - at) * 0.5, 3) * k * 0.05,
	};
};

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
