<!--
  Generate by build-md.mjs
  Do not manually modify!
-->
<template>
<h1>Options</h1>
<p>Example:</p>
<pre><code class="hljs language-ts"><span class="hljs-title function_">singleFileCompression</span>({
  <span class="hljs-attr">rename</span>: <span class="hljs-string">&#x27;example.html&#x27;</span>
}),
</code></pre>
<h3>rename</h3>
<p>Rename index.html</p>
<p>type: <code>string</code></p>
<h3>enableCompress</h3>
<p>Enable compress.</p>
<p>default: <code>true</code></p>
<p>type: <code>boolean</code></p>
<h3>useBase128</h3>
<p>Use Base128 to encode compressed script.<br>
If false, use Base64.<br>
<a target="_blank" href="https://www.npmjs.com/package/base128-ascii">https://www.npmjs.com/package/base128-ascii</a></p>
<p>default: <code>true</code></p>
<p>type: <code>boolean</code></p>
<h3>compressFormat</h3>
<p>Compress format.</p>
<p><a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream/DecompressionStream">https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream/DecompressionStream</a></p>
<p>default: <code>&quot;deflate-raw&quot;</code></p>
<p>type:</p>
<ul>
<li><code>&quot;deflate-raw&quot;</code></li>
<li><code>&quot;deflate&quot;</code></li>
<li><code>&quot;gzip&quot;</code></li>
<li><code>&quot;brotli&quot;</code></li>
<li><code>&quot;zstd&quot;</code></li>
<li><code>&quot;deflateRaw&quot;</code></li>
<li><code>&quot;gz&quot;</code></li>
<li><code>&quot;br&quot;</code></li>
<li><code>&quot;brotliCompress&quot;</code></li>
<li><code>&quot;zstandard&quot;</code></li>
<li><code>&quot;zst&quot;</code></li>
</ul>
<h3>compressor</h3>
<p>Custom compressor.</p>
<p>type: <code>(buf: zlib.InputType) =&gt; (Buffer | Uint8Array | Promise&lt;Buffer | Uint8Array&gt;)</code></p>
<h3>htmlMinifierTerser</h3>
<p><a target="_blank" href="https://github.com/terser/html-minifier-terser?tab=readme-ov-file#options-quick-reference">https://github.com/terser/html-minifier-terser?tab=readme-ov-file#options-quick-reference</a></p>
<p>default: <code>defaultHtmlMinifierTerserOptions</code></p>
<p>type:</p>
<ul>
<li><code>HtmlMinifierOptions</code></li>
<li><code>boolean</code></li>
</ul>
<h3>tryInlineHtmlAssets</h3>
<p>Try inline html used assets, if inlined or not used in JS.</p>
<p>default: <code>true</code></p>
<p>type: <code>boolean</code></p>
<h3>removeInlinedAssetFiles</h3>
<p>Remove inlined asset files.</p>
<p>default: <code>true</code></p>
<p>type: <code>boolean</code></p>
<h3>tryInlineHtmlPublicIcon</h3>
<p>Try inline html icon, if icon is in public dir.</p>
<p>default: <code>true</code></p>
<p>type: <code>boolean</code></p>
<h3>removeInlinedPublicIconFiles</h3>
<p>Remove inlined html icon files.</p>
<p>default: <code>true</code></p>
<p>type: <code>boolean</code></p>
<h3>useImportMetaPolyfill</h3>
<p>Use import.meta polyfill.</p>
<p>default: <code>false</code></p>
<p>type: <code>boolean</code></p>

</template>