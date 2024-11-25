# vite plugin singlefile compression

This plugin compresses all JavaScript, CSS, images, etc. resources using `gzip` and embeds them into `dist/index.html`, making it convenient to share as a single `html` file.

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

Then modify `vite.config.ts`

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

Then modify `src/router/index.ts` , change `createWebHistory` to `createWebHashHistory`

```ts
const router = createRouter({
  history: createWebHashHistory(),
```

## Effect

```
vite v5.4.11 building for production...
✓ 45 modules transformed.
rendering chunks (1)...

singleFileGzip building...

  file:///D:/bddjr/Desktop/code/js/vite-plugin-singlefile-compression/test/dist/index.html
  102 KiB -> 53 KiB

Finish.

dist/index.html  53.64 kB
✓ built in 720ms
```

```html
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8" />
		<link rel="icon" href="data:assets,favicon-uSLXchjO.ico" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Vite App</title>
		<script type="module">
			fetch("data:application/gzip;base64,H4sIAAAA******y5kBAA==")
				.then((e) => e.blob())
				.then((e) =>
					new Response(
						e.stream().pipeThrough(new DecompressionStream("gzip")),
						{ headers: { "Content-Type": "text/javascript" } }
					).blob()
				)
				.then((e) =>
					import((e = URL.createObjectURL(e))).finally(() =>
						URL.revokeObjectURL(e)
					)
				);
		</script>
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
