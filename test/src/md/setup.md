# Setup

```
npm i -D vite-plugin-singlefile-compression@latest
```

Then modify `vite.config.ts`, like [test/vite.config.ts](https://github.com/bddjr/vite-plugin-singlefile-compression/blob/main/test/vite.config.ts)

```diff
+ import singleFileCompression from 'vite-plugin-singlefile-compression'

  export default defineConfig({
    plugins: [
      vue(),
      vueDevTools(),
+     singleFileCompression(),
    ],
```

Then use hash history, like [test/src/router/index.ts](https://github.com/bddjr/vite-plugin-singlefile-compression/blob/main/test/src/router/index.ts)

```diff
  const router = createRouter({
-   history: createWebHistory(),
+   history: createWebHashHistory(),
```
