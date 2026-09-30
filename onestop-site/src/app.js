(() => {
	const $ = (s, r = document) => r.querySelector(s);
	const $$ = (s, r = document) => [...r.querySelectorAll(s)];
	const html = document.documentElement;
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

	/* ---------------------------------------------------------- grain */
	try {
		const c = document.createElement('canvas');
		c.width = c.height = 180;
		const x = c.getContext('2d');
		const d = x.createImageData(180, 180);
		for (let i = 0; i < d.data.length; i += 4) {
			const v = Math.random() * 255;
			d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
			d.data[i + 3] = 255;
		}
		x.putImageData(d, 0, 0);
		$('.grain').style.backgroundImage = `url(${c.toDataURL()})`;
	} catch (e) {}

	/* ---------------------------------------------------------- Mumbai clock */
	const clock = $('#clock');
	const fmt = new Intl.DateTimeFormat('en-GB', {timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false});
	const tick = () => (clock.textContent = fmt.format(new Date()));
	tick();
	setInterval(tick, 1000);

	/* ---------------------------------------------------------- departures board */
	const SERVICES = [
		['STRATEGY', 'mph', 'Digital Strategy, Jai Hind College ’27', 'Positioning, audience and one plan that ties every channel together.', ['jaihind.png', 'Jai Hind College']],
		['PERFORMANCE ADS', 'mph', 'IPL 2026 ad ops at JioHotstar', 'Google Ads search campaigns, pacing, optimisation and reporting.', ['jiohotstar.png', 'JioHotstar']],
		['SEO & AEO', 'mph', 'Full-site audits for Sushil Finance', 'Audits, keyword research and content written for search engines and AI answers.', ['sushil.svg', 'Sushil Finance']],
		['SOCIAL MEDIA', 'mph', '6 accounts across 4 platforms at Django', 'Calendars, community and trend-led content, one brand voice everywhere.', ['django.png', 'Django Digital']],
		['CONTENT & REELS', 'mph', '3–4 reels a week, 2,500+ followers', 'Hooks tested against engagement data, formats scaled when they work.', ['toykingdom.png', 'Toy Kingdom', 'plate--dark']],
		['WEB & E-COMMERCE', 'mh', 'Zuhoor Blossoms, a live storefront', 'Storefronts and sites, from structure and copy to on-page SEO.', ['zuhoor.svg', 'Zuhoor Blossoms', 'plate--green']],
		['DASHBOARDS & DATA', 'ph', 'Monthly 6-account client dashboards', 'Reporting in Sheets, Excel and Looker Studio that clients act on.', ['google-analytics.svg', 'Google Analytics']],
		['CLIENT SERVICING', 'mp', 'Advertiser accounts at JioHotstar', 'Account management, lead handling and updates people can use.', ['jiohotstar.png', 'JioHotstar']],
		['EVENTS & SPONSORS', 'mp', 'Rio and Mexibay signed for Digital Nexus', 'College-scale events and sponsorships, from concept to the last chair.', ['nexus.png', 'Jai Hind Digital Nexus', 'plate--dark']],
	];
	const WIDTH = 17;
	const rows = $('#board-rows');
	const signs = [];
	SERVICES.forEach(([name, calls, proof, desc, logo]) => {
		const row = document.createElement('div');
		row.className = 'board__row';
		row.setAttribute('role', 'row');
		const flaps = document.createElement('div');
		flaps.className = 'flaps';
		const who = document.createElement('div');
		who.className = 'calls';
		who.innerHTML = ['m', 'p', 'h']
			.map((k) => `<span class="${k}${calls.includes(k) ? ' on' : ''}" title="${{m: 'Muhsin', p: 'Pavitra', h: 'Hatim'}[k]}${calls.includes(k) ? '' : ' (not calling)'}">${k.toUpperCase()}</span>`)
			.join('');
		const pr = document.createElement('div');
		pr.className = 'proof';
		const plate = logo ? `<span class="plate plate--xs ${logo[2] || ''}"><img src="assets/logos/${logo[0]}" alt="${logo[1]} logo" loading="lazy"></span>` : '';
		pr.innerHTML = `<span class="proof__line">${plate}<span>${proof}</span></span><small>${desc}</small>`;
		row.append(flaps, who, pr);
		rows.appendChild(row);
		signs.push({sign: Bits.splitFlap(flaps, {text: name, width: WIDTH}), name});
	});
	/* departures roll in row by row, each from a blank board */
	const runBoard = () => signs.forEach(({sign, name}, r) => sign.to(name, {from: '', delay: r * 120}));

	/* ---------------------------------------------------------- tool icons on chips (Simple Icons, CC0) */
	const ICONS = {
		'Canva': 'canva', 'Google Ads': 'googleads', 'Google Ads Search': 'googleads', 'Keyword Planner': 'googleads',
		'Cursor': 'cursor', 'Vercel': 'vercel', 'GitHub': 'github', 'WordPress': 'wordpress', 'Zapier': 'zapier',
		'Google Analytics 4': 'googleanalytics', 'Sheets & Excel': 'googlesheets', 'SEMrush': 'semrush', 'Semrush': 'semrush',
		'Gemini': 'googlegemini', 'Claude 101': 'claude', 'YouTube Studio': 'youtubestudio',
	};
	$$('.chips li').forEach((li) => {
		const slug = ICONS[li.textContent.trim()];
		if (!slug) return;
		const i = document.createElement('i');
		i.className = 'ico';
		i.setAttribute('aria-hidden', 'true');
		i.style.setProperty('--ico', `url("assets/logos/tools/${slug}.svg")`);
		li.prepend(i);
		li.classList.add('has-ico');
	});

	/* ---------------------------------------------------------- copy buttons */
	$$('[data-copy]').forEach((b) => {
		b.addEventListener('click', async () => {
			const code = document.getElementById(b.dataset.copy);
			try {
				await navigator.clipboard.writeText(code.textContent.trim());
				b.textContent = 'Copied';
			} catch (e) {
				const range = document.createRange();
				range.selectNodeContents(code);
				const sel = getSelection();
				sel.removeAllRanges();
				sel.addRange(range);
				b.textContent = 'Selected';
			}
			setTimeout(() => (b.textContent = 'Copy'), 1600);
		});
	});

	/* ---------------------------------------------------------- film modal */
	const modal = $('#modal');
	const film = $('#film');
	const preview = $('#film-preview');
	let lenis = null;
	const openFilm = () => {
		modal.hidden = false;
		lenis?.stop();
		preview?.pause();
		film.currentTime = 0;
		film.play().catch(() => {});
		$('#modal-close').focus();
	};
	const closeFilm = () => {
		film.pause();
		modal.hidden = true;
		lenis?.start();
	};
	$$('[data-film]').forEach((b) => b.addEventListener('click', openFilm));
	$('#modal-close').addEventListener('click', closeFilm);
	modal.addEventListener('click', (e) => e.target === modal && closeFilm());
	addEventListener('keydown', (e) => e.key === 'Escape' && !modal.hidden && closeFilm());
	if (preview && 'IntersectionObserver' in window && !reduce) {
		new IntersectionObserver(([en]) => (en.isIntersecting && modal.hidden ? preview.play().catch(() => {}) : preview.pause()), {threshold: 0.35}).observe(preview);
	}

	/* ---------------------------------------------------------- petals (crew) */
	(function petals() {
		const cv = $('#petals');
		if (!cv || reduce) return;
		const ctx = cv.getContext('2d');
		let w = 0, h = 0, on = false, raf = 0;
		const N = matchMedia('(max-width: 760px)').matches ? 18 : 34;
		const ps = Array.from({length: N}, () => ({x: Math.random(), y: Math.random(), s: 8 + Math.random() * 16, v: 0.4 + Math.random() * 0.9, a: Math.random() * 6.28, sp: (Math.random() - 0.5) * 0.05, sw: Math.random() * 6.28, hue: Math.random()}));
		const size = () => {
			const r = cv.getBoundingClientRect();
			const d = Math.min(devicePixelRatio, 1.5);
			w = r.width; h = r.height;
			cv.width = w * d; cv.height = h * d;
			ctx.setTransform(d, 0, 0, d, 0, 0);
		};
		const draw = () => {
			ctx.clearRect(0, 0, w, h);
			for (const p of ps) {
				p.y += p.v / h * 1.6;
				p.a += p.sp;
				p.sw += 0.015;
				if (p.y > 1.05) { p.y = -0.05; p.x = Math.random(); }
				const x = p.x * w + Math.sin(p.sw) * 30, y = p.y * h;
				ctx.save();
				ctx.translate(x, y);
				ctx.rotate(p.a);
				ctx.scale(1, Math.abs(Math.cos(p.a * 1.7)) * 0.7 + 0.3);
				const g = ctx.createLinearGradient(0, -p.s, 0, p.s);
				g.addColorStop(0, p.hue > 0.5 ? '#FFD15A' : '#FFB81C');
				g.addColorStop(1, p.hue > 0.5 ? '#FF9A1F' : '#F06A10');
				ctx.fillStyle = g;
				ctx.globalAlpha = 0.85;
				ctx.beginPath();
				ctx.ellipse(0, 0, p.s * 0.55, p.s * 0.8, 0, 0, Math.PI * 2);
				ctx.fill();
				ctx.restore();
			}
			if (on) raf = requestAnimationFrame(draw);
		};
		size();
		addEventListener('resize', size);
		new IntersectionObserver(([en]) => {
			on = en.isIntersecting;
			cancelAnimationFrame(raf);
			if (on) raf = requestAnimationFrame(draw);
		}).observe(cv);
	})();

	/* ---------------------------------------------------------- everything below needs GSAP */
	if (!window.gsap || !window.ScrollTrigger) {
		$('#journey')?.classList.remove('is-away');
		return;
	}
	gsap.registerPlugin(ScrollTrigger);
	if (window.SplitText) gsap.registerPlugin(SplitText);
	if (window.Draggable) gsap.registerPlugin(Draggable);
	if (window.InertiaPlugin) gsap.registerPlugin(InertiaPlugin);

	if (!reduce && window.Lenis) {
		lenis = new Lenis({lerp: 0.085, smoothWheel: true, wheelMultiplier: 1});
		lenis.on('scroll', ScrollTrigger.update);
		gsap.ticker.add((t) => lenis.raf(t * 1000));
		gsap.ticker.lagSmoothing(0);
		window.__lenis = lenis;
	}
	const go = (id) => {
		const el = document.getElementById(id);
		if (!el) return;
		if (lenis) lenis.scrollTo(el, {duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4)});
		else el.scrollIntoView({behavior: reduce ? 'auto' : 'smooth'});
	};
	$$('[data-go]').forEach((a) =>
		a.addEventListener('click', (e) => {
			e.preventDefault();
			go(a.dataset.go);
		}),
	);

	/* ---------------------------------------------------------- React Bits ports */
	const menu = Bits.staggeredMenu({
		toggle: $('#menu-toggle'),
		wrap: $('#menu'),
		panel: $('#menu-panel'),
		onOpen: () => lenis?.stop(),
		onClose: () => lenis?.start(),
		onGo: go,
	});
	Bits.clickSpark();
	Bits.circularText($('#film-ring'), 'PLAY THE FILM \u2022 30 SECONDS \u2022 WITH SOUND \u2022 ', {hoverTarget: $('.card--film')});
	$$('.pc-wrap').forEach((w) => Bits.profileCard(w));
	Bits.splitFlap($('#dest-sign'), {text: 'YOUR BRAND', width: 11, flipMs: 80, staggerMs: 40}).cycle(
		['YOUR BRAND', 'YOUR LAUNCH', 'YOUR STORE', 'YOUR REELS', 'YOUR EVENT', 'YOUR ADS'],
		2400,
	);

	/* nav: hide on the way down, return on the way up */
	const nav = $('#nav');
	let lastY = 0;
	ScrollTrigger.create({
		start: 0,
		end: 'max',
		onUpdate(self) {
			const y = self.scroll();
			nav.classList.toggle('is-hidden', y > lastY && y > 500 && modal.hidden && !menu.open);
			nav.classList.toggle('is-solid', y > 60);
			lastY = y;
		},
	});

	/* ---------------------------------------------------------- journey bar */
	const stops = $$('[data-scene][data-label]').filter((s) => s.id !== 'lines');
	const track = $('#journey-track');
	const fill = $('#journey-fill');
	const now = $('#journey-now');
	const journey = $('#journey');
	const dots = stops.map((s) => {
		const b = document.createElement('button');
		b.className = 'jstop';
		b.type = 'button';
		b.setAttribute('aria-label', `Go to ${s.dataset.label}`);
		b.innerHTML = `<span>${s.dataset.label}</span>`;
		b.addEventListener('click', () => go(s.id));
		track.appendChild(b);
		return b;
	});
	const navLinks = $$('.nav__links a');
	function updateJourney() {
		const y = scrollY + innerHeight * 0.5;
		let i = 0;
		for (let k = 0; k < stops.length; k++) if (stops[k].offsetTop <= y) i = k;
		const s = stops[i];
		const next = stops[i + 1];
		const p = next ? Math.min(1, Math.max(0, (y - s.offsetTop) / (next.offsetTop - s.offsetTop))) : 0;
		const a = dots[i].offsetLeft + 7;
		const b = next ? dots[i + 1].offsetLeft + 7 : a;
		fill.style.width = `${a + (b - a) * p - 10}px`;
		const col = s.dataset.color;
		journey.style.setProperty('--jc', col);
		dots.forEach((d, k) => {
			d.classList.toggle('is-passed', k <= i);
			d.classList.toggle('is-active', k === i);
		});
		now.textContent = s.dataset.label;
		journey.classList.toggle('is-away', scrollY < innerHeight * 0.55);
		const sec = s.id === 'muhsin' || s.id === 'pavitra' || s.id === 'hatim' ? 'lines' : s.id;
		navLinks.forEach((l) => l.classList.toggle('is-active', l.dataset.go === sec));
	}
	ScrollTrigger.create({start: 0, end: 'max', onUpdate: updateJourney, onRefresh: updateJourney});

	/* ---------------------------------------------------------- headline reveals */
	if (!reduce && window.SplitText) {
		$$('.h2, .contact__title').forEach((h) => {
			const st = new SplitText(h, {type: 'lines', mask: 'lines'});
			gsap.from(st.lines, {yPercent: 105, rotate: 2, duration: 1.2, ease: 'expo.out', stagger: 0.1, scrollTrigger: {trigger: h, start: 'top 88%'}});
		});
		$$('.member__name .nm').forEach((n) => {
			const st = new SplitText(n, {type: 'chars', mask: 'chars'});
			gsap.from(st.chars, {yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.045, scrollTrigger: {trigger: n, start: 'top 85%'}});
		});
		/* manifesto: words light up as you read down */
		const m = new SplitText('#manifesto', {type: 'words'});
		gsap.fromTo(m.words, {opacity: 0.16}, {opacity: 1, ease: 'none', stagger: 0.08, scrollTrigger: {trigger: '#manifesto', start: 'top 78%', end: 'bottom 50%', scrub: true}});
	}

	/* stats roll in like an odometer */
	$$('[data-count]').forEach((el) => {
		const odo = Bits.counter(el, +el.dataset.count, {suffix: el.dataset.suffix || ''});
		ScrollTrigger.create({trigger: el, start: 'top 88%', once: true, onEnter: () => odo.roll()});
	});

	/* ---------------------------------------------------------- member lines */
	$$('.member').forEach((sec) => {
		const tl = $('.tl', sec);
		gsap.fromTo($('.tl__fill', sec), {scaleY: 0}, {scaleY: 1, ease: 'none', scrollTrigger: {trigger: tl, start: 'top 62%', end: 'bottom 62%', scrub: 0.4}});
		$$('.stop', sec).forEach((stop) =>
			ScrollTrigger.create({
				trigger: stop,
				start: 'top 64%',
				onEnter: () => stop.classList.add('is-lit'),
				onLeaveBack: () => stop.classList.remove('is-lit'),
			}),
		);
		if (!reduce) {
			$$('.stop__card', sec).forEach((card) =>
				gsap.fromTo(card, {x: 70, rotate: 1.2}, {x: 0, rotate: 0, ease: 'none', scrollTrigger: {trigger: card, start: 'top 98%', end: 'top 62%', scrub: 0.6}}),
			);
			const ring = $('.portrait', sec);
			gsap.from(ring, {scale: 0.6, rotate: -25, duration: 1.4, ease: 'elastic.out(1, 0.6)', scrollTrigger: {trigger: sec, start: 'top 70%'}});
		}
	});

	/* ---------------------------------------------------------- board + covers */
	ScrollTrigger.create({trigger: '#board', start: 'top 80%', once: true, onEnter: runBoard});
	if (!reduce) {
		$$('.cover__lines path').forEach((p) => {
			const len = p.getTotalLength();
			gsap.fromTo(p, {strokeDasharray: len, strokeDashoffset: len}, {strokeDashoffset: 0, duration: 1.6, ease: 'expo.out', scrollTrigger: {trigger: p.closest('.card'), start: 'top 85%'}});
		});
	}

	/* ---------------------------------------------------------- tilt + magnetic */
	if (fine && !reduce) {
		$$('[data-tilt]').forEach((card) => {
			card.addEventListener('pointermove', (e) => {
				const r = card.getBoundingClientRect();
				const px = (e.clientX - r.left) / r.width;
				const py = (e.clientY - r.top) / r.height;
				card.style.setProperty('--ry', `${(px - 0.5) * 9}deg`);
				card.style.setProperty('--rx', `${(0.5 - py) * 9}deg`);
				card.style.setProperty('--gx', `${px * 100}%`);
				card.style.setProperty('--gy', `${py * 100}%`);
			});
			card.addEventListener('pointerleave', () => {
				card.style.setProperty('--rx', '0deg');
				card.style.setProperty('--ry', '0deg');
			});
		});
		$$('.pill, .film-play').forEach((b) => {
			const qx = gsap.quickTo(b, 'x', {duration: 0.5, ease: 'power3'});
			const qy = gsap.quickTo(b, 'y', {duration: 0.5, ease: 'power3'});
			b.addEventListener('pointermove', (e) => {
				const r = b.getBoundingClientRect();
				qx((e.clientX - r.left - r.width / 2) * 0.28);
				qy((e.clientY - r.top - r.height / 2) * 0.35);
			});
			b.addEventListener('pointerleave', () => {
				qx(0);
				qy(0);
			});
		});
	}

	/* ---------------------------------------------------------- crew polaroids */
	const board = $('#crew-board');
	const pols = $$('.polaroid', board);
	pols.forEach((p) => gsap.set(p, {rotation: parseFloat(p.style.getPropertyValue('--r')) || 0}));
	if (!reduce) {
		gsap.from(pols, {y: -120, rotation: '+=14', scale: 1.08, duration: 1.3, ease: 'expo.out', stagger: 0.09, scrollTrigger: {trigger: board, start: 'top 75%'}});
	}
	if (fine && window.Draggable) {
		html.classList.add('can-drag');
		let z = 10;
		Draggable.create(pols, {
			bounds: board,
			inertia: !!window.InertiaPlugin,
			edgeResistance: 0.6,
			onPress() {
				this.target.style.zIndex = ++z;
				this.target.classList.add('is-drag');
				gsap.to(this.target, {scale: 1.06, duration: 0.3, ease: 'power3'});
			},
			onRelease() {
				this.target.classList.remove('is-drag');
				gsap.to(this.target, {scale: 1, rotation: `+=${(Math.random() - 0.5) * 10}`, duration: 0.6, ease: 'elastic.out(1, 0.7)'});
			},
		});
	} else {
		$('#crew-hint').textContent = 'Straight from the camera roll.';
	}

	/* ---------------------------------------------------------- marquee */
	const mq = $('#marquee');
	mq.innerHTML += mq.innerHTML;
	const loop = gsap.to(mq, {xPercent: -50, duration: reduce ? 0 : 46, ease: 'none', repeat: -1});
	const lt = $('#logo-track');
	const half = lt.children.length;
	lt.innerHTML += lt.innerHTML;
	[...lt.children].slice(half).forEach((c) => c.setAttribute('aria-hidden', 'true'));
	const logoLoop = gsap.fromTo(lt, {xPercent: -50}, {xPercent: 0, duration: reduce ? 0 : 52, ease: 'none', repeat: -1});
	if (reduce) logoLoop.pause();
	if (reduce) loop.pause();
	if (lenis) {
		const skew = gsap.quickTo(mq, 'skewX', {duration: 0.5, ease: 'power3'});
		lenis.on('scroll', ({velocity}) => {
			const v = Math.max(-40, Math.min(40, velocity));
			loop.timeScale(1 + Math.abs(v) * 0.15);
			logoLoop.timeScale(1 + Math.abs(v) * 0.12);
			skew(-v * 0.25);
		});
	}

	/* ---------------------------------------------------------- cursor + wordmark */
	if (fine && !reduce) {
		html.classList.add('has-cursor');
		const ring = $('.cursor');
		const dot = $('.cursor-dot');
		const label = $('.cursor b');
		let mx = -9999, my = -9999, cx = innerWidth / 2, cy = innerHeight / 2;
		addEventListener('pointermove', (e) => {
			mx = e.clientX;
			my = e.clientY;
			dot.style.transform = `translate(${mx}px, ${my}px)`;
		});
		document.addEventListener('pointerover', (e) => {
			const t = e.target.closest('[data-cursor], a, button, .polaroid');
			ring.classList.remove('is-big', 'is-link');
			if (!t) return;
			if (t.dataset.cursor) {
				label.textContent = t.dataset.cursor;
				ring.classList.add('is-big');
			} else if (t.classList.contains('polaroid')) {
				label.textContent = 'DRAG';
				ring.classList.add('is-big');
			} else ring.classList.add('is-link');
		});
		const chars = $$('.hero .ch');
		const offs = chars.map(() => ({x: 0, y: 0}));
		gsap.ticker.add(() => {
			cx += (mx - cx) * 0.2;
			cy += (my - cy) * 0.2;
			ring.style.transform = `translate(${cx}px, ${cy}px)`;
			if (scrollY > innerHeight) return;
			chars.forEach((c, i) => {
				const r = c.getBoundingClientRect();
				const dx = r.left + r.width / 2 - mx;
				const dy = r.top + r.height / 2 - my;
				const d = Math.hypot(dx, dy);
				const f = Math.max(0, 1 - d / 320);
				const tx = (dx / (d || 1)) * f * 34;
				const ty = (dy / (d || 1)) * f * 26;
				offs[i].x += (tx - offs[i].x) * 0.12;
				offs[i].y += (ty - offs[i].y) * 0.12;
				c.style.translate = `${offs[i].x.toFixed(2)}px ${offs[i].y.toFixed(2)}px`;
			});
		});
	}

	addEventListener('load', () => ScrollTrigger.refresh());
})();
