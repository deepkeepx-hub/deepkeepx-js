# deepkeepx-js

> A lightweight, zero-dependency, ready-to-use frontend JavaScript toolkit.

[![npm version](https://img.shields.io/npm/v/deepkeepx-js.svg)](https://www.npmjs.com/package/deepkeepx-js)
[![license](https://img.shields.io/npm/l/deepkeepx-js.svg)](./LICENSE)
[![jsdelivr](https://data.jsdelivr.com/v1/package/npm/deepkeepx-js/badge)](https://www.jsdelivr.com/package/npm/deepkeepx-js)

[中文](./README_zh.md) | **English**

---

## 📑 Table of Contents

- [Features](#-features)
- [Modules](#-modules)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Styles](#-styles)
- [Browser Support](#-browser-support)
- [License](#-license)

---

## ✨ Features

- 🪶 **Lightweight** — small footprint after minification
- 📦 **Zero dependencies** — pure native JS, no jQuery / Vue / React or any other framework required
- 🌐 **Multiple usage modes** — install via npm (ESM / CommonJS) or load from a CDN (UMD, global `dkx`)
- 🎨 **Built-in styles** — SCSS sources + compiled minified CSS, with light and dark theme variables included
- 🧩 **10 modules** — request, toast, loading, download, cookie, copy, validate, theme, tilt, browser info & fingerprint

## 🧩 Modules

| Module | Description |
| --- | --- |
| `dkx.loading` | Global loading mask (singleton) |
| `dkx.toast` | Lightweight toast notifications (success / error / warning / info) |
| `dkx.request` | XHR-based AJAX with timeout, upload progress and abort support |
| `dkx.download` | Blob file download with automatic loading & result toasts |
| `dkx.cookie` | Cookie read/write helpers |
| `dkx.copy` | One-click copy text to clipboard |
| `dkx.validate` | Common format validation (phone / email) |
| `dkx.theme` | Dark mode toggle (View Transition circular reveal animation) |
| `dkx.tilt` | Mouse-following 3D tilt + glare effect |
| `dkx.browser` | Browser fingerprint + browser/device environment info |

---

## 📦 Installation

> 📮 npm registry: <https://www.npmjs.com/package/deepkeepx-js>

### Option 1: npm / pnpm / yarn

```bash
npm i deepkeepx-js
# or
pnpm add deepkeepx-js
# or
yarn add deepkeepx-js
```

```js
// ESM
import dkx from 'deepkeepx-js';

// CommonJS
const dkx = require('deepkeepx-js');
```

`toast` / `loading` / `theme` depend on CSS — import the compiled styles as well:

```js
import 'deepkeepx-js/dist/index.min.css';
```

> SCSS sources are not published to npm. Grab the `scss/` directory from the GitHub repo if you need to customize styles.

### Option 2: CDN

Load the UMD build with a `<script>` tag; the global `dkx` is exposed. jsDelivr and unpkg are interchangeable — pick either:

```html
<!-- jsDelivr (unpkg equivalent: https://unpkg.com/deepkeepx-js@1.0.0/dist/...) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/deepkeepx-js@1.0.0/dist/index.min.css" />
<script src="https://cdn.jsdelivr.net/npm/deepkeepx-js@1.0.0/dist/index.min.js"></script>

<script>
    dkx.toast.success('Hello deepkeepx-js');
</script>
```

> The `@1.0.0` tag can be omitted (defaults to latest) or replaced with any published version. **For production, pin an explicit version** to keep caching stable and behavior predictable. You may also host the `dist/` output on your own CDN / server.

### Option 3: Local build

Run `npm run build` to produce `dist/index.min.js` and `dist/index.min.css`, then include them:

```html
<link rel="stylesheet" href="dist/index.min.css" />
<script src="dist/index.min.js"></script>
```

---

## 🚀 Quick Start

```html
<script src="dist/index.min.js"></script>
<script>
    // Request
    dkx.request.get('/api/user').then((data) => {
        console.log(data);
    });

    // Toast
    dkx.toast.success('Done');

    // Loading (calling with no args closes it)
    dkx.loading('Loading...');
    setTimeout(() => dkx.loading(), 1500);

    // Environment info
    console.log(dkx.browser.info.browser.name); // Chrome / Safari / WeChat ...
    console.log(dkx.browser.fingerprint);        // 32-char hex fingerprint
</script>
```

---

## 📖 API Documentation

All method signatures, option tables and examples live in the official docs:

- Online docs: <https://doc.deepkeepx.com/deepkeepx-js/v1.0.0/index.html>

---

## 🎨 Styles

The compiled `index.min.css` includes:

- Basic style reset (`box-sizing`, zeroed `margin/padding`, etc.)
- `--dkx-*` theme CSS variables (light + `:root.dark` dark set)
- `toast` / `loading` component styles
- Dark-mode transition animation
- Utility classes (layout / grid / positioning / sizing / text ellipsis, see `scss/mixin/`)

The npm package ships only the compiled CSS; get the `scss/` sources from the GitHub repo if you need customization.

## 🌐 Browser Support

Build target is ES2018 — Chrome / Edge / Firefox / Safari, last 2 versions. IE is not supported. The `theme` module provides the full animation in browsers with the View Transition API and degrades gracefully elsewhere.

## 📄 License

[MIT](./LICENSE) © DeepkeepX