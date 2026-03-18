<script setup lang="ts">
import { marked } from 'marked'
var md = marked.parse(`
# Setup
\`\`\`
npm i vite-plugin-singlefile-compression@latest -D
\`\`\`

Then modify \`vite.config.ts\`, like [test/vite.config.ts](https://github.com/bddjr/vite-plugin-singlefile-compression/blob/main/test/vite.config.ts)

\`\`\`diff
+ import singleFileCompression from 'vite-plugin-singlefile-compression'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
+   singleFileCompression(),
  ],
\`\`\`

Then use hash history, like [src/router/index.ts](https://github.com/bddjr/vite-plugin-singlefile-compression/blob/main/test/src/router/index.ts#L5)

\`\`\`diff
const router = createRouter({
- history: createWebHistory(),
+ history: createWebHashHistory(),
\`\`\`
`).toString().replaceAll('<a ', '<a target=_blank ')
</script>

<template>
  <div v-html="md"></div>
</template>

<style>
p,
h1 {
  margin: 16px 0;
}

pre {
  background: #81818136;
  padding: 8px 14px;
  overflow: auto;
}
</style>