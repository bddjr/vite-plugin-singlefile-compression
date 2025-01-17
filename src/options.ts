import { Options as htmlMinifierOptions } from 'html-minifier-terser'
import { compressFormat } from './compress.js'

export interface Options {
    /**
     * Rename index.html
     */
    rename?: string

    /**
     * https://github.com/terser/html-minifier-terser?tab=readme-ov-file#options-quick-reference
     * @default defaultHtmlMinifierTerserOptions
     */
    htmlMinifierTerser?: htmlMinifierOptions | boolean

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
     * Use Base128 to encode gzipped script.
     * If false, use Base64.
     * https://www.npmjs.com/package/base128-ascii
     * @default true
     */
    useBase128?: boolean

    /**
     * Compress format.
     * @default "deflate-raw"
     */
    compressFormat?: compressFormat
}

export const defaultHtmlMinifierTerserOptions: htmlMinifierOptions = {
    removeAttributeQuotes: true,
    removeComments: true,
    collapseWhitespace: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    minifyJS: false,
}

export interface innerOptions {
    rename?: string
    htmlMinifierTerser: htmlMinifierOptions | false
    tryInlineHtmlAssets: boolean
    removeInlinedAssetFiles: boolean
    tryInlineHtmlPublicIcon: boolean
    removeInlinedPublicIconFiles: boolean
    useBase128: boolean
    compressFormat: compressFormat
}

export function getInnerOptions(opt?: Options): innerOptions {
    opt ||= {}
    return {
        rename:
            opt.rename && opt.rename.replace(/(\.(html?)?)?$/, '.html'),

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

        useBase128:
            opt.useBase128 ?? true,

        compressFormat:
            ["deflate-raw", "deflate", "gzip"].includes(opt.compressFormat)
                ? opt.compressFormat
                : "deflate-raw",
    }
}