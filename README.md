# vite plugin singlefile compression

Compress all assets and embeds them into `dist/index.html`, making it convenient to share as a single HTML file.

The recipient can open it directly in the browser without manually unzipping the file.

Adapted from [vite-plugin-singlefile](https://www.npmjs.com/package/vite-plugin-singlefile)

### README Language

> English  
> [简体中文](README-zh-CN.md)

## Install

Using `npm` to install

```
npm i vite-plugin-singlefile-compression
```

Then modify [vite.config.ts](test/vite.config.ts#L14)

```ts
// Import singleFileCompression
import singleFileCompression from 'vite-plugin-singlefile-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // Add singleFileCompression
    singleFileCompression(),
  ],
  esbuild: {
    // Remove license comments
    legalComments: "none"
  },
  build: {
    terserOptions: {
      format: {
        // Remove license comments
        comments: false
      }
    },
    target: 'esnext',
    reportCompressedSize: false
  },
```

Then modify [src/router/index.ts](test/src/router/index.ts#L5) , change `createWebHistory` to `createWebHashHistory`

```ts
const router = createRouter({
  history: createWebHashHistory(),
```

## Options

```ts
export interface Options {
	/**
	 * https://github.com/terser/html-minifier-terser?tab=readme-ov-file#options-quick-reference
	 * @default defaultHtmlMinifierTerserOptions
	 */
	htmlMinifierTerser?: htmlMinifierOptions | boolean;

	/**
	 * Try inline html used assets, if inlined or not used in JS.
	 * @default true
	 */
	tryInlineHtmlAssets?: boolean;

	/**
	 * Remove inlined asset files.
	 * @default true
	 */
	removeInlinedAssetFiles?: boolean;

	/**
	 * Try inline html icon, if icon is in public dir.
	 * @default true
	 */
	tryInlineHtmlPublicIcon?: boolean;

	/**
	 * Remove inlined html icon files.
	 * @default true
	 */
	removeInlinedPublicIconFiles?: boolean;
}
```

## Effect

https://bddjr.github.io/vite-plugin-singlefile-compression/

```
vite v6.0.6 building for production...
✓ 45 modules transformed.
rendering chunks (1)...

vite-plugin-singlefile-compression 1.1.3 building...

  file:///D:/bddjr/Desktop/code/js/vite-plugin-singlefile-compression/test/dist/index.html
  101.02 KiB -> 52.1 KiB

Finish.

dist/index.html  53.35 kB
✓ built in 734ms
```

## Clone

```
git clone https://github.com/bddjr/vite-plugin-singlefile-compression
cd vite-plugin-singlefile-compression
npm i
cd test
npm i
cd ..
npm run build
```

## License

[MIT](LICENSE.txt)
