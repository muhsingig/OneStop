import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js';

/* The network: three lines sweep in from the dark and meet inside one station ring.
   Scrolling moves one camera through it; each member section rides that member's line. */
const canvas = document.getElementById('gl');
const mobile = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

let renderer;
try {
	renderer = new THREE.WebGLRenderer({canvas, antialias: !mobile, powerPreference: 'high-performance'});
} catch (e) {
	document.documentElement.classList.add('gl-fallback');
	throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.7));
renderer.setClearColor(0x0c0a09, 1);

const INK = new THREE.Color('#0C0A09');
const FOG = 0.0135;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(INK, FOG);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 600);

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const COL = {m: new THREE.Color('#FFB81C'), p: new THREE.Color('#EC2F7B'), h: new THREE.Color('#4A76FF')};
const curves = {
	m: new THREE.CatmullRomCurve3([V(-130, -34, -160), V(-86, -6, -118), V(-62, -22, -76), V(-36, -4, -44), V(-19, -6, -18), V(-8.5, -1, -5.5), V(-2.6, 0, -1.2), V(0, 0, 0)], false, 'centripetal'),
	p: new THREE.CatmullRomCurve3([V(24, 120, -170), V(-8, 78, -124), V(16, 50, -84), V(4, 30, -46), V(3.5, 15, -19), V(0.6, 6.4, -6), V(0, 2.2, -1.3), V(0, 0, 0)], false, 'centripetal'),
	h: new THREE.CatmullRomCurve3([V(138, -24, -160), V(94, 12, -120), V(68, -12, -80), V(40, 5, -44), V(21, -4, -18), V(8.5, -0.6, -5.5), V(2.6, 0, -1.2), V(0, 0, 0)], false, 'centripetal'),
};

const uniforms = {uTime: {value: 0}, uDensity: {value: FOG}, uFogColor: {value: INK}};

const tubeVert = /* glsl */ `
varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying float vDepth;
void main(){
	vUv = uv;
	vec4 mv = modelViewMatrix * vec4(position, 1.0);
	vN = normalize(normalMatrix * normal);
	vV = normalize(-mv.xyz);
	vDepth = -mv.z;
	gl_Position = projectionMatrix * mv;
}`;
const coreFrag = /* glsl */ `
uniform vec3 uColor; uniform float uTime; uniform float uGlow; uniform float uDensity; uniform vec3 uFogColor; uniform float uPhase;
varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying float vDepth;
void main(){
	float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
	float p = fract(vUv.x * 9.0 - uTime * 0.5 + uPhase);
	float train = smoothstep(0.0, 0.004, p) * (1.0 - smoothstep(0.004, 0.045, p));
	vec3 col = uColor * (0.55 + 0.8 * pow(f, 1.4));
	col = mix(col, vec3(1.0, 0.96, 0.88), train);
	col *= 0.3 + 0.95 * uGlow;
	float fog = 1.0 - exp(-uDensity * uDensity * vDepth * vDepth);
	gl_FragColor = vec4(mix(col, uFogColor, fog), 1.0);
}`;
const haloFrag = /* glsl */ `
uniform vec3 uColor; uniform float uTime; uniform float uGlow; uniform float uDensity; uniform float uPhase; uniform float uStrength;
varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying float vDepth;
void main(){
	float d = abs(dot(normalize(vN), normalize(vV)));
	float p = fract(vUv.x * 9.0 - uTime * 0.5 + uPhase);
	float train = smoothstep(0.0, 0.01, p) * (1.0 - smoothstep(0.01, 0.07, p));
	float a = pow(d, 2.6) * (uStrength + train * 0.55) * uGlow;
	float fog = exp(-uDensity * uDensity * vDepth * vDepth);
	gl_FragColor = vec4(uColor * a * fog, 1.0);
}`;

