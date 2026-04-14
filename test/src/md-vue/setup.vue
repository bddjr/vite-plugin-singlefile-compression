<!--
  Generate by build-md.mjs
  Do not manually modify!
-->
<template>
<h1>Setup</h1>
<pre><code class="hljs">npm i -D vite-plugin-singlefile-compression@latest
</code></pre>
<p>Then modify <code>vite.config.ts</code>, like <a target="_blank" href="https://github.com/bddjr/vite-plugin-singlefile-compression/blob/main/test/vite.config.ts">test/vite.config.ts</a></p>
<pre><code class="hljs language-diff"><span class="hljs-addition">+ import singleFileCompression from &#x27;vite-plugin-singlefile-compression&#x27;</span>

  export default defineConfig({
    plugins: [
      vue(),
      vueDevTools(),
<span class="hljs-addition">+     singleFileCompression(),</span>
    ],
</code></pre>
<p>Then use hash history, like <a target="_blank" href="https://github.com/bddjr/vite-plugin-singlefile-compression/blob/main/test/src/router/index.ts">test/src/router/index.ts</a></p>
<pre><code class="hljs language-diff">  const router = createRouter({
<span class="hljs-deletion">-   history: createWebHistory(),</span>
<span class="hljs-addition">+   history: createWebHashHistory(),</span>
</code></pre>

</template>