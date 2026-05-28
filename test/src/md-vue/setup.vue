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
<p>To automatically restore the user's scroll position after a page reload or back/forward navigation, add the following code to the end of <code>src/main.ts</code>:</p>
<pre><code class="hljs language-ts"><span class="hljs-comment">// Restore scroll position after page reload or back/forward navigation</span>
{
    <span class="hljs-keyword">const</span> storageKey = <span class="hljs-string">&#x27;globalScrollXY&#x27;</span>;
    <span class="hljs-keyword">const</span> item = <span class="hljs-variable language_">sessionStorage</span>.<span class="hljs-title function_">getItem</span>(storageKey);
    <span class="hljs-keyword">if</span> (item !== <span class="hljs-literal">null</span>) {
        <span class="hljs-variable language_">sessionStorage</span>.<span class="hljs-title function_">removeItem</span>(storageKey);
        <span class="hljs-keyword">const</span> navEntry = (
            self.<span class="hljs-property">performance</span>?.<span class="hljs-property">getEntriesByType</span>?.(<span class="hljs-string">&#x27;navigation&#x27;</span>)[<span class="hljs-number">0</span>]
        ) <span class="hljs-keyword">as</span> <span class="hljs-title class_">PerformanceNavigationTiming</span> | <span class="hljs-literal">undefined</span>;
        <span class="hljs-keyword">const</span> navType = navEntry?.<span class="hljs-property">type</span>;
        <span class="hljs-keyword">if</span> (navType === <span class="hljs-string">&#x27;reload&#x27;</span> || navType === <span class="hljs-string">&#x27;back_forward&#x27;</span>) {
            <span class="hljs-keyword">const</span> [x, y] = item.<span class="hljs-title function_">split</span>(<span class="hljs-string">&#x27;,&#x27;</span>, <span class="hljs-number">2</span>);
            <span class="hljs-built_in">setTimeout</span>(<span class="hljs-function">() =&gt;</span> self.<span class="hljs-title function_">scrollTo</span>({
                <span class="hljs-attr">left</span>: <span class="hljs-title class_">Number</span>(x),
                <span class="hljs-attr">top</span>: <span class="hljs-title class_">Number</span>(y),
                <span class="hljs-attr">behavior</span>: <span class="hljs-string">&#x27;instant&#x27;</span>
            }), <span class="hljs-number">1</span>);
        }
    }
    <span class="hljs-keyword">const</span> <span class="hljs-title function_">saveScrollPosition</span> = (<span class="hljs-params"></span>) =&gt; {
        <span class="hljs-variable language_">sessionStorage</span>.<span class="hljs-title function_">setItem</span>(storageKey, <span class="hljs-string">`<span class="hljs-subst">${self.scrollX}</span>,<span class="hljs-subst">${self.scrollY}</span>`</span>);
    };
    self.<span class="hljs-title function_">addEventListener</span>(<span class="hljs-string">&#x27;pagehide&#x27;</span>, saveScrollPosition);
    <span class="hljs-variable language_">document</span>.<span class="hljs-title function_">addEventListener</span>(<span class="hljs-string">&#x27;visibilitychange&#x27;</span>, <span class="hljs-function">() =&gt;</span> {
        <span class="hljs-keyword">if</span> (<span class="hljs-variable language_">document</span>.<span class="hljs-property">visibilityState</span> === <span class="hljs-string">&#x27;hidden&#x27;</span>) <span class="hljs-title function_">saveScrollPosition</span>();
    });
}
</code></pre>

</template>