const glow = {m: {value: 1}, p: {value: 1}, h: {value: 1}};
const phases = {m: 0, p: 0.33, h: 0.66};
for (const k of ['m', 'p', 'h']) {
	const core = new THREE.Mesh(
		new THREE.TubeGeometry(curves[k], mobile ? 360 : 700, 0.3, mobile ? 10 : 16, false),
		new THREE.ShaderMaterial({
			vertexShader: tubeVert,
			fragmentShader: coreFrag,
			uniforms: {...uniforms, uColor: {value: COL[k]}, uGlow: glow[k], uPhase: {value: phases[k]}},
		}),
	);
	scene.add(core);
	const halo = new THREE.Mesh(
		new THREE.TubeGeometry(curves[k], mobile ? 200 : 360, 1.5, 12, false),
		new THREE.ShaderMaterial({
			vertexShader: tubeVert,
			fragmentShader: haloFrag,
			uniforms: {...uniforms, uColor: {value: COL[k]}, uGlow: glow[k], uPhase: {value: phases[k]}, uStrength: {value: 0.2}},
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
		}),
	);
	scene.add(halo);
	// stations: one ring per stop on that member's timeline
	[0.2, 0.34, 0.47, 0.59, 0.7].forEach((t) => {
		const pos = curves[k].getPointAt(t);
		const tan = curves[k].getTangentAt(t);
		const st = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.2, 12, 48), new THREE.MeshBasicMaterial({color: 0xf3ecdf}));
		st.position.copy(pos);
		st.lookAt(pos.clone().add(tan));
		scene.add(st);
	});
}

/* the station ring */
const ringMat = new THREE.ShaderMaterial({
	vertexShader: tubeVert,
	fragmentShader: /* glsl */ `
	uniform float uTime; uniform float uRing; varying vec3 vN; varying vec3 vV; varying vec2 vUv;
	void main(){
		float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
		vec3 cream = vec3(0.953, 0.925, 0.875);
		float sweep = smoothstep(0.96, 1.0, sin(vUv.x * 6.2831 - uTime * 1.4) * 0.5 + 0.5);
		vec3 col = cream * (0.78 + 0.5 * pow(f, 2.0)) + vec3(1.0, 0.8, 0.4) * sweep * 0.5;
		gl_FragColor = vec4(col * (0.55 + 0.5 * uRing), 1.0);
	}`,
	uniforms: {...uniforms, uRing: {value: 1}},
});
const ring = new THREE.Group();
const RING_R = 2.3;
const RING_T = 0.64;
const RING_OUT = RING_R + RING_T;
ring.add(new THREE.Mesh(new THREE.TorusGeometry(RING_R, RING_T, 48, 220), ringMat));
const ringHalo = new THREE.Mesh(
	new THREE.TorusGeometry(RING_R, 2.1, 24, 160),
	new THREE.ShaderMaterial({
		vertexShader: tubeVert,
		fragmentShader: /* glsl */ `
		uniform float uRing; varying vec3 vN; varying vec3 vV;
		void main(){ float d = abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(vec3(1.0, 0.86, 0.6) * pow(d, 3.2) * 0.2 * uRing, 1.0); }`,
		uniforms: {uRing: ringMat.uniforms.uRing},
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
	}),
);
ring.add(ringHalo);
scene.add(ring);

/* the core flare where the lines meet */
const flareTex = (() => {
	const c = document.createElement('canvas');
	c.width = c.height = 256;
	const x = c.getContext('2d');
	const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
	g.addColorStop(0, 'rgba(255,248,230,1)');
	g.addColorStop(0.18, 'rgba(255,214,140,0.55)');
	g.addColorStop(0.5, 'rgba(255,160,60,0.12)');
	g.addColorStop(1, 'rgba(255,140,40,0)');
	x.fillStyle = g;
	x.fillRect(0, 0, 256, 256);
	return new THREE.CanvasTexture(c);
})();
const flare = new THREE.Sprite(new THREE.SpriteMaterial({map: flareTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true}));
flare.scale.set(5.5, 5.5, 1);
scene.add(flare);

