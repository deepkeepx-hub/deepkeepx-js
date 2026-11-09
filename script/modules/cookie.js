const cookie = {
    set(name, value, options = {}) {
        let str = encodeURIComponent(name) + '=' + encodeURIComponent(value);
        if (options.days) {
            const date = new Date();
            date.setTime(date.getTime() + options.days * 24 * 60 * 60 * 1000);
            str += '; expires=' + date.toUTCString();
        }
        str += '; path=' + (options.path || '/');
        if (options.domain) str += '; domain=' + options.domain;
        if (options.secure) str += '; secure';
        if (options.sameSite) str += '; SameSite=' + options.sameSite;
        document.cookie = str;
    },
    get(name) {
        const key = encodeURIComponent(name) + '=';
        const list = document.cookie.split(';');
        for (let i = 0; i < list.length; i++) {
            const item = list[i].trim();
            if (item.indexOf(key) === 0) {
                return decodeURIComponent(item.substring(key.length));
            }
        }
        return null;
    },
    remove(name, options = {}) {
        cookie.set(name, '', { ...options, days: -1 });
    },
    getAll() {
        const result = {};
        if (!document.cookie) return result;
        document.cookie.split(';').forEach(item => {
            const parts = item.trim().split('=');
            const k = parts.shift();
            if (!k) return;
            result[decodeURIComponent(k)] = decodeURIComponent(parts.join('='));
        });
        return result;
    }
};

export default cookie;