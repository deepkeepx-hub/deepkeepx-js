const theme = {
    _config: {
        darkClass: 'dark',
        icons: {
            dark: `<svg viewBox="0 0 24 24" class="light-icon"><path d="M6.05 4.14l-.39-.39a.993.993 0 0 0-1.4 0l-.01.01a.984.984 0 0 0 0 1.4l.39.39c.39.39 1.01.39 1.4 0l.01-.01a.984.984 0 0 0 0-1.4zM3.01 10.5H1.99c-.55 0-.99.44-.99.99v.01c0 .55.44.99.99.99H3c.56.01 1-.43 1-.98v-.01c0-.56-.44-1-.99-1zm9-9.95H12c-.56 0-1 .44-1 .99v.96c0 .55.44.99.99.99H12c.56.01 1-.43 1-.98v-.97c0-.55-.44-.99-.99-.99zm7.74 3.21c-.39-.39-1.02-.39-1.41-.01l-.39.39a.984.984 0 0 0 0 1.4l.01.01c.39.39 1.02.39 1.4 0l.39-.39a.984.984 0 0 0 0-1.4zm-1.81 15.1l.39.39a.996.996 0 1 0 1.41-1.41l-.39-.39a.993.993 0 0 0-1.4 0c-.4.4-.4 1.02-.01 1.41zM20 11.49v.01c0 .55.44.99.99.99H22c.55 0 .99-.44.99-.99v-.01c0-.55-.44-.99-.99-.99h-1.01c-.55 0-.99.44-.99.99zM12 5.5c-3.31 0-6 2.69-6 6s2.69 6 6 6s6-2.69 6-6s-2.69-6-6-6zm-.01 16.95H12c.55 0 .99-.44.99-.99v-.96c0-.55-.44-.99-.99-.99h-.01c-.55 0-.99.44-.99.99v.96c0 .55.44.99.99.99zm-7.74-3.21c.39.39 1.02.39 1.41 0l.39-.39a.993.993 0 0 0 0-1.4l-.01-.01a.996.996 0 0 0-1.41 0l-.39.39c-.38.4-.38 1.02.01 1.41z"></path></svg>`,
            light: `<svg viewBox="0 0 24 24"><path d="M11.01 3.05C6.51 3.54 3 7.36 3 12a9 9 0 0 0 9 9c4.63 0 8.45-3.5 8.95-8c.09-.79-.78-1.42-1.54-.95A5.403 5.403 0 0 1 11.1 7.5c0-1.06.31-2.06.84-2.89c.45-.67-.04-1.63-.93-1.56z"></path></svg>`
        }
    },
    _isAnimating: false,
    init(selector, options) {
        const self = this;
        this._config = Object.assign({}, this._config, options);
        const btn = document.querySelector(selector);
        if (!btn) {
            console.warn(`[dkx.theme] 未找到元素: ${selector}`);
            return;
        }
        const isDark = document.documentElement.classList.contains(this._config.darkClass);
        btn.innerHTML = isDark ? this._config.icons.dark : this._config.icons.light;
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.toggle(e, btn);
        });
    },
    toggle(e, targetEl) {
        const self = this;
        if (this._isAnimating) return;
        this._isAnimating = true;
        const x = e && typeof e.clientX === 'number' ? e.clientX : window.innerWidth / 2;
        const y = e && typeof e.clientY === 'number' ? e.clientY : window.innerHeight / 2;
        document.documentElement.style.setProperty('--x', `${x}px`);
        document.documentElement.style.setProperty('--y', `${y}px`);
        const isDark = document.documentElement.classList.contains(this._config.darkClass);
        const nextIcon = isDark ? this._config.icons.light : this._config.icons.dark;
        const directionClass = isDark ? 'to-light' : 'to-dark';
        const btn = targetEl || document.querySelector('.dkx-theme-switch');
        document.documentElement.classList.add(directionClass);
        if (!document.startViewTransition) {
            document.documentElement.classList.toggle(this._config.darkClass);
            if (btn) btn.innerHTML = nextIcon;
            document.documentElement.classList.remove(directionClass);
            this._isAnimating = false;
            return;
        }
        const transition = document.startViewTransition(() => {
            document.documentElement.classList.toggle(this._config.darkClass);
            if (btn) btn.innerHTML = nextIcon;
        });
        transition.finished.finally(() => {
            document.documentElement.classList.remove(directionClass);
            self._isAnimating = false;
        });
    }
};

export default theme;