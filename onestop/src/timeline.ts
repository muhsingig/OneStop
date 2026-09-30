// 60 fps, 120 BPM: one beat = 30 frames, one bar = 120 frames.
// scripts/synth.py places its hits on these same frames.
export const FPS = 60;
export const W = 1920;
export const H = 1080;
export const BEAT = 30;
export const BAR = 120;
export const DURATION = 1800;

export const T = {
	drop: 240, // "STOP" slams in, beat starts
	names: 300, // names chime on 300 / 315 / 330
	zoom: 440, // zoom through the O
	muhsin: 480,
	pavitra: 720,
	hatim: 960,
	crew: 1200, // breakdown
	services: 1440, // second drop
	suck: 1590,
	outro: 1620, // final boom
	end: 1800,
};

export const WHIP = 24; // frames, centred on the cut