/* dust */
const N = mobile ? 700 : 1600;
const pos = new Float32Array(N * 3);
const seed = new Float32Array(N);
for (let i = 0; i < N; i++) {
	pos[i * 3] = (Math.random() - 0.5) * 300;
	pos[i * 3 + 1] = (Math.random() - 0.5) * 180;
	pos[i * 3 + 2] = -Math.random() * 220 + 30;
	seed[i] = Math.random();
}
const dustGeo = new THREE.BufferGeometry();
dustGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
const dust = new THREE.Points(
	dustGeo,
	new THREE.ShaderMaterial({
		vertexShader: /* glsl */ `
		attribute float aSeed; uniform float uTime; uniform float uPx; varying float vA;
		void main(){
			vec3 p = position; p.y += sin(uTime * 0.25 + aSeed * 6.2831) * 1.2; p.x += cos(uTime * 0.2 + aSeed * 12.0) * 0.8;
			vec4 mv = modelViewMatrix * vec4(p, 1.0);
			gl_Position = projectionMatrix * mv;
			gl_PointSize = uPx * (0.5 + aSeed * 1.6) * (40.0 / max(1.0, -mv.z));
			vA = (0.3 + 0.7 * abs(sin(uTime * 0.7 + aSeed * 40.0))) * clamp(1.0 - (-mv.z) / 200.0, 0.0, 1.0);
		}`,
		fragmentShader: /* glsl */ `
		varying float vA;
		void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vec3(1.0, 0.94, 0.84) * a * vA * 0.7, 1.0); }`,
		uniforms: {uTime: uniforms.uTime, uPx: {value: renderer.getPixelRatio() * 2.2}},
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
	}),
);
scene.add(dust);

/* map-grid floor */
const floorMat = new THREE.ShaderMaterial({
	vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
	fragmentShader: /* glsl */ `
	uniform vec3 uCam; varying vec3 vW;
	void main(){
		vec2 g = abs(fract(vW.xz / 8.0) - 0.5) * 8.0;
		float dotm = smoothstep(0.42, 0.0, length(g));
		float line = (smoothstep(0.06, 0.0, g.x) + smoothstep(0.06, 0.0, g.y)) * 0.18;
		float fade = exp(-length(vW - uCam) * 0.011);
		gl_FragColor = vec4(vec3(0.95, 0.92, 0.86) * (dotm * 0.5 + line) * 0.32 * fade, 1.0);
	}`,
	uniforms: {uCam: {value: new THREE.Vector3()}},
	transparent: true,
	depthWrite: false,
	blending: THREE.AdditiveBlending,
});
const floor = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, -46, -80);
scene.add(floor);

