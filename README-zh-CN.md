# vite plugin singlefile compression

使用 gzip 将所有资源压缩后，嵌入到 `dist/index.html` ，方便作为单个 HTML 文件分享。

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

然后修改 [vite.config.ts](test/vite.config.ts#L14)

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
  esbuild: {
    // 移除许可证注释
    legalComments: "none"
  },
  build: {
    terserOptions: {
      format: {
        // 移除许可证注释
        comments: false
      }
    },
    target: 'esnext',
    reportCompressedSize: false
  },
```

然后修改 [src/router/index.ts](test/src/router/index.ts#L5) ，将 `createWebHistory` 改为 `createWebHashHistory`

```ts
const router = createRouter({
  history: createWebHashHistory(),
```

## 选项

```ts
export interface Options {
    /**
     * https://github.com/terser/html-minifier-terser?tab=readme-ov-file#options-quick-reference
     * @default defaultHtmlMinifierTerserOptions
     */
    htmlMinifierTerser?: htmlMinifierOptions | boolean

    /**
     * 尝试内联 html 用到的资源，如果在 JS 里被内联或未使用。
     * @default true
     */
    tryInlineHtmlAssets?: boolean

    /**
     * 移除已内联的资源文件。
     * @default true
     */
    removeInlinedAssetFiles?: boolean

    /**
     * 尝试内联 html 的图标，如果图标在 public 文件夹。
     * @default true
     */
    tryInlineHtmlPublicIcon?: boolean

    /**
     * 移除已内联的 html 图标文件。
     * @default true
     */
    removeInlinedPublicIconFiles?: boolean
}
```

## 效果

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
