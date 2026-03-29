# vite plugin singlefile compression

Compress all assets and embeds them into `dist/index.html`, making it convenient to share as a single HTML file.

The recipient can open it directly in the browser without manually unzipping the file.

Using [DecompressionStream](https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream) + [base128-ascii](https://www.npmjs.com/package/base128-ascii).

Preview: https://bddjr.github.io/vite-plugin-singlefile-compression/

## Setup

```
npm i vite-plugin-singlefile-compression@latest -D
```

Then modify `vite.config.ts`, like [test/vite.config.ts](test/vite.config.ts)

```diff
+ import singleFileCompression from 'vite-plugin-singlefile-compression'

  export default defineConfig({
    plugins: [
      vue(),
      vueDevTools(),
+     singleFileCompression(),
    ],
```

Then use hash history, like [test/src/router/index.ts](test/src/router/index.ts)

```diff
  const router = createRouter({
-   history: createWebHistory(),
+   history: createWebHashHistory(),
```

## Options

Example:

```ts
singleFileCompression({
  rename: 'example.html'
}),
```

### enableCompress

Enable compress.

default: `true`

type: `boolean`

### useBase128

Use Base128 to encode compressed script.  
If false, use Base64.  
https://www.npmjs.com/package/base128-ascii

default: `true`

type: `boolean`

### compressFormat

Compress format.

https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream/DecompressionStream

default: `"deflate-raw"`

type:
 - `"deflate-raw"`
 - `"deflate"`
 - `"gzip"`
 - `"brotli"`
 - `"zstd"`
 - `"deflateRaw"`
 - `"gz"`
 - `"br"`
 - `"brotliCompress"`
 - `"zstandard"`
 - `"zst"`

### compressor

Custom compressor.

type: `(buf: zlib.InputType) => (Buffer | Uint8Array | Promise<Buffer | Uint8Array>)`

### rename

Rename index.html

type: `string`

### htmlMinifierTerser

https://github.com/terser/html-minifier-terser?tab=readme-ov-file#options-quick-reference

default: `defaultHtmlMinifierTerserOptions`

type:
 - `HtmlMinifierOptions`
 - `boolean`

### tryInlineHtmlAssets

Try inline html used assets, if inlined or not used in JS.

default: `true`

type: `boolean`

### removeInlinedAssetFiles

Remove inlined asset files.

default: `true`

type: `boolean`

### tryInlineHtmlPublicIcon

Try inline html icon, if icon is in public dir.

default: `true`

type: `boolean`

### removeInlinedPublicIconFiles

Remove inlined html icon files.

default: `true`

type: `boolean`

### useImportMetaPolyfill

Use import.meta polyfill.

default: `true`

type: `boolean`


## Effect

Preview: https://bddjr.github.io/vite-plugin-singlefile-compression/

```
vite v8.0.3 building client environment for production...
✓ 42 modules transformed.
rendering chunks (1)...

vite-plugin-singlefile-compression 2.1.3 deflate-raw base128-ascii

  file:///D:/code/js/vite-plugin-singlefile-compression/test/dist/index.html
  122.739 kB -> 50.208 kB

Finish.

computing gzip size...
dist/index.html  50.20 kB │ gzip: 43.76 kB

✓ built in 337ms
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
