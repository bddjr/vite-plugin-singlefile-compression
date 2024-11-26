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
```

Then modify [src/router/index.ts](test/src/router/index.ts#L5) , change `createWebHistory` to `createWebHashHistory`

```ts
const router = createRouter({
  history: createWebHashHistory(),
```

## Effect

```
vite v5.4.11 building for production...
✓ 45 modules transformed.
rendering chunks (1)...

vite-plugin-singlefile-compression building...

  file:///D:/bddjr/Desktop/code/js/vite-plugin-singlefile-compression/test/dist/index.html
  97.2 KiB -> 50.91 KiB

Finish.

dist/index.html  52.13 kB
✓ built in 778ms
```

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <link rel="icon" href="data:logo-_cUAdIX-.svg">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vite App</title>
        <script type="module">fetch("data:application/gzip;base64,H4sI******AQA=").then(r=>r.blob()).then(b=>new Response(b.stream().pipeThrough(new DecompressionStream("gzip")),{headers:{"Content-Type":"text/javascript"}}).blob()).then(b=>import(b=URL.createObjectURL(b)).finally(()=>URL.revokeObjectURL(b)))</script>
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
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
