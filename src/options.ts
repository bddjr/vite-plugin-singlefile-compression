import { Options as HtmlMinifierOptions } from 'html-minifier-terser'
import { CompressFormat, compressFormatAlias, CompressFormatAlias, Compressor } from './compress.js'

export interface Options {
    /**
     * Rename index.html
     */
    rename?: string

    /**
     * Enable compress.
     * @default true
     */
    enableCompress?: boolean

    /**
     * Use Base128 to encode compressed script.
     * If false, use Base64.
     * https://www.npmjs.com/package/base128-ascii
     * @default true
     */
    useBase128?: boolean

    /**
     * Compress format.
     * 
     * https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream/DecompressionStream
     * 
     * @type {"deflate-raw" | "deflate" | "gzip" | "brotli" | "zstd" | "deflateRaw" | "gz" | "br" | "brotliCompress" | "zstandard" | "zst"}
     * 
     * @default "deflate-raw"
     */
    compressFormat?: CompressFormat | CompressFormatAlias

    /**
     * Custom compressor.
     */
    compressor?: Compressor

    /**
     * https://github.com/terser/html-minifier-terser?tab=readme-ov-file#options-quick-reference
     * @default defaultHtmlMinifierTerserOptions
     */
    htmlMinifierTerser?: HtmlMinifierOptions | boolean

    /**
     * Try inline html used assets, if inlined or not used in JS.
     * @default true
     */
    tryInlineHtmlAssets?: boolean

    /**
     * Remove inlined asset files.
     * @default true
     */
    removeInlinedAssetFiles?: boolean

    /**
     * Try inline html icon, if icon is in public dir.
     * @default true
     */
    tryInlineHtmlPublicIcon?: boolean

    /**
     * Remove inlined html icon files.
     * @default true
     */
    removeInlinedPublicIconFiles?: boolean

    /**
     * Use import.meta polyfill.
     * @default false
     */
    useImportMetaPolyfill?: boolean
}

export const defaultHtmlMinifierTerserOptions: HtmlMinifierOptions = {
    removeAttributeQuotes: true,
    removeComments: true,
    collapseWhitespace: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    minifyJS: false,
}

export interface InnerOptions {
    rename: string | undefined
    enableCompress: boolean
    useBase128: boolean
    compressFormat: CompressFormat
    compressor: Compressor | undefined
    htmlMinifierTerser: HtmlMinifierOptions | false
    tryInlineHtmlAssets: boolean
    removeInlinedAssetFiles: boolean
    tryInlineHtmlPublicIcon: boolean
    removeInlinedPublicIconFiles: boolean
    useImportMetaPolyfill: boolean
}

export function getInnerOptions(opt?: Options): InnerOptions {
    opt ||= {}
    return {
        rename:
            opt.rename == null
                ? undefined
                : String(opt.rename),

        enableCompress:
            opt.enableCompress ?? true,

        useBase128:
            opt.useBase128 ?? true,

        compressFormat:
            opt.compressFormat
                ? (
                    compressFormatAlias.hasOwnProperty(opt.compressFormat)
                        ? compressFormatAlias[opt.compressFormat as CompressFormatAlias]
                        : String(opt.compressFormat) as CompressFormat
                )
                : "deflate-raw",

        compressor:
            typeof opt.compressor == 'function' ? opt.compressor : undefined,

        htmlMinifierTerser:
            opt.htmlMinifierTerser == null || opt.htmlMinifierTerser === true
                ? defaultHtmlMinifierTerserOptions
                : opt.htmlMinifierTerser,

        tryInlineHtmlAssets:
            opt.tryInlineHtmlAssets ?? true,

        removeInlinedAssetFiles:
            opt.removeInlinedAssetFiles ?? true,

        tryInlineHtmlPublicIcon:
            opt.tryInlineHtmlPublicIcon ?? true,

        removeInlinedPublicIconFiles:
            opt.removeInlinedPublicIconFiles ?? true,

        useImportMetaPolyfill:
            opt.useImportMetaPolyfill ?? false,
    }
}

export { HtmlMinifierOptions }