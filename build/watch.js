/**
 * build.js
 * 合并后的构建 & 监听脚本
 *
 *   ../scss/index.scss   -> ../dist/index.min.css
 *   ../script/index.js   -> ../dist/index.min.js   (UMD：script 标签 / require / AMD)
 *                        -> ../dist/index.esm.mjs  (ESM：import / 打包器)
 *
 * 产物路径不带版本号，便于 npm 发布与 CDN 固定地址引用；
 * 版本号仅用于日志展示与 deploy 的远程目录，从 ../package.json 读取。
 *
 * 流程：esbuild 把 script/modules/* 打包成单文件，
 *       再走 terser 压缩；默认追加 obfuscator 混淆（自有部署用），
 *       加 --no-obfuscate 跳过混淆（npm 发布用，npm 禁止混淆代码）。
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { minify } = require('terser');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { build: esbuild } = require('esbuild');

let chokidar;
try {
    chokidar = require('chokidar');
} catch (e) {
    console.error('❌ 未安装 chokidar，请先运行: npm i chokidar');
    process.exit(1);
}

// ================= 配置区 =================
const ROOT_DIR    = path.resolve(__dirname, '..');
const SCSS_INPUT  = path.join(ROOT_DIR, 'scss', 'index.scss');  // 若源是 .css，改这里
const JS_INPUT    = path.join(ROOT_DIR, 'script', 'index.js');
const JS_DIR      = path.join(ROOT_DIR, 'script');              // 监听整个 script 目录
const TMP_DIR     = path.join(ROOT_DIR, '.tmp');                // bundle 中间产物
const PKG_FILE    = path.join(ROOT_DIR, 'package.json');
const OUTPUT_BASE = path.join(ROOT_DIR, 'dist');
const NO_OBFUSCATE = process.argv.includes('--no-obfuscate');   // npm 发布构建不混淆
// ==========================================

// 混淆配置（保持原样）
const OBFUSCATOR_OPTIONS = {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    selfDefending: false,
    debugProtection: false,
    disableConsoleOutput: false,
    transformObjectKeys: false,
    unicodeEscapeSequence: false
};

// 压缩配置
const MINIFY_OPTIONS = {
    compress: {
        passes: 2,
        drop_console: false,   // 想干掉 console 改 true
        drop_debugger: true,
        typeofs: false         // 关键：保护 UMD 壳里的 typeof module / typeof define 探测
    },
    mangle: {
        toplevel: false        // 关键：保护 UMD 壳里的 module / define / global 标识符
    },
    format: {
        comments: false
    }
};

// ================= 工具函数 =================
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

function getVersion() {
    try {
        const pkg = JSON.parse(fs.readFileSync(PKG_FILE, 'utf8'));
        return pkg.version || '1.0.0';
    } catch (e) {
        console.error('❌ 读取 package.json 失败:', e.message);
        return '0.0.0';
    }
}

function getOutputDir() {
    return OUTPUT_BASE;
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ================= SCSS 构建 =================
function buildSCSS() {
    return new Promise((resolve) => {
        if (!fs.existsSync(SCSS_INPUT)) {
            console.warn(`⚠️  SCSS 源文件不存在: ${rel(SCSS_INPUT)}`);
            return resolve(false);
        }

        const outDir  = getOutputDir();
        ensureDir(outDir);
        const outPath = path.join(outDir, 'index.min.css');

        const cmd = `sass "${SCSS_INPUT}" "${outPath}" --style compressed --sourcemap=none`;
        const child = spawn(cmd, {
            shell: true,
            stdio: ['ignore', 'pipe', 'pipe']
        });

        child.stdout.on('data', d => process.stdout.write(d));
        child.stderr.on('data', d => process.stderr.write(d));

        child.on('error', err => {
            console.error('❌ 启动 sass 失败:', err.message);
            console.error('   检查 `sass --version` 是否可用，或改用 npx sass');
            resolve(false);
        });

        child.on('close', code => {
            if (code === 0) {
                console.log(`  ✓ CSS  ${rel(SCSS_INPUT)} -> ${rel(outPath)}  (${fmtSize(outPath)})`);
                resolve(true);
            } else {
                console.error(`  ✗ sass 退出码 ${code}: ${rel(SCSS_INPUT)}`);
                resolve(false);
            }
        });
    });
}

// ================= JS bundle（标准 UMD 格式） =================
async function bundleJS() {
    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
    const outFile = path.join(TMP_DIR, 'dkx.bundle.tmp.js');

    await esbuild({
        entryPoints: [JS_INPUT],
        bundle: true,
        format: 'iife',
        globalName: '__dkx_exports__',   // 内部接收变量
        platform: 'browser',
        target: ['es2018'],
        legalComments: 'none',
        logLevel: 'info',
        outfile: outFile,
        banner: {
            js: `(function(global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();           // 支持 require()
    } else if (typeof define === 'function' && define.amd) {
        define(factory);                      // 支持 AMD
    } else {
        global = typeof globalThis !== 'undefined' ? globalThis : global || self;
        global.dkx = factory();               // 支持 window.dkx
    }
})(this, function() {`
        },
        footer: {
            js: `
    return (typeof __dkx_exports__ !== 'undefined' && __dkx_exports__ && __dkx_exports__.default) 
        ? __dkx_exports__.default 
        : __dkx_exports__;
});`
        }
    });

    return outFile;
}

// ================= ESM bundle（供 import / 打包器使用） =================
async function bundleESM() {
    if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });
    const outFile = path.join(TMP_DIR, 'dkx.esm.tmp.mjs');

    await esbuild({
        entryPoints: [JS_INPUT],
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: ['es2018'],
        legalComments: 'none',
        logLevel: 'silent',
        outfile: outFile
    });

    return outFile;
}

// ================= JS 构建 =================
async function buildJS() {
    if (!fs.existsSync(JS_INPUT)) {
        console.warn(`⚠️  JS 源文件不存在: ${rel(JS_INPUT)}`);
        return false;
    }

    const outDir  = getOutputDir();
    ensureDir(outDir);
    const outPath    = path.join(outDir, 'index.min.js');
    const esmOutPath = path.join(outDir, 'index.esm.mjs');

    const tmpFiles = [];
    try {
        // 0. esbuild 多文件 -> 单文件（UMD + ESM 两份）
        tmpFiles.push(await bundleJS());
        tmpFiles.push(await bundleESM());

        // 1. UMD：terser 压缩 + （可选）obfuscator 混淆
        const umdCode = fs.readFileSync(tmpFiles[0], 'utf8');
        const umdMinified = await minify(umdCode, MINIFY_OPTIONS);
        if (umdMinified.error) throw umdMinified.error;

        let umdFinal = umdMinified.code;
        if (!NO_OBFUSCATE) {
            umdFinal = JavaScriptObfuscator
                .obfuscate(umdMinified.code, OBFUSCATOR_OPTIONS)
                .getObfuscatedCode();
        }
        fs.writeFileSync(outPath, umdFinal);
        console.log(`  ✓ JS   ${rel(JS_INPUT)} -> ${rel(outPath)}  (${fmtSize(outPath)})${NO_OBFUSCATE ? '  [未混淆]' : ''}`);

        // 2. ESM：仅 terser 压缩（发布产物永远不混淆）
        const esmCode = fs.readFileSync(tmpFiles[1], 'utf8');
        const esmMinified = await minify(esmCode, MINIFY_OPTIONS);
        if (esmMinified.error) throw esmMinified.error;
        fs.writeFileSync(esmOutPath, esmMinified.code);
        console.log(`  ✓ JS   ${rel(JS_INPUT)} -> ${rel(esmOutPath)}  (${fmtSize(esmOutPath)})`);
        return true;
    } catch (err) {
        console.error(`  ✗ JS 处理失败:`, err.message);
        return false;
    } finally {
        tmpFiles.forEach((f) => {
            if (f && fs.existsSync(f)) {
                try { fs.unlinkSync(f); } catch (_) {}
            }
        });
    }
}

// ================= 构建队列（防止并发重入） =================
const building = { scss: false, js: false };
const queued   = { scss: false, js: false };

async function buildAll() {
    console.log(`\n🚀 [${new Date().toLocaleTimeString()}] 首次构建 v${getVersion()}`);
    await buildSCSS();
    await buildJS();
    console.log('✅ 首次构建完成');
}

async function rebuild(type) {
    if (building[type]) {
        queued[type] = true;
        return;
    }
    building[type] = true;
    queued[type]   = false;

    console.log(`\n🔨 [${new Date().toLocaleTimeString()}] 重新构建 ${type.toUpperCase()} (v${getVersion()})`);

    try {
        if (type === 'scss')      await buildSCSS();
        else if (type === 'js')   await buildJS();
    } finally {
        building[type] = false;
        if (queued[type]) rebuild(type);
    }
}

// ================= 启动 =================
(async () => {
    const ONCE = process.argv.includes('--once');

    // 1. 首次全量构建
    await buildAll();

    if (ONCE) {
        console.log(`✅ 构建完成，输出目录: ${rel(OUTPUT_BASE)}/`);
        process.exit(0);
    }

    // 2. 开始监听（整个 script 目录 + scss 单文件）
    const scssAbs  = path.resolve(SCSS_INPUT).toLowerCase();
    const jsDirAbs = path.resolve(JS_DIR).toLowerCase();

    const watcher = chokidar.watch([SCSS_INPUT, JS_DIR], {
        ignoreInitial: true,
        persistent: true,
        ignored: [
            /[\\/]\.tmp[\\/]/,
            /[\\/]node_modules[\\/]/,
            /\.bundle\.tmp\.js$/
        ],
        awaitWriteFinish: {
            stabilityThreshold: 300,
            pollInterval: 100
        }
    });

    watcher.on('all', (event, file) => {
        if (event !== 'add' && event !== 'change' && event !== 'unlink') return;

        const abs = path.resolve(file).toLowerCase();
        if (abs === scssAbs) {
            rebuild('scss');
        } else if (abs.startsWith(jsDirAbs) && abs.endsWith('.js')) {
            rebuild('js');
        }
    });

    watcher.on('error', err => console.error('❌ watch 错误:', err));

    watcher.on('ready', () => {
        console.log(`\n👀 监听中:`);
        console.log(`   - ${rel(SCSS_INPUT)}`);
        console.log(`   - ${rel(JS_DIR)}/  (所有 .js)`);
        console.log(`📁 输出: ${rel(OUTPUT_BASE)}/`);
    });
})();