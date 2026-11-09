let _cachedFingerprint = null;

export function computeFingerprint() {
	function safeCall(fn, fallback) {
		try {
			const v = fn();
			return (v === undefined || v === null) ? (fallback === undefined ? '' : fallback) : v;
		} catch (e) {
			return fallback === undefined ? '' : fallback;
		}
	}
	function hashString(str) {
		let h1 = 0x811c9dc5 >>> 0;
		let h2 = 0x811c9dc5 >>> 0;
		let h3 = 0x811c9dc5 >>> 0;
		let h4 = 0x811c9dc5 >>> 0;
		let h5 = 0x9e3779b9 >>> 0;
		let h6 = 0x9e3779b9 >>> 0;
		let h7 = 0x9e3779b9 >>> 0;
		let h8 = 0x9e3779b9 >>> 0;
		for (let i = 0; i < str.length; i++) {
			const c = str.charCodeAt(i);
			h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
			h2 = Math.imul(h2 ^ c, 0x85ebca6b) >>> 0;
			h3 = Math.imul(h3 ^ c, 0xc2b2ae35) >>> 0;
			h4 = Math.imul(h4 ^ c, 0x27d4eb2f) >>> 0;
			h5 = Math.imul(h5 + c, 0x9e3779b9) >>> 0;
			h6 = Math.imul(h6 + (c ^ 0xff), 0x85ebca6b) >>> 0;
			h7 = Math.imul(h7 + (c << 1), 0xc2b2ae35) >>> 0;
			h8 = Math.imul(h8 ^ (c + i), 0x27d4eb2f) >>> 0;
		}
		const r1 = (h1 ^ h5) >>> 0;
		const r2 = (h2 ^ h6) >>> 0;
		const r3 = (h3 ^ h7) >>> 0;
		const r4 = (h4 ^ h8) >>> 0;
		return r1.toString(16).padStart(8, '0') +
			r2.toString(16).padStart(8, '0') +
			r3.toString(16).padStart(8, '0') +
			r4.toString(16).padStart(8, '0');
	}
	function collectBasic() {
		const win = (typeof window !== 'undefined') ? window : {};
		const nav = win.navigator || {};
		const scr = win.screen || {};
		const tz = safeCall(() => Intl.DateTimeFormat().resolvedOptions().timeZone, '');
		const tzOffset = safeCall(() => new Date().getTimezoneOffset(), '');
		return [
			nav.userAgent || '',
			nav.language || '',
			(nav.languages || []).join(','),
			nav.platform || '',
			nav.hardwareConcurrency || '',
			nav.deviceMemory || '',
			nav.maxTouchPoints || '',
			scr.width || '',
			scr.height || '',
			scr.colorDepth || '',
			scr.pixelDepth || '',
			win.devicePixelRatio || '',
			tz,
			tzOffset,
		].join('|');
	}
	function collectCanvas() {
		return safeCall(() => {
			const canvas = document.createElement('canvas');
			canvas.width = 240;
			canvas.height = 60;
			const ctx = canvas.getContext('2d');
			if (!ctx) return '';
			ctx.textBaseline = 'top';
			ctx.font = '14px "Arial"';
			ctx.fillStyle = '#f60';
			ctx.fillRect(100, 1, 62, 20);
			ctx.fillStyle = '#069';
			ctx.fillText('Fingerprint🔒测试', 2, 15);
			ctx.fillStyle = 'rgba(102,204,0,0.7)';
			ctx.fillText('Fingerprint🔒测试', 4, 17);
			ctx.beginPath();
			ctx.arc(50, 50, 30, 0, Math.PI * 2, true);
			ctx.stroke();
			const data = canvas.toDataURL();
			return data.startsWith('data:image/png;base64,') ? data.substring(22) : data;
		}, '');
	}
	function collectWebGL() {
		return safeCall(() => {
			const canvas = document.createElement('canvas');
			const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
			if (!gl) return '';
			const parts = [];
			const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
			if (debugInfo) {
				parts.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '');
				parts.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '');
			}
			parts.push(gl.getParameter(gl.VERSION) || '');
			parts.push(gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || '');
			parts.push(gl.getParameter(gl.VENDOR) || '');
			parts.push(gl.getParameter(gl.RENDERER) || '');
			parts.push(gl.getParameter(gl.MAX_TEXTURE_SIZE) || '');
			const dims = gl.getParameter(gl.MAX_VIEWPORT_DIMS);
			parts.push(dims ? Array.from(dims).join('x') : '');
			parts.push((gl.getSupportedExtensions() || []).join(','));
			return parts.join('|');
		}, '');
	}
	function collectFonts() {
		return safeCall(() => {
			const parent = document.body || document.documentElement;
			if (!parent) return '';
			const baseFonts = ['monospace', 'sans-serif', 'serif'];
			const testFonts = [
				'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
				'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
				'Trebuchet MS', 'Arial Black', 'Impact', 'Lucida Console',
				'Tahoma', 'Microsoft YaHei', 'SimSun', 'SimHei', 'KaiTi',
				'PingFang SC', 'Hiragino Sans GB', 'STHeiti', 'WenQuanYi Micro Hei',
			];
			const span = document.createElement('span');
			span.style.position = 'absolute';
			span.style.left = '-9999px';
			span.style.fontSize = '72px';
			span.style.visibility = 'hidden';
			span.style.whiteSpace = 'nowrap';
			span.textContent = 'mmmmmmmmmmlliWWW';
			parent.appendChild(span);
			const baseSizes = {};
			baseFonts.forEach(f => {
				span.style.fontFamily = f;
				baseSizes[f] = span.offsetWidth + 'x' + span.offsetHeight;
			});
			const detected = [];
			testFonts.forEach(font => {
				for (let i = 0; i < baseFonts.length; i++) {
					const base = baseFonts[i];
					span.style.fontFamily = '"' + font + '",' + base;
					if (span.offsetWidth + 'x' + span.offsetHeight !== baseSizes[base]) {
						detected.push(font);
						break;
					}
				}
			});
			parent.removeChild(span);
			return detected.join(',');
		}, '');
	}
	function collectPlugins() {
		return safeCall(() => {
			const nav = window.navigator || {};
			const plugins = [];
			if (nav.plugins) {
				for (let i = 0; i < nav.plugins.length; i++) {
					plugins.push(nav.plugins[i].name + ':' + nav.plugins[i].filename);
				}
			}
			return plugins.join(',');
		}, '');
	}
	function collectStorage() {
		return safeCall(() => {
			const results = [];
			try {
				localStorage.setItem('__fp_test__', '1');
				localStorage.removeItem('__fp_test__');
				results.push('ls:1');
			} catch (e) {
				results.push('ls:0');
			}
			try {
				sessionStorage.setItem('__fp_test__', '1');
				sessionStorage.removeItem('__fp_test__');
				results.push('ss:1');
			} catch (e) {
				results.push('ss:0');
			}
			try {
				results.push('cookie:' + (navigator.cookieEnabled ? 1 : 0));
			} catch (e) {
				results.push('cookie:0');
			}
			results.push('idb:' + ('indexedDB' in window ? 1 : 0));
			return results.join('|');
		}, '');
	}
	const raw = [
		collectBasic(),
		collectCanvas(),
		collectWebGL(),
		collectStorage(),
		collectFonts(),
		collectPlugins(),
	].join('||');
	return hashString(raw);
}

export function getFingerprint() {
	if (_cachedFingerprint === null) {
		_cachedFingerprint = computeFingerprint();
	}
	return _cachedFingerprint;
}