/* ------------------------------------------------------------------ camera states */
const up = V(0, 1, 0);
function ride(k, t, side) {
	const c = curves[k];
	const tt = Math.min(0.9, t);
	const p = c.getPointAt(tt);
	const tan = c.getTangentAt(tt);
	const s = tan.clone().cross(up).normalize().multiplyScalar(side);
	return {
		pos: p.clone().add(V(0, 4.2, 0)).add(s),
		look: c.getPointAt(Math.min(0.995, tt + 0.13)).add(V(0, 1.2, 0)),
	};
}
/* hero: put the 3D ring exactly where the wordmark's first O sits, so the letter is the station */
const heroO = document.querySelector('.hero .ring-o');
let oRect = null;
function measureO() {
	if (!heroO) return;
	let x = 0, y = 0, el = heroO;
	while (el) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; }
	oRect = {x: x + heroO.offsetWidth / 2, y: y + heroO.offsetHeight / 2, r: heroO.offsetWidth / 2};
}
function heroState(scroll) {
	if (!oRect || !oRect.r) return {pos: V(0, -1.4, 15.5), look: V(0, 1.4, 0), g: [1, 1, 1], ring: 1, par: 1, lock: 0};
	const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
	const d = (RING_OUT * (innerHeight / 2)) / (oRect.r * tanH);
	const nx = (oRect.x / innerWidth) * 2 - 1;
	const ny = -(((oRect.y - scroll) / innerHeight) * 2 - 1);
	const cx = -nx * d * tanH * camera.aspect;
	const cy = -ny * d * tanH;
	return {pos: V(cx, cy, d), look: V(cx, cy, 0), g: [1, 1, 1], ring: 1, par: 0, lock: 1};
}
const STATES = {
	hero: (q, y) => heroState(y),
	why: () => ({pos: V(-34, 30, 34), look: V(-4, 2, -52), g: [0.85, 0.85, 0.85], ring: 0.7, par: 0.6, lock: 0}),
	m: (q) => ({...ride('m', 0.14 + q * 0.62, 5), g: [1.5, 0.25, 0.25], ring: 0.8, par: 0.3}),
	p: (q) => ({...ride('p', 0.14 + q * 0.62, -5), g: [0.25, 1.5, 0.25], ring: 0.8, par: 0.3}),
	h: (q) => ({...ride('h', 0.14 + q * 0.62, -5), g: [0.25, 0.25, 1.5], ring: 0.8, par: 0.3}),
	services: () => ({pos: V(0, 14, 78), look: V(0, 12, -60), g: [0.9, 0.9, 0.9], ring: 0.7, par: 0.6}),
	work: () => ({pos: V(66, 8, 22), look: V(-6, 2, -36), g: [0.6, 0.6, 0.6], ring: 0.6, par: 0.5}),
	crew: () => ({pos: V(0, 0, 44), look: V(0, 0, 0), g: [0.4, 0.4, 0.4], ring: 0.5, par: 0.3}),
	contact: () => {
		// landscape: ring parks on the right of the headline; portrait: it rises above it
		const wide = camera.aspect > 1.1;
		const pos = wide ? V(-6.2, -1.2, 15) : V(0, 11.5, 30);
		return {pos, look: V(pos.x, pos.y + (wide ? 0.8 : 0), 0), g: [1.25, 1.25, 1.25], ring: wide ? 1.35 : 0.9, par: wide ? 1.2 : 0.4};
	},
};

let keys = [];
function measure() {
	const vh = innerHeight;
	keys = [];
	document.querySelectorAll('[data-scene]').forEach((el) => {
		const top = el.getBoundingClientRect().top + scrollY;
		const h = el.offsetHeight;
		let a = top - vh * 0.3;
		let b = top + h - vh * 0.7;
		if (b < a) a = b = (a + b) / 2;
		keys.push({name: el.dataset.scene, a, b});
	});
	if (keys.length) keys[0].a = -1e9;
	measureO();
}
const smooth = (x) => x * x * (3 - 2 * x);
function evalState(name, q, y) {
	const s = (STATES[name] || STATES.hero)(q, y);
	if (s.lock === undefined) s.lock = 0;
	return s;
}
function mixState(A, B, t) {
	return {
		pos: A.pos.clone().lerp(B.pos, t),
		look: A.look.clone().lerp(B.look, t),
		g: A.g.map((v, i) => v + (B.g[i] - v) * t),
		ring: A.ring + (B.ring - A.ring) * t,
		par: A.par + (B.par - A.par) * t,
		lock: A.lock + (B.lock - A.lock) * t,
	};
}
function target(y) {
	if (!keys.length) return evalState('hero', 0, y);
	for (let i = 0; i < keys.length; i++) {
		const k = keys[i];
		if (y <= k.b || i === keys.length - 1) {
			if (y >= k.a || i === 0) {
				const q = k.b > k.a ? Math.min(1, Math.max(0, (y - k.a) / (k.b - k.a))) : 0.5;
				return evalState(k.name, q, y);
			}
			const prev = keys[i - 1];
			const t = smooth(Math.min(1, Math.max(0, (y - prev.b) / (k.a - prev.b))));
			return mixState(evalState(prev.name, 1, y), evalState(k.name, 0, y), t);
		}
	}
	return evalState(keys[keys.length - 1].name, 1, y);
}

