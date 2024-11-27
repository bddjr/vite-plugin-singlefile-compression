import { UserConfig, PluginOption } from "vite"
import { OutputChunk, OutputAsset, OutputBundle } from "rollup"
import mime from 'mime'
import pc from "picocolors"
import svgToTinyDataUri from "mini-svg-data-uri"
import { minify as htmlMinify, Options as htmlMinifierOptions } from 'html-minifier-terser'

import zlib from 'zlib'
import path from 'path'
import fs from 'fs'
import { pathToFileURL } from "url"

export interface Options {
    /**
     * https://github.com/terser/html-minifier-terser?tab=readme-ov-file#options-quick-reference
     * @default defaultHtmlMinifierTerserOptions
     */
    htmlMinifierTerser?: htmlMinifierOptions | boolean
}

export const defaultHtmlMinifierTerserOptions: htmlMinifierOptions = {
    removeAttributeQuotes: true,
    removeComments: true,
    collapseWhitespace: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    minifyJS: false,
}

export function singleFileCompression(options?: Options): PluginOption {
    const htmlMinifierOptions =
        options?.htmlMinifierTerser == null || options.htmlMinifierTerser === true
            ? defaultHtmlMinifierTerserOptions
            : options.htmlMinifierTerser

    return {
        name: "singleFileCompression",
        enforce: "post",
        config: setConfig,
        generateBundle: (_, bundle) => generateBundle(bundle, htmlMinifierOptions),
    }
}

export default singleFileCompression

const template = fs.readFileSync(path.join(import.meta.dirname, "template.js")).toString()

const templateAssets = fs.readFileSync(path.join(import.meta.dirname, "template-assets.js")).toString()

const distURL = pathToFileURL(path.resolve("dist")) + "/"

function gzipToBase64(buf: zlib.InputType) {
    return zlib.gzipSync(buf, {
        level: zlib.constants.Z_BEST_COMPRESSION,
    }).toString('base64')
}

function KiB(size: number) {
    return `${Math.ceil(size / 10.24) / 100} KiB`
}

function setConfig(config: UserConfig) {
    config.base = './'

    if (!config.build)
        config.build = {}

    config.build.assetsInlineLimit = () => true
    config.build.chunkSizeWarningLimit = Infinity
    config.build.cssCodeSplit = false
    config.build.assetsDir = 'assets'
    config.build.modulePreload = { polyfill: false }

    if (!config.build.rollupOptions)
        config.build.rollupOptions = {}

    config.build.rollupOptions.output = { inlineDynamicImports: true }
}

async function generateBundle(bundle: OutputBundle, htmlMinifierOptions: htmlMinifierOptions | false) {
    console.log(pc.cyan('\n\nvite-plugin-singlefile-compression ') + pc.green('building...'))

    const globalDel = new Set<string>()
    const globalDoNotDel = new Set<string>()

    for (const htmlFileName of Object.keys(bundle)) {
        // key format:
        //   index.html
        //   assets/index-ZZZZZZZZ.js

        // skip other file
        if (!htmlFileName.endsWith('.html')) continue

        // init
        const htmlChunk = bundle[htmlFileName] as OutputAsset
        let newHtml = htmlChunk.source as string
        let oldSize = newHtml.length
        const thisDel = new Set<string>()

        // Fix async import, fix new URL
        const newJSCode = ["self.__VITE_PRELOAD__=void 0"]

        // get css tag
        newHtml = newHtml.replace(/\s*<link rel="stylesheet"[^>]* href="\.\/(assets\/[^"]+)"[^>]*>/,
            (match, name: string) => {
                thisDel.add(name)
                const css = bundle[name] as OutputAsset
                const cssSource = css.source as string
                if (cssSource) {
                    oldSize += cssSource.length
                    // add script for load css
                    newJSCode.push(
                        'document.head.appendChild(document.createElement("style")).innerHTML='
                        + JSON.stringify(cssSource.replace(/\s+$/, ''))
                    )
                }
                // delete tag
                return ''
            }
        )

        // get html assets
        const assets = {}
        newHtml = newHtml.replace(/(?<=[\s"])(src|href)="\.\/assets\/([^"]+)"/g,
            (match, attrName: string, name: string) => {
                if (name.endsWith('.js'))
                    return match
                if (!Object.hasOwn(assets, name)) {
                    const bundleName = "assets/" + name
                    const a = bundle[bundleName] as OutputAsset
                    if (!a)
                        return match
                    thisDel.add(bundleName)
                    const b = Buffer.from(a.source)
                    oldSize += b.length
                    assets[name] =
                        name.endsWith('.svg')
                            ? svgToTinyDataUri(b.toString())
                            : `data:${mime.getType(a.fileName)};base64,${b.toString('base64')}`
                }
                return `${attrName}="data:${name}"`
            }
        )

        // add script for load html assets
        const assetsJSON = JSON.stringify(assets)
        if (assetsJSON != '{}')
            newJSCode.push(templateAssets.replace('{"":""}', assetsJSON))

        let ok = false
        newHtml = newHtml.replace(/<script type="module"[^>]* src="\.\/(assets\/[^"]+)"[^>]*><\/script>/,
            (match, name: string) => {
                ok = true
                thisDel.add(name)
                const js = bundle[name] as OutputChunk
                oldSize += js.code.length
                // fix new URL
                newJSCode.push(`import.meta.url=location.origin+location.pathname.replace(/[^/]*$/,"${name}")`)
                for (const i in assets) {
                    if (js.code.includes(i))
                        globalDoNotDel.add(i)
                }
                // add script
                newJSCode.push(js.code.replace(/;?\n?$/, ''))
                // gzip
                return '<script type="module">'
                    + template.replace('{<script>}', gzipToBase64(newJSCode.join(';')))
                    + '</script>'
            }
        )
        if (!ok) continue

        if (htmlMinifierOptions)
            newHtml = await htmlMinify(newHtml, htmlMinifierOptions)

        // finish
        htmlChunk.source = newHtml
        console.log(
            "\n"
            + "  " + pc.underline(pc.cyan(distURL) + pc.greenBright(htmlFileName)) + '\n'
            + "  " + pc.gray(KiB(oldSize) + " -> ") + pc.cyanBright(KiB(newHtml.length)) + '\n'
        )

        // delete assets
        for (const name of thisDel) {
            globalDel.add(name)
        }
    }

    // delete inlined assets
    for (const name of globalDel) {
        if (!globalDoNotDel.has(name))
            delete bundle[name]
    }
    console.log(pc.green('Finish.\n'))
}
