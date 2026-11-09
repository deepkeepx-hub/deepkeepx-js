import loading from './modules/loading.js';
import download from './modules/download.js';
import request from './modules/request.js';
import toast from './modules/toast.js';
import cookie from './modules/cookie.js';
import copy from './modules/copy.js';
import validate from './modules/validate.js';
import theme from './modules/theme.js';
import tilt from './modules/tilt.js';
import { computeFingerprint } from './modules/fingerprint.js';
import getBrowserInfo from './modules/browser.js';

const dkx = {
    loading,
    download,
    request,
    toast,
    cookie,
	copy,
    validate,
    theme,
	tilt,
    browser: {
		fingerprint: computeFingerprint(),
		info: getBrowserInfo()
	}
};

export default Object.freeze(dkx);