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
<p>More options see <a target="_blank" href="https://github.com/bddjr/vite-plugin-singlefile-compression/blob/main/src/options.ts">src/options.ts</a></p>
<pre><code class="hljs language-ts"><span class="hljs-keyword">export</span> <span class="hljs-keyword">interface</span> <span class="hljs-title class_">Options</span> {
    <span class="hljs-comment">/**
     * Enable compress.
     * <span class="hljs-doctag">@default</span> <span class="hljs-variable">true</span>
     */</span>
    <span class="hljs-attr">enableCompress</span>?: <span class="hljs-built_in">boolean</span>

    <span class="hljs-comment">/**
     * Use Base128 to encode compressed script.
     * If false, use Base64.
     * https://www.npmjs.com/package/base128-ascii
     * <span class="hljs-doctag">@default</span> <span class="hljs-variable">true</span>
     */</span>
    <span class="hljs-attr">useBase128</span>?: <span class="hljs-built_in">boolean</span>

    <span class="hljs-comment">/**
     * Compress format.
     * 
     * https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream/DecompressionStream
     * 
     * <span class="hljs-doctag">@type</span> {<span class="hljs-type">&quot;deflate-raw&quot; | &quot;deflate&quot; | &quot;gzip&quot; | &quot;brotli&quot; | &quot;zstd&quot; | &quot;deflateRaw&quot; | &quot;gz&quot; | &quot;br&quot; | &quot;brotliCompress&quot; | &quot;zstandard&quot; | &quot;zst&quot;</span>}
     * 
     * <span class="hljs-doctag">@default</span> &quot;brotli&quot;
     */</span>
    <span class="hljs-attr">compressFormat</span>?: <span class="hljs-title class_">CompressFormat</span> | <span class="hljs-title class_">CompressFormatAlias</span>

    <span class="hljs-comment">/**
     * Custom compressor.
     */</span>
    <span class="hljs-attr">compressor</span>?: <span class="hljs-title class_">Compressor</span>

    <span class="hljs-comment">/**
     * Rename index.html
     */</span>
    <span class="hljs-attr">rename</span>?: <span class="hljs-built_in">string</span>

    <span class="hljs-comment">/**
     * https://github.com/terser/html-minifier-terser?tab=readme-ov-file#options-quick-reference
     * <span class="hljs-doctag">@default</span> <span class="hljs-variable">defaultHtmlMinifierTerserOptions</span>
     */</span>
    <span class="hljs-attr">htmlMinifierTerser</span>?: <span class="hljs-title class_">HtmlMinifierOptions</span> | <span class="hljs-built_in">boolean</span>

    <span class="hljs-comment">/**
     * Try inline html used assets, if inlined or not used in JS.
     * <span class="hljs-doctag">@default</span> <span class="hljs-variable">true</span>
     */</span>
    <span class="hljs-attr">tryInlineHtmlAssets</span>?: <span class="hljs-built_in">boolean</span>

    <span class="hljs-comment">/**
     * Remove inlined asset files.
     * <span class="hljs-doctag">@default</span> <span class="hljs-variable">true</span>
     */</span>
    <span class="hljs-attr">removeInlinedAssetFiles</span>?: <span class="hljs-built_in">boolean</span>

    <span class="hljs-comment">/**
     * Try inline html icon, if icon is in public dir.
     * <span class="hljs-doctag">@default</span> <span class="hljs-variable">true</span>
     */</span>
    <span class="hljs-attr">tryInlineHtmlPublicIcon</span>?: <span class="hljs-built_in">boolean</span>

    <span class="hljs-comment">/**
     * Remove inlined html icon files.
     * <span class="hljs-doctag">@default</span> <span class="hljs-variable">true</span>
     */</span>
    <span class="hljs-attr">removeInlinedPublicIconFiles</span>?: <span class="hljs-built_in">boolean</span>

    <span class="hljs-comment">/**
     * Use import.meta polyfill.
     * <span class="hljs-doctag">@default</span> <span class="hljs-variable">true</span>
     */</span>
    <span class="hljs-attr">useImportMetaPolyfill</span>?: <span class="hljs-built_in">boolean</span>
}
</code></pre>

</template>