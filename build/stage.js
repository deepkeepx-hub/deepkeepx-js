/**
 * stage.js
 * 组装 npm 发布暂存目录 dist-publish/，供 `npm publish dist-publish` 使用。
 *
 * 为什么需要暂存目录：
 *   npm 包页面只渲染 tarball 根目录的 README.md，而 GitHub 首页只渲染仓库根目录的 README.md。
 *   两者内容不同（npm 用英文版 + README_zh.md，GitHub 用中文版 + README.en.md），
 *   因此发布时从暂存目录发布，仓库根目录文件保持不动。
 *
 * 暂存目录内容：
 *   package.json    —— 根 package.json 去掉 scripts / devDependencies / files
 *   README.md       —— npm/README.md（英文）
 *   README_zh.md    —— npm/README_zh.md（中文）
 *   LICENSE
 *   dist/           —— 发布产物（index.min.js / index.esm.mjs / index.min.css）
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT_DIR, 'dist-publish');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

function rel(p) {
	return path.relative(ROOT_DIR, p).replace(/\\/g, '/');
}

function fmtSize(file) {
	try {
		return (fs.statSync(file).size / 1024).toFixed(2) + ' KB';
	} catch {
		return '? KB';
	}
}

function main() {
	// 1. 产物检查
	const required = ['index.min.js', 'index.esm.mjs', 'index.min.css'];
	for (const f of required) {
		if (!fs.existsSync(path.join(DIST_DIR, f))) {
			console.error(`❌ 缺少构建产物 dist/${f}，请先执行: npm run build:lib`);
			process.exit(1);
		}
	}

	// 2. 清理并重建暂存目录
	fs.rmSync(OUT_DIR, { recursive: true, force: true });
	fs.mkdirSync(path.join(OUT_DIR, 'dist'), { recursive: true });

	// 3. package.json（去掉仅开发期需要的字段）
	const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf8'));
	delete pkg.scripts;
	delete pkg.devDependencies;
	delete pkg.files; // 暂存目录内即为全部内容，无需白名单
	fs.writeFileSync(path.join(OUT_DIR, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

	// 4. README（npm 专用）与 LICENSE
	fs.copyFileSync(path.join(ROOT_DIR, 'npm', 'README.md'), path.join(OUT_DIR, 'README.md'));
	fs.copyFileSync(path.join(ROOT_DIR, 'npm', 'README_zh.md'), path.join(OUT_DIR, 'README_zh.md'));
	fs.copyFileSync(path.join(ROOT_DIR, 'LICENSE'), path.join(OUT_DIR, 'LICENSE'));

	// 5. 构建产物
	for (const f of required) {
		fs.copyFileSync(path.join(DIST_DIR, f), path.join(OUT_DIR, 'dist', f));
	}

	// 6. 汇总
	console.log(`\n📦 暂存目录已生成: ${rel(OUT_DIR)}/`);
	const list = [
		'package.json',
		'README.md',
		'README_zh.md',
		'LICENSE',
		...required.map((f) => 'dist/' + f)
	];
	list.forEach((f) => {
		console.log(`   - ${f}  (${fmtSize(path.join(OUT_DIR, f))})`);
	});
	console.log(`\n👉 下一步执行: npm publish dist-publish`);
}

main();
