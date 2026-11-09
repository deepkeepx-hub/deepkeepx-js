import toast from './toast.js';

const request = {
    get(url, options)    { return request.base('get', url, options); },
    post(url, options)   { return request.base('post', url, options); },
    delete(url, options) { return request.base('delete', url, options); },
    put(url, options)    { return request.base('put', url, options); },

    base(method, url, options) {
        const {
            data = {},
            headers = {},
            timeout = 120000,
            responseType = 'json',
            onUploadProgress = null
        } = options || {};

        let xhr;
        const promise = new Promise((resolve, reject) => {
            const upperMethod = method.toUpperCase();
            xhr = new XMLHttpRequest();
            xhr.open(upperMethod, url, true);
            xhr.withCredentials = true;
            xhr.timeout = timeout;
            xhr.responseType = (responseType === 'json') ? 'json' : 'text';

            Object.entries({
                ...headers,
                'X-Requested-With': 'XMLHttpRequest'
            }).forEach(([k, v]) => xhr.setRequestHeader(k, v));

            if (onUploadProgress && typeof onUploadProgress === 'function') {
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        onUploadProgress({
                            loaded: e.loaded,
                            total: e.total,
                            percent: Math.round((e.loaded / e.total) * 100)
                        });
                    }
                };
                xhr.upload.onload = () => {
                    onUploadProgress({ loaded: 0, total: 0, percent: 100 });
                };
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    let res = xhr.response;
                    if (responseType === 'json' && res === null && xhr.responseText) {
                        try {
                            res = JSON.parse(xhr.responseText);
                        } catch (e) {
                            toast.error('响应数据 JSON 解析失败');
                            return reject('JSON 解析失败');
                        }
                    }
                    if (res && res.code === 0) {
                        resolve(res.data);
                    } else {
                        const errMsg = (res && res.msg) ? res.msg : '业务请求失败';
                        toast.error(errMsg);
                        reject(errMsg);
                    }
                } else {
                    const errMsg = `HTTP ${xhr.status} ${xhr.statusText}`;
                    toast.error(errMsg);
                    reject(new Error(errMsg));
                }
            };
            xhr.onerror = () => {
                toast.error('网络错误');
                reject('网络错误');
            };
            xhr.ontimeout = () => {
                toast.warning(`请求超时 (>${timeout}ms)`);
                reject('请求超时');
            };
            xhr.onabort = () => {
                toast.warning('请求已取消');
                reject('请求已取消');
            };

            let body = null;
            if (['POST', 'PUT', 'DELETE'].includes(upperMethod)) {
                if (data instanceof FormData) {
                    body = data;
                } else if (data != null) {
                    if (typeof data === 'string') {
                        body = data;
                    } else {
                        body = JSON.stringify(data);
                        const hasContentType = Object.keys({
                            ...headers,
                            'X-Requested-With': 'XMLHttpRequest'
                        }).some(k => k.toLowerCase() === 'content-type');
                        if (!hasContentType) {
                            xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
                        }
                    }
                }
            }
            xhr.send(body);
        });

        promise.abort = () => { if (xhr) xhr.abort(); };
        return promise;
    }
};

export default request;