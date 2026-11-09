const TOAST_ICONS = {
    success: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 5-5"/></svg>',
    error:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5"/><path d="M12 16.5h.01"/></svg>',
    warning: '<svg viewBox="0 0 24 24"><path d="M10.3 3.5 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.5a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    info:    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
};

const toast = {
    base(message, options) {
        function getToastContainer() {
            let el = document.getElementById('dkx-toast-container');
            if (!el) {
                el = document.createElement('div');
                el.id = 'dkx-toast-container';
                el.className = 'dkx-toast-container';
                document.body.appendChild(el);
            }
            return el;
        }

        const opts = Object.assign({
            type: 'info',
            duration: 2500,
            onClose: null
        }, options);

        const container = getToastContainer();
        while (container.children.length >= 10) {
            container.removeChild(container.firstElementChild);
        }

        const el = document.createElement('div');
        el.className = 'dkx-toast ' + opts.type;

        const iconEl = document.createElement('span');
        iconEl.className = 'dkx-toast-icon';
        iconEl.innerHTML = TOAST_ICONS[opts.type] || TOAST_ICONS.info;

        const msgEl = document.createElement('span');
        msgEl.className = 'dkx-toast-message';
        msgEl.textContent = message;

        el.appendChild(iconEl);
        el.appendChild(msgEl);
        container.appendChild(el);

        let closed = false;
        let timer = null;

        function close() {
            if (closed) return;
            closed = true;
            if (timer) clearTimeout(timer);
            el.classList.add('hide');
            const onAnimationEnd = function (ev) {
                if (ev.animationName !== 'toastOut') return;
                el.removeEventListener('animationend', onAnimationEnd);
                el.remove();
                if (!container.children.length) container.remove();
                if (typeof opts.onClose === 'function') opts.onClose();
            };
            el.addEventListener('animationend', onAnimationEnd);
        }

        el.addEventListener('click', close);
        if (opts.duration > 0) {
            timer = setTimeout(close, opts.duration);
        }
        return { close, el };
    },
    info(message, options)    { toast.base(message, Object.assign(options || {}, { type: 'info' })); },
    success(message, options) { toast.base(message, Object.assign(options || {}, { type: 'success' })); },
    error(message, options)   { toast.base(message, Object.assign(options || {}, { type: 'error' })); },
    warning(message, options) { toast.base(message, Object.assign(options || {}, { type: 'warning' })); }
};

export default toast;