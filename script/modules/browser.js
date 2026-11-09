function getBrowserInfo() {
    const nav = (typeof navigator !== 'undefined') ? navigator : {};
    const win = (typeof window !== 'undefined') ? window : {};
    const ua = nav.userAgent || '';

    function safeGet(fn, fallback) {
        try {
            const v = fn();
            return (v === undefined || v === null) ? (fallback === undefined ? '' : fallback) : v;
        } catch (e) {
            return fallback === undefined ? '' : fallback;
        }
    }
    function has(re) { return re.test(ua); }
    function matchVersion(re) {
        const m = ua.match(re);
        return m && m[1] ? m[1] : '';
    }
    function majorOf(v) { return v ? String(v).split('.')[0] : ''; }

    function inferVendorFromModel(model) {
        if (!model) return '';
        const m = model.toUpperCase();
        if (/^SM-|^GT-|^SGH-|^SCH-/.test(m)) return 'Samsung';
        if (/^PIXEL|^NEXUS/.test(m)) return 'Google';
        if (/^(MI|REDMI|POCO|MIX|M20|M2)/.test(m)) return 'Xiaomi';
        if (/^HONOR|^NOH-|^ELS-|^ANY-/.test(m)) return 'Honor';
        if (/^HUAWEI/.test(m)) return 'Huawei';
        if (/^CPH|^P[A-Z]{2}\d{2}/.test(m)) return 'OPPO';
        if (/^V\d{4}|^VIVO/.test(m)) return 'vivo';
        if (/^ONEPLUS|^IN\d{4}|^KB\d{4}|^LE\d{4}/.test(m)) return 'OnePlus';
        if (/^RMX/.test(m)) return 'realme';
        if (/^MOT|^XT\d/.test(m)) return 'Motorola';
        if (/^LGE|^LM-/.test(m)) return 'LG';
        if (/^SONY|^XPERIA/.test(m)) return 'Sony';
        if (/^NOKIA/.test(m)) return 'Nokia';
        return '';
    }
    function extractAndroidModel() {
        const m = ua.match(/\(([^)]*)\)/);
        if (!m) return '';
        const segs = m[1].split(';');
        const candidates = [];
        for (let i = 0; i < segs.length; i++) {
            const s = segs[i].trim();
            if (!s) continue;
            if (/^(Linux|Android\b|U$|wv$|Mobile$|Tablet$)/i.test(s)) continue;
            if (/^[a-z]{2}(-[A-Z]{2})?$/.test(s)) continue;
            candidates.push(s);
        }
        let model = '';
        for (let j = 0; j < candidates.length; j++) {
            if (candidates[j].length > model.length) model = candidates[j];
        }
        if (/Build\//.test(model)) {
            model = model.split(/\s+Build\//)[0].trim();
        }
        return model;
    }

    let browserName = 'Unknown';
    let browserVersion = '';
    let isInApp = false;
    let isWebView = false;

    if (has(/wxwork\//i)) {
        browserName = 'WeCom';
        browserVersion = matchVersion(/wxwork\/([\d.]+)/i);
        isInApp = isWebView = true;
    } else if (has(/MicroMessenger/i)) {
        browserName = 'WeChat';
        browserVersion = matchVersion(/MicroMessenger\/([\d.]+)/i);
        isInApp = isWebView = true;
    } else if (has(/DingTalk/i)) {
        browserName = 'DingTalk';
        browserVersion = matchVersion(/DingTalk\/([\d.]+)/i);
        isInApp = isWebView = true;
    } else if (has(/AlipayClient/i)) {
        browserName = 'Alipay';
        browserVersion = matchVersion(/AlipayClient\/([\d.]+)/i);
        isInApp = isWebView = true;
    } else if (has(/aweme_/i)) {
        browserName = 'Douyin';
        browserVersion = matchVersion(/aweme_([\d.]+)/i);
        isInApp = isWebView = true;
    } else if (has(/BytedanceWebview/i)) {
        browserName = 'ByteDance';
        isInApp = isWebView = true;
    } else if (has(/Weibo/i)) {
        browserName = 'Weibo';
        browserVersion = matchVersion(/Weibo\/([\d.]+)/i);
        isInApp = isWebView = true;
    } else if (has(/Kwai/i)) {
        browserName = 'Kuaishou';
        browserVersion = matchVersion(/Kwai\/([\d.]+)/i);
        isInApp = isWebView = true;
    } else if (has(/\bQQ\//) && !has(/MQQBrowser/i)) {
        browserName = 'QQ';
        browserVersion = matchVersion(/\bQQ\/([\d.]+)/);
        isInApp = isWebView = true;
    }
    else if (has(/EdgiOS\//)) {
        browserName = 'Edge'; browserVersion = matchVersion(/EdgiOS\/([\d.]+)/);
    } else if (has(/EdgA?\//)) {
        browserName = 'Edge'; browserVersion = matchVersion(/EdgA?\/([\d.]+)/);
    } else if (has(/Edge\//)) {
        browserName = 'Edge'; browserVersion = matchVersion(/Edge\/([\d.]+)/);
    } else if (has(/OPiOS\//)) {
        browserName = 'Opera'; browserVersion = matchVersion(/OPiOS\/([\d.]+)/);
    } else if (has(/OPR\//)) {
        browserName = 'Opera'; browserVersion = matchVersion(/OPR\/([\d.]+)/);
    } else if (has(/Opera Mini\//)) {
        browserName = 'Opera Mini'; browserVersion = matchVersion(/Opera Mini\/([\d.]+)/);
    } else if (has(/Opera Mobi\//)) {
        browserName = 'Opera Mobile'; browserVersion = matchVersion(/Opera Mobi\/([\d.]+)/);
    } else if (has(/Vivaldi\//)) {
        browserName = 'Vivaldi'; browserVersion = matchVersion(/Vivaldi\/([\d.]+)/);
    } else if (has(/YaBrowser\//)) {
        browserName = 'Yandex'; browserVersion = matchVersion(/YaBrowser\/([\d.]+)/);
    } else if (has(/UCBrowser\//)) {
        browserName = 'UC Browser'; browserVersion = matchVersion(/UCBrowser\/([\d.]+)/);
    } else if (has(/Quark\//)) {
        browserName = 'Quark'; browserVersion = matchVersion(/Quark\/([\d.]+)/);
    } else if (has(/baidubrowser\//i)) {
        browserName = 'Baidu'; browserVersion = matchVersion(/baidubrowser\/([\d.]+)/i);
    } else if (has(/MiuiBrowser\//i)) {
        browserName = 'MIUI Browser'; browserVersion = matchVersion(/MiuiBrowser\/([\d.]+)/i);
    } else if (has(/HuaweiBrowser\//i)) {
        browserName = 'Huawei Browser'; browserVersion = matchVersion(/HuaweiBrowser\/([\d.]+)/i);
    } else if (has(/VivoBrowser\//i)) {
        browserName = 'Vivo Browser'; browserVersion = matchVersion(/VivoBrowser\/([\d.]+)/i);
    } else if (has(/OppoBrowser\//i)) {
        browserName = 'OPPO Browser'; browserVersion = matchVersion(/OppoBrowser\/([\d.]+)/i);
    } else if (has(/SamsungBrowser\//)) {
        browserName = 'Samsung Internet'; browserVersion = matchVersion(/SamsungBrowser\/([\d.]+)/);
    } else if (has(/MQQBrowser\//)) {
        browserName = 'QQ Browser'; browserVersion = matchVersion(/MQQBrowser\/([\d.]+)/);
    } else if (has(/(MetaSr|SogouMobileBrowser)/i)) {
        browserName = 'Sogou'; browserVersion = matchVersion(/(?:MetaSr|SogouMobileBrowser)[ \/]([\d.]+)/i);
    } else if (has(/(QIHU 360SE|QIHU 360EE|QihooBrowser)/i)) {
        browserName = '360 Browser'; browserVersion = matchVersion(/(?:QIHU 360SE|QIHU 360EE|QihooBrowser)[ \/]([\d.]+)/i);
    } else if (has(/Maxthon/i)) {
        browserName = 'Maxthon'; browserVersion = matchVersion(/Maxthon\/([\d.]+)/i);
    } else if (has(/FxiOS\//)) {
        browserName = 'Firefox'; browserVersion = matchVersion(/FxiOS\/([\d.]+)/);
    } else if (has(/Firefox\//)) {
        browserName = 'Firefox'; browserVersion = matchVersion(/Firefox\/([\d.]+)/);
    } else if (has(/CriOS\//)) {
        browserName = 'Chrome'; browserVersion = matchVersion(/CriOS\/([\d.]+)/);
    } else if (has(/Chrome\//)) {
        browserName = 'Chrome'; browserVersion = matchVersion(/Chrome\/([\d.]+)/);
    } else if (has(/Safari\//) && !has(/Android/)) {
        browserName = 'Safari';
        browserVersion = matchVersion(/Version\/([\d.]+)/) || matchVersion(/Safari\/([\d.]+)/);
    } else if (has(/MSIE /)) {
        browserName = 'IE'; browserVersion = matchVersion(/MSIE ([\d.]+)/);
    } else if (has(/Trident\//)) {
        browserName = 'IE'; browserVersion = matchVersion(/rv:([\d.]+)/) || '11';
    }

    let engineName = 'Unknown';
    let engineVersion = '';
    if (has(/Trident\//)) {
        engineName = 'Trident'; engineVersion = matchVersion(/Trident\/([\d.]+)/);
    } else if (has(/Gecko\//) && has(/Firefox\//)) {
        engineName = 'Gecko'; engineVersion = matchVersion(/rv:([\d.]+)/);
    } else if (has(/AppleWebKit\//)) {
        engineVersion = matchVersion(/AppleWebKit\/([\d.]+)/);
        engineName = (has(/Chrome\//) || has(/CriOS\//)) ? 'Blink' : 'WebKit';
    }

    if (!isWebView) {
        if (has(/; wv\)/) || (has(/Version\/4\.0/) && has(/Chrome\//))) {
            isWebView = true;
        } else if (has(/iPhone|iPad|iPod/) && has(/AppleWebKit\//) && has(/Mobile\//) &&
            !has(/Safari\//) && !has(/CriOS\//) && !has(/FxiOS\//) &&
            !has(/EdgiOS\//) && !has(/OPiOS\//)) {
            isWebView = true;
        }
    }

    let osName = 'Unknown';
    let osVersion = '';
    if (has(/Windows NT 10\.0/)) { osName = 'Windows'; osVersion = '10/11'; }
    else if (has(/Windows NT 6\.3/)) { osName = 'Windows'; osVersion = '8.1'; }
    else if (has(/Windows NT 6\.2/)) { osName = 'Windows'; osVersion = '8'; }
    else if (has(/Windows NT 6\.1/)) { osName = 'Windows'; osVersion = '7'; }
    else if (has(/Windows NT 6\.0/)) { osName = 'Windows'; osVersion = 'Vista'; }
    else if (has(/Windows NT 5\.1/)) { osName = 'Windows'; osVersion = 'XP'; }
    else if (has(/Windows Phone/)) { osName = 'Windows Phone'; osVersion = matchVersion(/Windows Phone(?: OS)? ([\d.]+)/); }
    else if (has(/HarmonyOS/i)) { osName = 'HarmonyOS'; osVersion = matchVersion(/HarmonyOS[ \/]([\d.]+)/i); }
    else if (has(/iPhone|iPad|iPod/)) {
        osName = has(/iPad/) ? 'iPadOS' : 'iOS';
        osVersion = matchVersion(/(?:iPhone )?OS ([\d_]+)/).replace(/_/g, '.');
    }
    else if (has(/Android/)) { osName = 'Android'; osVersion = matchVersion(/Android[ \/]([\d.]+)/); }
    else if (has(/CrOS/)) { osName = 'ChromeOS'; osVersion = matchVersion(/CrOS \w+ ([\d.]+)/); }
    else if (has(/Mac OS X/)) { osName = 'macOS'; osVersion = matchVersion(/Mac OS X ([\d_]+)/).replace(/_/g, '.'); }
    else if (has(/Linux/)) { osName = 'Linux'; }

    let deviceType = 'desktop';
    let deviceModel = '';
    let deviceVendor = '';
    if (has(/bot|crawler|spider|slurp|bingpreview|facebookexternalhit/i)) {
        deviceType = 'bot';
    } else if (has(/SmartTV|SMART-TV|AppleTV|GoogleTV|HbbTV|NetCast|Web0S|Tizen TV/i)) {
        deviceType = 'tv';
    } else if (has(/iPad/) || (has(/Android/) && !has(/Mobile/)) || has(/Tablet/)) {
        deviceType = 'tablet';
    } else if (has(/Mobi|iPhone|iPod|Android.*Mobile|Windows Phone|BlackBerry|Opera Mini|IEMobile/)) {
        deviceType = 'mobile';
    }

    if (has(/iPhone/)) { deviceModel = 'iPhone'; deviceVendor = 'Apple'; }
    else if (has(/iPad/)) { deviceModel = 'iPad'; deviceVendor = 'Apple'; }
    else if (has(/iPod/)) { deviceModel = 'iPod'; deviceVendor = 'Apple'; }
    else if (has(/Macintosh|Mac OS X/)) { deviceVendor = 'Apple'; }
    else if (has(/Android/)) {
        deviceModel = extractAndroidModel();
        deviceVendor = inferVendorFromModel(deviceModel);
    }

    let arch = '';
    if (/WOW64|Win64; x64|x86_64|amd64/i.test(ua)) arch = 'amd64';
    else if (/Win32|i686|i386/i.test(ua)) arch = 'x86';
    else if (/arm64|aarch64/i.test(ua)) arch = 'arm64';
    else if (/armv7|armv8l/i.test(ua)) arch = 'arm';
    else if (/Macintosh|Mac OS X/i.test(ua)) arch = 'x86_64_or_arm64';
    else if (/iPhone|iPad|iPod/i.test(ua)) arch = 'arm64';

    const scr = (typeof screen !== 'undefined') ? screen : {};
    const orientation = safeGet(() => {
        if (scr.orientation && scr.orientation.type) return scr.orientation.type;
        return (window.innerWidth > window.innerHeight) ? 'landscape' : 'portrait';
    }, 'unknown');

    const languages = nav.languages || (nav.language ? [nav.language] : []);
    const timezone = safeGet(() => Intl.DateTimeFormat().resolvedOptions().timeZone, '');
    const timezoneOffset = safeGet(() => new Date().getTimezoneOffset(), 0);

    const hardwareConcurrency = safeGet(() => nav.hardwareConcurrency, 0);
    const deviceMemory = safeGet(() => nav.deviceMemory, 0);
    const maxTouchPoints = safeGet(() => nav.maxTouchPoints, 0);
    const isTouch = (maxTouchPoints > 0) || ('ontouchstart' in win);
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    const networkType = conn ? safeGet(() => conn.effectiveType || conn.type, '') : '';
    const downlink = conn ? safeGet(() => conn.downlink, null) : null;
    const rtt = conn ? safeGet(() => conn.rtt, null) : null;

    function canCreateCanvasContext(type) {
        try {
            const c = document.createElement('canvas');
            return !!(c.getContext && c.getContext(type));
        } catch (e) { return false; }
    }
    const features = {
        canvas: canCreateCanvasContext('2d'),
        webgl: canCreateCanvasContext('webgl') || canCreateCanvasContext('experimental-webgl'),
        webgl2: canCreateCanvasContext('webgl2'),
        localStorage: (function () { try { return !!win.localStorage; } catch (e) { return false; } })(),
        sessionStorage: (function () { try { return !!win.sessionStorage; } catch (e) { return false; } })(),
        indexedDB: 'indexedDB' in win,
        serviceWorker: 'serviceWorker' in nav,
        notification: 'Notification' in win,
        geolocation: 'geolocation' in nav,
        bluetooth: 'bluetooth' in nav,
        usb: 'usb' in nav,
        gamepad: 'getGamepads' in nav,
        webAssembly: 'WebAssembly' in win,
        sharedArrayBuffer: 'SharedArrayBuffer' in win,
        cookieEnabled: nav.cookieEnabled === true
    };

    return {
        userAgent: ua,
        browser: {
            name: browserName,
            version: browserVersion || '',
            majorVersion: majorOf(browserVersion),
            isInApp: isInApp,
            isWebView: isWebView
        },
        engine: { name: engineName, version: engineVersion },
        os: {
            name: osName,
            version: osVersion,
            isMobile: /iOS|iPadOS|Android|Windows Phone|HarmonyOS/.test(osName)
        },
        device: {
            type: deviceType,
            model: deviceModel,
            vendor: deviceVendor,
            isMobile: deviceType === 'mobile',
            isTablet: deviceType === 'tablet',
            isDesktop: deviceType === 'desktop'
        },
        cpu: { architecture: arch },
        screen: {
            width: safeGet(() => scr.width, 0),
            height: safeGet(() => scr.height, 0),
            availWidth: safeGet(() => scr.availWidth, 0),
            availHeight: safeGet(() => scr.availHeight, 0),
            colorDepth: safeGet(() => scr.colorDepth, 0),
            pixelDepth: safeGet(() => scr.pixelDepth, 0),
            devicePixelRatio: safeGet(() => window.devicePixelRatio, 1),
            orientation: orientation
        },
        locale: {
            language: nav.language || '',
            languages: languages.slice(),
            timezone: timezone,
            timezoneOffset: timezoneOffset
        },
        hardware: {
            hardwareConcurrency: hardwareConcurrency,
            deviceMemory: deviceMemory,
            maxTouchPoints: maxTouchPoints,
            isTouch: isTouch
        },
        network: {
            type: networkType,
            downlink: downlink,
            rtt: rtt,
            online: nav.onLine === true
        },
        features: features
    };
}

export default getBrowserInfo;