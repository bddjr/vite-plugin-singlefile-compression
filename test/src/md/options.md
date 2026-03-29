# Options

Example:

```ts
singleFileCompression({
  rename: 'example.html'
}),
```

### rename

Rename index.html

type: `string`

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
