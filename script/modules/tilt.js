/*!
 * TiltEffect — 鼠标跟随 3D 倾斜 + 跟随高光
 * 用法：
 *   dkx.tilt('.card')                 // 匹配所有 .card
 *   dkx.tilt('#hero', { maxTilt: 20 })// 单个 id + 自定义参数
 */
const DEFAULTS = Object.freeze({
	maxTilt: 12,
	scale: 1.03,
	speed: 120,
	perspective: 1000,
	glare: true,
	glareOpacity: 0.35,
	glareSize: 60
});

let styleInjected = false;

function injectStyle() {
	if (typeof document === 'undefined') return;
	if (styleInjected) return;
	styleInjected = true;
	if (document.getElementById('tilt-effect-style')) return;
	const s = document.createElement('style');
	s.id = 'tilt-effect-style';
	s.textContent = [
		'[data-tilt-ready]{position:relative;overflow:hidden;will-change:transform;}',
		'[data-tilt-ready]>.tilt-glare{position:absolute;inset:0;pointer-events:none;',
		'border-radius:inherit;opacity:0;transition:opacity .3s ease;',
		'mix-blend-mode:overlay;z-index:1;',
		'background:radial-gradient(circle at var(--tilt-gx,50%) var(--tilt-gy,50%),',
		'rgba(255,255,255,var(--tilt-glare-opacity,.35)) 0%,',
		'rgba(255,255,255,0) var(--tilt-glare-size,60%));}',
		'[data-tilt-ready]:hover>.tilt-glare{opacity:1;}'
	].join('');
	document.head.appendChild(s);
}

function setup(el, options) {
	if (!el || el.hasAttribute('data-tilt-ready')) return null;

	const opts = Object.assign({}, DEFAULTS, options);
	injectStyle();
	el.setAttribute('data-tilt-ready', '');

	el.style.transform =
		'perspective(' + opts.perspective + 'px) ' +
		'rotateX(var(--tilt-rx,0deg)) rotateY(var(--tilt-ry,0deg)) ' +
		'scale(var(--tilt-scale,1))';
	el.style.transition = 'transform ' + opts.speed + 'ms ease-out';

	let glareEl = null;
	if (opts.glare) {
		glareEl = el.querySelector(':scope > .tilt-glare');
		if (!glareEl) {
			glareEl = document.createElement('div');
			glareEl.className = 'tilt-glare';
			el.appendChild(glareEl);
		}
		el.style.setProperty('--tilt-glare-opacity', opts.glareOpacity);
		el.style.setProperty('--tilt-glare-size', opts.glareSize + '%');
	}

	let rafId = null,
		lastEvent = null;

	function apply() {
		rafId = null;
		const e = lastEvent;
		if (!e) return;
		const rect = el.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		const x = Math.max(-1, Math.min(1, (e.clientX - cx) / (el.offsetWidth / 2)));
		const y = Math.max(-1, Math.min(1, (e.clientY - cy) / (el.offsetHeight / 2)));

		el.style.setProperty('--tilt-rx', (-y * opts.maxTilt).toFixed(2) + 'deg');
		el.style.setProperty('--tilt-ry', (x * opts.maxTilt).toFixed(2) + 'deg');

		if (glareEl) {
			el.style.setProperty('--tilt-gx', ((e.clientX - rect.left) / rect.width * 100).toFixed(2) + '%');
			el.style.setProperty('--tilt-gy', ((e.clientY - rect.top) / rect.height * 100).toFixed(2) + '%');
		}
	}

	function onMove(e) {
		lastEvent = e;
		if (!rafId) rafId = requestAnimationFrame(apply);
	}

	function onEnter() {
		el.style.setProperty('--tilt-scale', opts.scale);
	}

	function onLeave() {
		if (rafId) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
		el.style.setProperty('--tilt-scale', 1);
		el.style.setProperty('--tilt-rx', '0deg');
		el.style.setProperty('--tilt-ry', '0deg');
		lastEvent = null;
	}

	el.addEventListener('pointerenter', onEnter);
	el.addEventListener('pointermove', onMove);
	el.addEventListener('pointerleave', onLeave);

	return {
		el,
		destroy() {
			el.removeEventListener('pointerenter', onEnter);
			el.removeEventListener('pointermove', onMove);
			el.removeEventListener('pointerleave', onLeave);
			el.removeAttribute('data-tilt-ready');
			el.style.transform = '';
			el.style.transition = '';
			if (glareEl && glareEl.parentNode) glareEl.parentNode.removeChild(glareEl);
		}
	};
}

/**
 * 唯一入口：传 class / id / 选择器 / DOM 元素
 * @returns 单元素返回实例对象；多元素返回实例数组；找不到返回 null
 */
export default function init(selector, options) {
	if (typeof selector === 'string') {
		const nodes = document.querySelectorAll(selector);
		if (!nodes.length) {
			console.warn('[TiltEffect] 没有找到元素:', selector);
			return null;
		}
		if (nodes.length === 1) return setup(nodes[0], options);
		const list = [];
		for (let i = 0; i < nodes.length; i++) list.push(setup(nodes[i], options));
		return list;
	}
	if (selector instanceof Element) return setup(selector, options);
	return null;
}