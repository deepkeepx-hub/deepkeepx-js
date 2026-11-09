let _loadingInstance = null;

function close() {
	if (!_loadingInstance) return;
	const {
		element,
		locked
	} = _loadingInstance;
	if (element && element.parentNode) {
		element.parentNode.removeChild(element);
	}
	if (locked) {
		document.body.style.overflow = '';
	}
	_loadingInstance = null;
}

function loading(textOrOptions, options) {
	const isClose = (textOrOptions === true || (textOrOptions === undefined && !options));
	if (isClose) {
		close();
		return;
	}

	if (_loadingInstance) close();

	let text = '';
	let cfg = {
		lock: true,
		background: 'rgba(255, 255, 255, 0.8)'
	};
	if (typeof textOrOptions === 'string') {
		text = textOrOptions;
		cfg = Object.assign(cfg, options || {});
	} else if (textOrOptions && typeof textOrOptions === 'object') {
		text = textOrOptions.text || '';
		cfg = Object.assign(cfg, textOrOptions);
	}

	const mask = document.createElement('div');
	mask.className = 'dkx-loading-mask';
	if (cfg.background) mask.style.backgroundColor = cfg.background;

	const box = document.createElement('div');
	box.className = 'dkx-loading-box';

	const spinner = document.createElement('div');
	spinner.className = 'dkx-loading-spinner';
	box.appendChild(spinner);

	if (text) {
		const txtEl = document.createElement('div');
		txtEl.className = 'dkx-loading-text';
		txtEl.textContent = text;
		box.appendChild(txtEl);
	}

	mask.appendChild(box);
	document.body.appendChild(mask);

	if (cfg.lock) document.body.style.overflow = 'hidden';

	_loadingInstance = {
		element: mask,
		locked: cfg.lock
	};
}

export default loading;