/* ------------------------------------------------------------------ loop */
const cur = {pos: V(0, -1.4, 60), look: V(0, 1.4, 0), g: [0, 0, 0], ring: 0, par: 1};
const mouse = {x: 0, y: 0, sx: 0, sy: 0};
addEventListener('pointermove', (e) => {
	mouse.x = (e.clientX / innerWidth) * 2 - 1;
	mouse.y = (e.clientY / innerHeight) * 2 - 1;
});
function resize() {
	const w = innerWidth;
	const h = innerHeight;
	renderer.setSize(w, h, false);
	camera.aspect = w / h;
	camera.fov = w / h < 0.8 ? 58 : 42;
	camera.updateProjectionMatrix();
	measure();
}
addEventListener('resize', resize);
addEventListener('load', measure);
new ResizeObserver(() => measure()).observe(document.body);
resize();

let last = performance.now();
const bootAt = performance.now();
document.documentElement.classList.add('has-gl');
let running = true;
document.addEventListener('visibilitychange', () => {
	running = !document.hidden;
	if (running) {
		last = performance.now();
		requestAnimationFrame(loop);
	}
});
const tmp = V(0, 0, 0);
function loop(now) {
	if (!running) return;
	const dt = Math.min(0.05, (now - last) / 1000);
	last = now;
	const T = target(scrollY);
	const damp = reduce ? 1 : 1 - Math.exp(-dt * 3.2);
	const k = damp + (1 - damp) * T.lock;
	cur.pos.lerp(T.pos, k);
	cur.look.lerp(T.look, k);
	cur.g = cur.g.map((v, i) => v + (T.g[i] - v) * k);
	cur.ring += (T.ring - cur.ring) * k;
	cur.par += (T.par - cur.par) * k;
	mouse.sx += (mouse.x - mouse.sx) * (1 - Math.exp(-dt * 3));
	mouse.sy += (mouse.y - mouse.sy) * (1 - Math.exp(-dt * 3));

	const time = now / 1000;
	uniforms.uTime.value = reduce ? 0 : time;
	const dist = cur.pos.length();
	uniforms.uDensity.value = FOG * Math.min(1, 24 / Math.max(24, dist));
	scene.fog.density = uniforms.uDensity.value;
	glow.m.value = cur.g[0];
	glow.p.value = cur.g[1];
	glow.h.value = cur.g[2];
	ringMat.uniforms.uRing.value = cur.ring;

	camera.position.copy(cur.pos).add(tmp.set(mouse.sx * 1.6 * cur.par, -mouse.sy * 1.1 * cur.par, 0));
	camera.lookAt(cur.look);
	const intro = reduce ? 1 : Math.min(1, Math.max(0, (now - bootAt - 150) / 1300));
	const s = intro >= 1 ? 1 : 1 - Math.pow(2, -10 * intro) * Math.cos(intro * 9);
	ring.scale.setScalar(Math.max(0.001, s));
	ring.rotation.set(-mouse.sy * 0.18 + Math.sin(time * 0.4) * 0.05, mouse.sx * 0.28 + Math.sin(time * 0.3) * 0.08, time * 0.05);
	const beat = Math.pow(Math.max(0, Math.sin(time * Math.PI)), 12);
	flare.scale.setScalar(5.2 + beat * 1.6 + cur.ring * 0.8);
	floorMat.uniforms.uCam.value.copy(camera.position);
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
canvas.addEventListener('webglcontextlost', (e) => {
	e.preventDefault();
	document.documentElement.classList.add('gl-fallback');
});
