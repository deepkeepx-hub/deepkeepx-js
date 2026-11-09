require('dotenv').config();
const Client = require('ssh2-sftp-client');
const path = require('path');
const fs = require('fs');

const ROOT_DIR = path.resolve(__dirname, '..');

const version = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8')).version || '1.0.0';

const config = {
	host: process.env.SERVER_HOST,
	port: process.env.SERVER_PORT,
	username: process.env.SERVER_USER,
	password: process.env.SERVER_PASSWORD,
	remoteDir: process.env.REMOTE_DIR + version,
	localDir: path.resolve(ROOT_DIR, 'dist')
};

const sftp = new Client();

// 生成一个带时间戳的临时目录名，确保唯一性
const tempDirName = `${path.basename(config.remoteDir)}_temp_${Date.now()}`;
const parentDir = path.posix.dirname(config.remoteDir);
const tempRemotePath = path.posix.join(parentDir, tempDirName);

async function ensureRemoteDir(sftp, dir) {
	const normalized = path.posix.normalize(dir);
	const segments = normalized.split('/').filter(Boolean);
	let current = normalized.startsWith('/') ? '' : '.';
	for (const seg of segments) {
		current = path.posix.join(current, seg);
		try {
			const exists = await sftp.exists(current);
			if (!exists) {
				await sftp.mkdir(current);
				console.log(`📁 已创建目录: ${current}`);
			}
		} catch (err) {
			// 并发/已存在时忽略；其它错误继续抛出
			if (!(await sftp.exists(current))) throw err;
		}
	}
}

async function deploy() {
	if (!fs.existsSync(config.localDir)) {
		console.error('❌ 错误: 找不到目录，请先执行 npm run build');
		process.exit(1);
	}

	try {
		console.log('🔄 正在连接服务器...');
		await sftp.connect(config);
		console.log('✅ 服务器连接成功！');

		// 1. 确保远程目录存在
		console.log(`📁 检查远程目录: ${config.remoteDir}`);
		await ensureRemoteDir(sftp, config.remoteDir);

		// 2. 【核心】直接上传并覆盖
		// uploadDir 会自动处理子文件夹，如果远程有同名文件则覆盖
		console.log(`🚀 开始同步文件到 ${config.remoteDir} ...`);
		console.log('⏳ 正在上传，请稍候...');

		await sftp.uploadDir(config.localDir, config.remoteDir);

		console.log('🎉 部署成功！文件已同步。');
		
		try {
			fs.rmSync(path.resolve(ROOT_DIR, 'dist'), { recursive: true, force: true });
			console.log('🧹 已清理本地 dist');
		} catch (e) {
			console.warn('⚠️ 清理本地 dist 失败（不影响部署）:', e.message);
		}

	} catch (err) {
		console.error('❌ 部署失败:', err.message);
		process.exit(1);
	} finally {
		console.log('🔌 正在关闭连接...');
		await sftp.end();
	}
}

deploy();