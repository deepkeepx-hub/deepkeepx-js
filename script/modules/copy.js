import toast from './toast.js';

const copy = {
	textarea: function(text){
		let newInput = document.createElement('textarea');
		newInput.style.opacity = 0;
		newInput.value = text;
		newInput.id = 'dkx-new-copy-input';
		document.body.appendChild(newInput);
		newInput.select();
		document.execCommand('Copy');
		let delInput = document.getElementById('dkx-new-copy-input');
		delInput && delInput.parentNode.removeChild(delInput);
		toast.success("复制成功了，快去粘贴使用吧～");
	},
	text: function(text){
		let newInput = document.createElement('textarea');
		newInput.style.opacity = 0;
		newInput.value = text;
		newInput.id = 'dkx-new-copy-input';
		document.body.appendChild(newInput);
		newInput.select();
		document.execCommand('Copy');
		let delInput = document.getElementById('dkx-new-copy-input');
		delInput && delInput.parentNode.removeChild(delInput);
		toast.success("复制成功了，快去粘贴使用吧～");
	}
}

export default copy;