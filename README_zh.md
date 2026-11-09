# deepkeepx-js

> 轻量 · 零依赖 · 开箱即用的前端 JavaScript 工具库

[![npm version](https://img.shields.io/npm/v/deepkeepx-js.svg)](https://www.npmjs.com/package/deepkeepx-js)
[![license](https://img.shields.io/npm/l/deepkeepx-js.svg)](./LICENSE)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/deepkeepx-js/badge)](https://www.jsdelivr.com/package/npm/deepkeepx-js)

**中文** | [English](./README.md)

---

## 📑 目录

- [特性](#-特性)
- [模块一览](#-模块一览)
- [安装](#-安装)
- [快速开始](#-快速开始)
- [API 文档](#-api-文档)
- [样式说明](#-样式说明)
- [浏览器支持](#-浏览器支持)
- [License](#-license)

---

## ✨ 特性

- 🪶 **轻量** —— 核心压缩后体积小，按需即取
- 📦 **零依赖** —— 纯原生 JS 编写，不依赖 jQuery / Vue / React 等任何框架
- 🌐 **多种引入方式** —— npm 安装（ESM / CommonJS）或 CDN 引入（UMD 全局暴露 `dkx`）
- 🎨 **内置样式** —— SCSS 源码 + 编译好的压缩 CSS，内置亮 / 暗两套主题变量
- 🧩 **10 个模块** —— 请求、提示、loading、下载、Cookie、复制、校验、主题、倾斜特效、浏览器信息与指纹

## 🧩 模块一览

| 模块 | 说明 |
| --- | --- |
| `dkx.loading` | 全局 loading 遮罩（单例） |
| `dkx.toast` | 轻量消息提示（success / error / warning / info） |
| `dkx.request` | 基于 XHR 的 AJAX 请求，支持超时、上传进度、中断 |
| `dkx.download` | Blob 文件下载，自动带 loading 与结果提示 |
| `dkx.cookie` | Cookie 读写封装 |
| `dkx.copy` | 一键复制文本到剪贴板 |
| `dkx.validate` | 常用格式校验（手机号 / 邮箱） |
| `dkx.theme` | 暗色模式切换（基于 View Transition 圆形扩散动画） |
| `dkx.tilt` | 鼠标跟随 3D 倾斜 + 跟随高光特效 |
| `dkx.browser` | 浏览器指纹 + 浏览器 / 设备环境信息 |

---

## 📦 安装

> 📮 npm 仓库地址：<https://www.npmjs.com/package/deepkeepx-js>

### 方式一：npm / pnpm / yarn

```bash
npm i deepkeepx-js
# 或
pnpm add deepkeepx-js
# 或
yarn add deepkeepx-js
```

```js
// ESM
import dkx from 'deepkeepx-js';

// CommonJS
const dkx = require('deepkeepx-js');
```

`toast` / `loading` / `theme` 依赖 CSS，需要一并引入编译好的样式：

```js
import 'deepkeepx-js/dist/index.min.css';
```

> SCSS 源码不随 npm 包发布，如需定制样式请从 GitHub 仓库获取 `scss/` 目录自行编译。

### 方式二：CDN

通过 `<script>` 引入 UMD 产物，全局暴露 `dkx`。jsDelivr 与 unpkg 等价，任选其一：

```html
<!-- jsDelivr（unpkg 等价：https://unpkg.com/deepkeepx-js@1.0.0/dist/...） -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/deepkeepx-js@1.0.0/dist/index.min.css" />
<script src="https://cdn.jsdelivr.net/npm/deepkeepx-js@1.0.0/dist/index.min.js"></script>

<script>
    dkx.toast.success('Hello deepkeepx-js');
</script>
```

> 版本号 `@1.0.0` 可省略（默认取最新版），也可替换为任意已发布版本。**生产环境建议锁定具体版本号**，以获得稳定的缓存与可预测的行为。也可将 `dist/` 产物部署到自有 CDN / 服务器。

### 方式三：本地构建引入

执行 `npm run build` 生成 `dist/index.min.js` 与 `dist/index.min.css` 后引入：

```html
<link rel="stylesheet" href="dist/index.min.css" />
<script src="dist/index.min.js"></script>
```

---

## 🚀 快速开始

```html
<script src="dist/index.min.js"></script>
<script>
    // 请求
    dkx.request.get('/api/user').then((data) => {
        console.log(data);
    });

    // 提示
    dkx.toast.success('操作成功');

    // loading（无参调用即关闭）
    dkx.loading('加载中...');
    setTimeout(() => dkx.loading(), 1500);

    // 环境信息
    console.log(dkx.browser.info.browser.name); // Chrome / Safari / WeChat ...
    console.log(dkx.browser.fingerprint);        // 32 位十六进制指纹
</script>
```

---

## 📖 API 文档

所有模块的方法签名、参数表与示例，见官方文档：

- 在线文档：<https://doc.deepkeepx.com/deepkeepx-js/v1.0.0/index.html>

---

## 🎨 样式说明

编译后的 `index.min.css` 包含：

- 基础样式重置（`box-sizing`、`margin/padding` 归零等）
- `--dkx-*` 主题 CSS 变量（亮色 + `:root.dark` 暗色两套）
- `toast` / `loading` 组件样式
- 暗色模式切换动画
- 常用工具类（布局 / 栅格 / 定位 / 尺寸 / 文本省略，见 `scss/mixin/`）

npm 包仅含编译后的 CSS；如需定制，请从 GitHub 仓库获取 `scss/` 源码自行编译。

## 🌐 浏览器支持

构建目标为 ES2018，支持 Chrome / Edge / Firefox / Safari 最近 2 个版本。不支持 IE。`theme` 模块在支持 View Transition API 的浏览器上有完整动画，其余浏览器自动降级。

## 📄 License

[MIT](./LICENSE) © DeepkeepX