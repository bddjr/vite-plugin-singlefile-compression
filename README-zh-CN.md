# vite plugin singlefile compression

该插件使用 `gzip` 将所有 JavaScript、CSS、图片等资源压缩后，嵌入到 `dist/index.html` ，方便作为单个 `html` 文件分享。

接收方可以直接使用浏览器打开，无需手动解压文件。

改编自 [vite-plugin-singlefile](https://www.npmjs.com/package/vite-plugin-singlefile)

### README Language

> [English](README.md)  
> 简体中文

## 安装

使用 `npm` 安装

```
npm i vite-plugin-singlefile-compression
```

然后修改 `vite.config.ts`

```ts
// 导入 singleFileCompression
import singleFileCompression from 'vite-plugin-singlefile-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // 添加 singleFileCompression
    singleFileCompression(),
  ],
```

然后修改 `src/router/index.ts` ，将 `createWebHistory` 改为 `createWebHashHistory`

```ts
const router = createRouter({
  history: createWebHashHistory(),
```

## 效果

```
vite v5.4.11 building for production...
✓ 45 modules transformed.
rendering chunks (1)...

vite-plugin-singlefile-compression building...

  file:///D:/bddjr/Desktop/code/js/vite-plugin-singlefile-compression/test/dist/index.html
  97.2 KiB -> 50.93 KiB

Finish.

dist/index.html  52.15 kB
✓ built in 758ms
```

```html
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <link rel="icon" href="data:assets,logo-_cUAdIX-.svg">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Vite App</title>
        <script type="module">fetch("data:application/gzip;base64,H4sIAAAA******T5qJhAEA").then((e=>e.blob())).then((e=>new Response(e.stream().pipeThrough(new DecompressionStream("gzip")),{headers:{"Content-Type":"text/javascript"}}).blob())).then((e=>import(e=URL.createObjectURL(e)).finally((()=>URL.revokeObjectURL(e)))));</script>
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
