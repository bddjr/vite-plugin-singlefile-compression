# vite plugin singlefile compression

This plugin compresses all JavaScript, CSS, images, etc. resources using gzip and embeds them into `dist/index.html`, making it convenient to share as a single HTML file.

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
    htmlMinifierTerser?: htmlMinifierOptions | true | false
}
```

## Effect

```
vite v5.4.11 building for production...
✓ 45 modules transformed.
rendering chunks (1)...

vite-plugin-singlefile-compression building...

  file:///D:/bddjr/Desktop/code/js/vite-plugin-singlefile-compression/test/dist/index.html
  97.52 KiB -> 50.98 KiB

Finish.

dist/index.html  52.19 kB
✓ built in 685ms
```

```html
<!DOCTYPE html><meta charset=UTF-8><link rel=icon href=data:logo-_cUAdIX-.svg><meta name=viewport content="width=device-width,initial-scale=1"><title>Vite App</title><script type=module>fetch("data:application/gzip;base64,H4sI********hAEA").then(r=>r.blob()).then(b=>new Response(b.stream().pipeThrough(new DecompressionStream("gzip")),{headers:{"Content-Type":"text/javascript"}}).blob()).then(b=>import(b=URL.createObjectURL(b)).finally(()=>URL.revokeObjectURL(b)))</script><div id=app></div>
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
