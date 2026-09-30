import {C} from './theme';

// Everything below is pulled from the three CVs. Edit copy here.
export type Member = {
	key: string;
	index: string;
	first: string;
	last: string;
	color: string;
	role: string;
	stations: {name: string; sub: string}[];
	chips: {label: string; cert?: boolean}[];
	/** portrait + square crop (centre and side, in source pixels) */
	photo: {src: string; w: number; h: number; cx: number; cy: number; side: number};
};

export const MEMBERS: Member[] = [
	{
		key: 'M',
		index: '01',
		first: 'MUHSIN',
		last: 'GIGANI',
		color: C.marigold,
		photo: {src: 'img/portrait-muhsin.jpg', w: 1018, h: 1077, cx: 509, cy: 480, side: 880},
		role: 'brand, content & build.',
		stations: [
			{name: 'Toy Kingdom', sub: 'SOCIAL MEDIA MANAGER'},
			{name: 'Digital Nexus', sub: 'HEAD OF MARKETING'},
			{name: 'Talaash', sub: 'HEAD OF EXECUTIONS'},
			{name: 'Aura Coffee', sub: '3D E-COMMERCE BUILD'},
		],
		chips: [
			{label: 'Canva'},
			{label: 'Cursor'},
			{label: 'Vercel'},
			{label: 'Google Ads'},
			{label: 'SEO'},
			{label: 'Gen-AI'},
		],
	},
	{
		key: 'P',
		index: '02',
		first: 'PAVITRA',
		last: 'RAJPAL',
		color: C.berry,
		photo: {src: 'img/portrait-pavitra.jpg', w: 960, h: 1280, cx: 525, cy: 520, side: 620},
		role: 'ads, analytics & clients.',
		stations: [
			{name: 'JioHotstar', sub: 'AD OPS · IPL 2026'},
			{name: 'JioHotstar', sub: 'CLIENT SERVICING'},
			{name: 'Relkra Digital', sub: 'PR & SOCIAL MEDIA'},
			{name: 'Talaash', sub: 'HEAD OF EVENTS'},
		],
		chips: [
			{label: 'Google Ads', cert: true},
			{label: 'GA4', cert: true},
			{label: 'Looker Studio'},
			{label: 'Excel'},
			{label: 'SEMrush'},
			{label: 'Gemini'},
		],
	},
	{
		key: 'H',
		index: '03',
		first: 'HATIM',
		last: 'SAMPALWALA',
		color: C.cobalt,
		photo: {src: 'img/portrait-hatim.jpg', w: 1206, h: 1556, cx: 592, cy: 700, side: 1000},
		role: 'SEO, social & data.',
		stations: [
			{name: 'Django', sub: '6 ACCOUNTS · 4 PLATFORMS'},
			{name: 'Toy Kingdom', sub: '2,500+ FOLLOWERS'},
			{name: 'Sushil Finance', sub: 'FULL-SITE SEO AUDITS'},
			{name: 'Zuhoor Blossoms', sub: 'LIVE E-COM STOREFRONT'},
		],
		chips: [
			{label: 'Google Ads', cert: true},
			{label: 'Semrush'},
			{label: 'Ahrefs'},
			{label: 'Screaming Frog'},
			{label: 'Keyword Planner'},
			{label: 'Dashboards'},
		],
	},
];

export const SERVICES = [
	{label: 'Strategy', icon: 'compass'},
	{label: 'Performance Ads', icon: 'target'},
	{label: 'SEO & AEO', icon: 'search'},
	{label: 'Social Media', icon: 'bubble'},
	{label: 'Content & Reels', icon: 'play'},
	{label: 'Web & E-com', icon: 'browser'},
	{label: 'Dashboards', icon: 'bars'},
	{label: 'Events', icon: 'ticket'},
] as const;

export const BRANDS = [
	'JioHotstar',
	'Toy Kingdom',
	'Django',
	'Fulus',
	'Relkra Digital',
	'IIDE',
	'Sushil Finance',
	'Amigo Cars',
	'Talaash',
	'Digital Nexus',
	'Zuhoor Blossoms',
];
