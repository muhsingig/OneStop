export type Pt = [number, number];

/**
 * One transit-map leg from a to b: a straight run, then a 45° diagonal,
 * joined by a rounded corner — the Harry Beck grammar.
 */
export const metroSeg = (a: Pt, b: Pt, radius = 36, withMove = true): string => {
	const move = withMove ? `M ${a[0]} ${a[1]} ` : '';
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const adx = Math.abs(dx);
	const ady = Math.abs(dy);
	const d = Math.min(adx, ady);
	const mid: Pt = adx >= ady ? [b[0] - Math.sign(dx) * d, a[1]] : [a[0], b[1] - Math.sign(dy) * d];
	const l1 = Math.hypot(mid[0] - a[0], mid[1] - a[1]);
	const l2 = Math.hypot(b[0] - mid[0], b[1] - mid[1]);
	if (l1 < 1 || l2 < 1) return `${move}L ${b[0]} ${b[1]}`;
	const r = Math.min(radius, l1 / 2, l2 / 2);
	const p1: Pt = [mid[0] - ((mid[0] - a[0]) / l1) * r, mid[1] - ((mid[1] - a[1]) / l1) * r];
	const p2: Pt = [mid[0] + ((b[0] - mid[0]) / l2) * r, mid[1] + ((b[1] - mid[1]) / l2) * r];
	return `${move}L ${p1[0]} ${p1[1]} Q ${mid[0]} ${mid[1]} ${p2[0]} ${p2[1]} L ${b[0]} ${b[1]}`;
};

export const metroRoute = (pts: Pt[], radius = 36) =>
	pts
		.slice(1)
		.map((p, i) => (i === 0 ? metroSeg(pts[0], p, radius, true) : metroSeg(pts[i], p, radius, false)))
		.join(' ');
