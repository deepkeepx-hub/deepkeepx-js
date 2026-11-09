import loading from './loading.js';
import toast from './toast.js';

function download(url, fileName, options = {}) {
    loading('下载中');

    fetch(url, {
        method: options.method || 'GET',
        headers: {
            ...(options.headers || {}),
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: options.credentials || 'same-origin',
        body: options.body || undefined,
        ...options
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`下载失败 (${response.status})`);
        }
        return response.blob();
    })
    .then((blob) => {
        if (!blob || blob.size === 0) {
            toast.error('下载内容为空');
            throw new Error('下载内容为空');
        }
        const urlObject = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = urlObject;
        link.download = fileName || 'download';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(urlObject);
        }, 100);
        toast.success('下载成功');
    })
    .catch((err) => {
        toast.error(err.message || '下载失败');
        throw err;
    })
    .finally(() => {
        loading(); // 关闭
    });
}

export default download;