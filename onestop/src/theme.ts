import {loadFont as loadInterTight} from '@remotion/google-fonts/InterTight';
import {loadFont as loadInstrumentSerif} from '@remotion/google-fonts/InstrumentSerif';
import {loadFont as loadJetBrainsMono} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as loadCaveat} from '@remotion/google-fonts/Caveat';

export const SANS = loadInterTight('normal', {
	weights: ['500', '700', '800', '900'],
	subsets: ['latin'],
}).fontFamily;
export const SERIF = loadInstrumentSerif('italic', {
	weights: ['400'],
	subsets: ['latin'],
}).fontFamily;
export const MONO = loadJetBrainsMono('normal', {
	weights: ['400', '500', '700'],
	subsets: ['latin'],
}).fontFamily;
export const HAND = loadCaveat('normal', {
	weights: ['600'],
	subsets: ['latin'],
}).fontFamily;

// palette pulled from the crew photo: marigold garland, magenta flower balls,
// the blue kurta, the oxblood wall
export const C = {
	ink: '#0C0A09',
	ink2: '#171311',
	cream: '#F3ECDF',
	marigold: '#FFB81C',
	berry: '#EC2F7B',
	cobalt: '#4A76FF',
	oxblood: '#3B0B13',
};

export const creamA = (a: number) => `rgba(243,236,223,${a})`;
export const inkA = (a: number) => `rgba(12,10,9,${a})`;
