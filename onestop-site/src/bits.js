/* Components ported to vanilla JS from React Bits (https://reactbits.dev, MIT + Commons Clause):
   SplitFlapText, StaggeredMenu, ProfileCard, Counter, CircularText, ClickSpark.
   StarBorder is CSS-only (see bits.css). Each keeps the original's mechanics; styling is OneStop's. */
window.Bits = (() => {
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const nb = (ch) => (ch === ' ' ? ' ' : ch);

	/* ------------------------------------------------------------ SplitFlapText
	   Every tile is two halves plus two flaps: the top flap falls away while the
	   bottom flap swings down with the next character, a step at a time. */
	const FLAP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789&-';
	function splitFlap(el, {text = '', width, flipMs = 70, staggerMs = 26, flips = 7, charset = FLAP_CHARS} = {}) {
		const w = width || text.length;
		let current = text.padEnd(w, ' ').slice(0, w);
		el.classList.add('sf');
		el.setAttribute('role', 'img');
		el.setAttribute('aria-label', current.trim());
		el.style.setProperty('--sf-flip', `${flipMs * 1.6}ms`);
		el.textContent = '';
		const tiles = [...current].map((ch) => {
			const t = document.createElement('span');
			t.className = 'sf-tile';
			t.innerHTML = '<span class="sf-half sf-top"><span class="sf-char"></span></span><span class="sf-half sf-bot"><span class="sf-char"></span></span>';
			const tile = {t, top: t.firstChild.firstChild, bot: t.lastChild.firstChild, ch};
			tile.top.textContent = tile.bot.textContent = nb(ch);
			el.appendChild(t);
			return tile;
		});
		const show = (tile, ch) => {
			tile.t.querySelectorAll('.sf-flap').forEach((n) => n.remove());
			tile.top.textContent = tile.bot.textContent = nb(ch);
			tile.ch = ch;
		};
		const flip = (tile, to) => {
			const from = tile.ch;
			tile.t.querySelectorAll('.sf-flap').forEach((n) => n.remove());
			const front = document.createElement('span');
			front.className = 'sf-flap sf-front';
			front.innerHTML = `<span class="sf-char">${nb(from)}</span>`;
			const back = document.createElement('span');
			back.className = 'sf-flap sf-back';
			back.innerHTML = `<span class="sf-char">${nb(to)}</span>`;
			tile.top.textContent = nb(to);
			tile.bot.textContent = nb(from);
			tile.t.append(front, back);
			back.addEventListener('animationend', () => {
				tile.bot.textContent = nb(to);
				front.remove();
				back.remove();
			}, {once: true});
			tile.ch = to;
		};
		let raf = 0;
		function to(target, {from, delay = 0} = {}) {
			target = String(target).padEnd(w, ' ').slice(0, w);
			el.setAttribute('aria-label', target.trim());
			cancelAnimationFrame(raf);
			if (from !== undefined) [...String(from).padEnd(w, ' ')].forEach((ch, i) => tiles[i] && show(tiles[i], ch));
			if (reduce) {
				tiles.forEach((tile, i) => show(tile, target[i]));
				current = target;
				return 0;
			}
			const plans = tiles
				.map((tile, i) => {
					if (tile.ch === target[i]) return null;
					const seq = [];
					for (let k = 0; k < flips; k++) seq.push(charset[Math.floor(Math.random() * charset.length)]);
					seq.push(target[i]);
					return {tile, seq, start: delay + i * staggerMs, step: -1};
				})
				.filter(Boolean);
			const t0 = performance.now();
			const tick = (now) => {
				let busy = false;
				for (const p of plans) {
					const e = now - t0 - p.start;
					if (e < 0) {
						busy = true;
						continue;
					}
					const s = Math.floor(e / flipMs);
					if (s < p.seq.length) {
						busy = true;
						if (s !== p.step) {
							p.step = s;
							flip(p.tile, p.seq[s]);
						}
					} else if (!p.done) {
						// frames can skip steps (slow device, hidden tab); always land on the target
						p.done = true;
						if (p.tile.ch !== p.seq[p.seq.length - 1] || p.step !== p.seq.length - 1) show(p.tile, p.seq[p.seq.length - 1]);
					}
				}
				if (busy) raf = requestAnimationFrame(tick);
			};
			raf = requestAnimationFrame(tick);
			current = target;
			return plans.reduce((m, p) => Math.max(m, p.start + p.seq.length * flipMs), 0);
		}
		/* cycle through phrases, only while the sign is on screen */
		function cycle(phrases, hold = 2600) {
			let i = 0;
			let timer = 0;
			let visible = false;
			const next = () => {
				if (!visible) return;
				i = (i + 1) % phrases.length;
				const d = to(phrases[i]);
				timer = setTimeout(next, hold + d);
			};
			new IntersectionObserver(([en]) => {
				visible = en.isIntersecting;
				clearTimeout(timer);
				if (visible) timer = setTimeout(next, hold);
			}).observe(el);
		}
		return {to, cycle};
	}

	/* ------------------------------------------------------------ StaggeredMenu
	   Coloured pre-layers sweep in one after another, then the panel, then the
	   items rise out of their masks while the numbering fades up. */
	function staggeredMenu({toggle, wrap, panel, onOpen, onClose, onGo}) {
		const layers = [...wrap.querySelectorAll('.sm-prelayer')];
		const labels = [...panel.querySelectorAll('.sm-panel-itemLabel')];
		const items = [...panel.querySelectorAll('.sm-panel-item')];
		const extras = [...panel.querySelectorAll('.sm-socials-title, .sm-socials-link, .sm-panel-title')];
		const icon = toggle.querySelector('.sm-icon');
		const inner = toggle.querySelector('.sm-toggle-textInner');
		gsap.set([panel, ...layers], {xPercent: 100});
		gsap.set(toggle.querySelector('.sm-icon-line-v'), {rotate: 90});
		let open = false;
		let tl = null;
		const cycleText = (opening) => {
			const seq = [opening ? 'Menu' : 'Close'];
			for (let k = 0; k < 3; k++) seq.push(seq[seq.length - 1] === 'Menu' ? 'Close' : 'Menu');
			const target = opening ? 'Close' : 'Menu';
			if (seq[seq.length - 1] !== target) seq.push(target);
			seq.push(target);
			inner.innerHTML = seq.map((l) => `<span class="sm-toggle-line">${l}</span>`).join('');
			gsap.fromTo(inner, {yPercent: 0}, {yPercent: -((seq.length - 1) / seq.length) * 100, duration: 0.5 + seq.length * 0.07, ease: 'power4.out'});
		};
		const playOpen = () => {
			wrap.dataset.open = 'true';
			panel.setAttribute('aria-hidden', 'false');
			gsap.set(labels, {yPercent: 140, rotate: 10});
			gsap.set(items, {'--sm-num-opacity': 0});
			gsap.set(extras, {y: 25, opacity: 0});
			tl?.kill();
			tl = gsap.timeline();
			layers.forEach((l, i) => tl.fromTo(l, {xPercent: 100}, {xPercent: 0, duration: 0.5, ease: 'power4.out'}, i * 0.07));
			const at = (layers.length - 1) * 0.07 + 0.08;
			tl.fromTo(panel, {xPercent: 100}, {xPercent: 0, duration: 0.65, ease: 'power4.out'}, at);
			tl.to(labels, {yPercent: 0, rotate: 0, duration: 1, ease: 'power4.out', stagger: 0.07}, at + 0.1);
			tl.to(items, {'--sm-num-opacity': 1, duration: 0.6, ease: 'power2.out', stagger: 0.06}, at + 0.2);
			tl.to(extras, {y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', stagger: 0.05}, at + 0.3);
		};
		const playClose = () => {
			tl?.kill();
			gsap.to([...layers, panel], {
				xPercent: 100,
				duration: 0.32,
				ease: 'power3.in',
				overwrite: 'auto',
				onComplete: () => {
					if (!open) {
						wrap.dataset.open = 'false';
						panel.setAttribute('aria-hidden', 'true');
					}
				},
			});
		};
		const set = (v) => {
			if (v === open) return;
			open = v;
			toggle.setAttribute('aria-expanded', String(v));
			toggle.setAttribute('aria-label', v ? 'Close menu' : 'Open menu');
			if (v) {
				playOpen();
				onOpen?.();
			} else {
				playClose();
				onClose?.();
			}
			gsap.to(icon, v ? {rotate: 225, duration: 0.8, ease: 'power4.out'} : {rotate: 0, duration: 0.35, ease: 'power3.inOut'});
			cycleText(v);
		};
		toggle.addEventListener('click', () => set(!open));
		addEventListener('keydown', (e) => e.key === 'Escape' && set(false));
		document.addEventListener('pointerdown', (e) => {
			if (open && !panel.contains(e.target) && !toggle.contains(e.target)) set(false);
		});
		panel.querySelectorAll('[data-menu-go]').forEach((a) =>
			a.addEventListener('click', (e) => {
				e.preventDefault();
				set(false);
				setTimeout(() => onGo?.(a.dataset.menuGo), 220);
			}),
		);
		return {set, get open() { return open; }};
	}

	/* ------------------------------------------------------------ ProfileCard
	   Pointer position drives CSS variables through an eased follower, so the
	   holographic foil, glare and tilt all glide rather than snap. */
	function profileCard(wrap) {
		const shell = wrap.querySelector('.pc-shell');
		const clamp = (v, a = 0, b = 100) => Math.min(Math.max(v, a), b);
		const round = (v) => parseFloat(v.toFixed(3));
		const adjust = (v, fMin, fMax, tMin, tMax) => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));
		let cx = 0, cy = 0, tx = 0, ty = 0, raf = 0, last = 0, initialUntil = 0;
		const setVars = (x, y) => {
			const w = shell.clientWidth || 1;
			const h = shell.clientHeight || 1;
			const px = clamp((100 / w) * x);
			const py = clamp((100 / h) * y);
			const vars = {
				'--pointer-x': `${px}%`,
				'--pointer-y': `${py}%`,
				'--background-x': `${adjust(px, 0, 100, 35, 65)}%`,
				'--background-y': `${adjust(py, 0, 100, 35, 65)}%`,
				'--pointer-from-center': `${clamp(Math.hypot(py - 50, px - 50) / 50, 0, 1)}`,
				'--pointer-from-top': `${py / 100}`,
				'--pointer-from-left': `${px / 100}`,
				'--rotate-x': `${round(-((px - 50) / 5))}deg`,
				'--rotate-y': `${round((py - 50) / 4)}deg`,
			};
			for (const k in vars) wrap.style.setProperty(k, vars[k]);
		};
		const step = (ts) => {
			if (!last) last = ts;
			const dt = (ts - last) / 1000;
			last = ts;
			const k = 1 - Math.exp(-dt / (ts < initialUntil ? 0.6 : 0.14));
			cx += (tx - cx) * k;
			cy += (ty - cy) * k;
			setVars(cx, cy);
			if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) raf = requestAnimationFrame(step);
			else {
				raf = 0;
				last = 0;
				if (!wrap.matches(':hover')) wrap.classList.remove('active');
			}
		};
		const target = (x, y) => {
			tx = x;
			ty = y;
			if (!raf) raf = requestAnimationFrame(step);
		};
		const offs = (e) => {
			const r = shell.getBoundingClientRect();
			return [e.clientX - r.left, e.clientY - r.top];
		};
		shell.addEventListener('pointerenter', (e) => {
			wrap.classList.add('active');
			shell.classList.add('entering');
			setTimeout(() => shell.classList.remove('entering'), 180);
			target(...offs(e));
		});
		shell.addEventListener('pointermove', (e) => target(...offs(e)));
		shell.addEventListener('pointerleave', () => target(shell.clientWidth / 2, shell.clientHeight / 2));
		// the original's intro: the light starts in the top-right corner and settles in the middle
		new IntersectionObserver(([en], io) => {
			if (!en.isIntersecting) return;
			io.disconnect();
			cx = shell.clientWidth - 70;
			cy = 60;
			setVars(cx, cy);
			initialUntil = performance.now() + (reduce ? 0 : 1200);
			wrap.classList.add('active');
			target(shell.clientWidth / 2, shell.clientHeight / 2);
		}, {threshold: 0.3}).observe(wrap);
	}

	/* ------------------------------------------------------------ Counter
	   Odometer wheels: each place is a 0-9 strip; a wheel only turns over as the
	   wheel to its right completes its last tenth, like the real thing. */
	function counter(el, value, {suffix = ''} = {}) {
		const str = value.toLocaleString('en-IN');
		const digits = String(value).length;
		el.textContent = '';
		el.classList.add('odo');
		el.setAttribute('aria-label', str + suffix);
		const wheels = [];
		let d = 0;
		for (const ch of str) {
			if (/\d/.test(ch)) {
				const place = 10 ** (digits - 1 - d++);
				const col = document.createElement('span');
				col.className = 'odo-digit';
				col.setAttribute('aria-hidden', 'true');
				const strip = document.createElement('span');
				strip.className = 'odo-strip';
				strip.innerHTML = '0123456789' .split('').concat('0').map((n) => `<span>${n}</span>`).join('');
				col.appendChild(strip);
				el.appendChild(col);
				wheels.push({strip, place});
			} else {
				const s = document.createElement('span');
				s.className = 'odo-sep';
				s.setAttribute('aria-hidden', 'true');
				s.textContent = ch;
				el.appendChild(s);
			}
		}
		if (suffix) {
			const s = document.createElement('span');
			s.className = 'odo-sep';
			s.setAttribute('aria-hidden', 'true');
			s.textContent = suffix;
			el.appendChild(s);
		}
		const set = (v) => {
			for (const w of wheels) {
				const whole = Math.floor(v / w.place + 1e-9);
				const frac = (v % w.place) / w.place;
				const carry = Math.min(1, Math.max(0, (frac - 0.9) / 0.1));
				w.strip.style.transform = `translateY(${-(((whole % 10) + carry) % 11)}em)`;
			}
		};
		set(value);
		return {
			roll(duration = 2.2) {
				if (reduce) return set(value);
				const o = {v: 0};
				set(0);
				gsap.to(o, {v: value, duration, ease: 'power3.out', onUpdate: () => set(o.v), onComplete: () => set(value)});
			},
		};
	}

	/* ------------------------------------------------------------ CircularText */
	function circularText(el, text, {duration = 18, hoverTarget} = {}) {
		const chars = [...text];
		el.classList.add('ctext');
		el.setAttribute('aria-hidden', 'true');
		el.innerHTML = chars.map((c, i) => `<span style="transform:rotate(${(360 / chars.length) * i}deg)">${nb(c)}</span>`).join('');
		if (reduce) return;
		const spin = gsap.to(el, {rotation: 360, duration, ease: 'none', repeat: -1});
		const t = hoverTarget || el.parentElement;
		t.addEventListener('pointerenter', () => gsap.to(spin, {timeScale: 4, duration: 0.6, ease: 'power2.out'}));
		t.addEventListener('pointerleave', () => gsap.to(spin, {timeScale: 1, duration: 0.9, ease: 'power2.out'}));
	}

	/* ------------------------------------------------------------ ClickSpark */
	function clickSpark({colors = ['#FFB81C', '#EC2F7B', '#4A76FF'], size = 12, radius = 26, count = 9, duration = 460} = {}) {
		if (reduce) return;
		const cv = document.createElement('canvas');
		cv.className = 'spark-layer';
		cv.setAttribute('aria-hidden', 'true');
		document.body.appendChild(cv);
		const ctx = cv.getContext('2d');
		let sparks = [];
		let raf = 0;
		const fit = () => {
			const dpr = Math.min(devicePixelRatio || 1, 2);
			cv.width = innerWidth * dpr;
			cv.height = innerHeight * dpr;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		};
		fit();
		addEventListener('resize', fit);
		const draw = (now) => {
			ctx.clearRect(0, 0, innerWidth, innerHeight);
			sparks = sparks.filter((s) => {
				const p = (now - s.t) / duration;
				if (p >= 1) return false;
				const e = p * (2 - p);
				const dist = e * radius;
				const len = size * (1 - e);
				ctx.strokeStyle = s.c;
				ctx.lineWidth = 2.5;
				ctx.lineCap = 'round';
				ctx.beginPath();
				ctx.moveTo(s.x + dist * Math.cos(s.a), s.y + dist * Math.sin(s.a));
				ctx.lineTo(s.x + (dist + len) * Math.cos(s.a), s.y + (dist + len) * Math.sin(s.a));
				ctx.stroke();
				return true;
			});
			raf = sparks.length ? requestAnimationFrame(draw) : 0;
		};
		addEventListener('pointerdown', (e) => {
			const t = performance.now();
			for (let i = 0; i < count; i++) sparks.push({x: e.clientX, y: e.clientY, a: (Math.PI * 2 * i) / count, t, c: colors[i % colors.length]});
			if (!raf) raf = requestAnimationFrame(draw);
		});
	}

	return {splitFlap, staggeredMenu, profileCard, counter, circularText, clickSpark};
})();
