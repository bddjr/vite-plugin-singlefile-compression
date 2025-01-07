import { UserConfig, PluginOption, ResolvedBuildOptions, ResolvedConfig } from "vite"
import { OutputChunk, OutputAsset, OutputBundle } from "rollup"
import mime from 'mime'
import pc from "picocolors"
import svgToTinyDataUri from "mini-svg-data-uri"
import { minify as htmlMinify, Options as htmlMinifierOptions } from 'html-minifier-terser'
import base128 from "base128-ascii"

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
     * @default true
     */
    useBase128?: boolean
}

interface innerOptions {
    htmlMinifierTerser: htmlMinifierOptions | false
    tryInlineHtmlAssets: boolean
    removeInlinedAssetFiles: boolean
    tryInlineHtmlPublicIcon: boolean
    removeInlinedPublicIconFiles: boolean
    useBase128: boolean
}

export const defaultHtmlMinifierTerserOptions: htmlMinifierOptions = {
    removeAttributeQuotes: true,
    removeComments: true,
    collapseWhitespace: true,
    removeOptionalTags: true,
    removeRedundantAttributes: true,
    minifyJS: false,
}

export function singleFileCompression(opt?: Options): PluginOption {
    opt ||= {}

    const innerOpt: innerOptions = {
        htmlMinifierTerser:
            opt.htmlMinifierTerser == null || opt.htmlMinifierTerser === true
                ? defaultHtmlMinifierTerserOptions
                : opt.htmlMinifierTerser,

        tryInlineHtmlAssets:
            opt.tryInlineHtmlAssets == null
                ? true
                : opt.tryInlineHtmlAssets,

        removeInlinedAssetFiles:
            opt.removeInlinedAssetFiles == null
                ? true
                : opt.removeInlinedAssetFiles,

        tryInlineHtmlPublicIcon:
            opt.tryInlineHtmlPublicIcon == null
                ? true
                : opt.tryInlineHtmlPublicIcon,

        removeInlinedPublicIconFiles:
            opt.removeInlinedPublicIconFiles == null
                ? true
                : opt.removeInlinedPublicIconFiles,

        useBase128:
            opt.useBase128 == null
                ? true
                : opt.useBase128,
    }

    let conf: ResolvedConfig

    return {
        name: "singleFileCompression",
        enforce: "post",
        config: setConfig,
        configResolved(c) { conf = c },
        generateBundle: (_, bundle) => generateBundle(bundle, conf, innerOpt),
    }
}

export default singleFileCompression

const template = fs.readFileSync(
    path.join(import.meta.dirname, "template.js")
).toString().split('{<script>}', 2)

const templateBase128 = fs.readFileSync(
    path.join(import.meta.dirname, "template-base128.js")
).toString().split('"<script>"', 2)

const templateAssets = fs.readFileSync(
    path.join(import.meta.dirname, "template-assets.js")
).toString().split('{"":""}', 2)

const { version } = JSON.parse(
    fs.readFileSync(
        path.join(import.meta.dirname, "../package.json")
    ).toString()
) as { version: string }

function bufferToDataURL(name: string, b: Buffer) {
    return name.endsWith('.svg')
        ? svgToTinyDataUri(b.toString())
        : `data:${mime.getType(name)};base64,${b.toString('base64')}`
}

function gzipToBase64(buf: zlib.InputType) {
    return zlib.gzipSync(buf, {
        level: zlib.constants.Z_BEST_COMPRESSION,
    }).toString('base64')
}

function gzipToBase128(buf: zlib.InputType) {
    return base128.encodeToTemplateLiterals(Uint8Array.from(zlib.gzipSync(buf, {
        level: zlib.constants.Z_BEST_COMPRESSION,
    })))
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

async function generateBundle(bundle: OutputBundle, config: ResolvedConfig, options: innerOptions) {
    console.log(pc.cyan('\n\nvite-plugin-singlefile-compression ' + version) + pc.green(' building...'))

    if (config.base !== './')
        return console.error("error: config.base has been changed!")
    if (config.build.assetsDir !== 'assets')
        return console.error("error: config.build.assetsDir has been changed!")

    const distURL = (u =>
        u.endsWith('/') ? u : u + '/'
    )(pathToFileURL(path.resolve(config.build.outDir)).href)

    const globalDelete = new Set<string>()
    const globalDoNotDelete = new Set<string>()
    const globalRemoveDistFileNames = new Set<string>()

    const globalAssetsDataURL = {} as { [key: string]: string }
    const globalPublicFilesCache = {} as {
        [key: string]: {
            dataURL: string,
            size: number,
        }
    }

    /** fotmat: ["assets/index-XXXXXXXX.js"] */
    const bundleAssetsNames = [] as string[]
    /** format: ["index.html"] */
    const bundleHTMLNames = [] as string[]

    for (const name of Object.keys(bundle)) {
        if (name.startsWith('assets/'))
            bundleAssetsNames.push(name)
        else if (name.endsWith('.html'))
            bundleHTMLNames.push(name)
    }

    for (const htmlFileName of bundleHTMLNames) {
        // init
        const htmlChunk = bundle[htmlFileName] as OutputAsset
        let newHtml = htmlChunk.source as string
        let oldSize = newHtml.length

        const thisDel = new Set<string>()

        // Fix async import
        const newJSCode = ["self.__VITE_PRELOAD__=void 0"]
        newJSCode.toString = () => newJSCode.join(';')

        // remove html comments
        newHtml = newHtml.replaceAll(/<!--[\d\D]*?-->/g, '')

        // get css tag
        newHtml = newHtml.replace(/\s*<link rel="stylesheet"[^>]* href="\.\/(assets\/[^"]+)"[^>]*>/,
            (match, name: string) => {
                thisDel.add(name)
                const css = bundle[name] as OutputAsset
                const cssSource = css.source as string
                if (cssSource) {
                    oldSize += cssSource.length
                    // do not delete not inlined asset
                    for (const name of bundleAssetsNames) {
                        if (cssSource.includes(name.slice('assets/'.length)))
                            globalDoNotDelete.add(name)
                    }
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

        // inline html assets
        const assetsDataURL = {} as { [key: string]: string }
        if (options.tryInlineHtmlAssets) {
            newHtml = newHtml.replaceAll(/(?:[\s"])(?:src|href)="\.\/assets\/([^"]+)"/g,
                (match, name: string) => {
                    if (name.endsWith('.js'))
                        return match
                    if (!Object.hasOwn(assetsDataURL, name)) {
                        const bundleName = "assets/" + name
                        const a = bundle[bundleName] as OutputAsset
                        if (!a)
                            return match
                        thisDel.add(bundleName)
                        oldSize += a.source.length
                        if (!Object.hasOwn(globalAssetsDataURL, name))
                            globalAssetsDataURL[name] = bufferToDataURL(name, Buffer.from(a.source))
                        assetsDataURL[name] = globalAssetsDataURL[name]
                    }
                    return `="data:${name}"`
                }
            )
        }

        // inline html icon
        if (options.tryInlineHtmlPublicIcon) {
            let needInline = true
            let hasTag = false
            let iconName = 'favicon.ico'
            // replace tag
            newHtml = newHtml.replace(/<link\s([^>]*\s)?rel="(?:shortcut )?icon"([^>]*\s)?href="\.\/([^"]+)"([^>]*)>/,
                (match, p1, p2, name: string, after: string) => {
                    hasTag = true
                    iconName = name
                    if (bundleAssetsNames.includes(name)) {
                        needInline = false
                        return match
                    }
                    p1 ||= ''
                    p2 ||= ''
                    return `<link ${p1}rel="icon"${p2}href="data:"${after}>`
                }
            )
            if (needInline) {
                // inline
                try {
                    if (!Object.hasOwn(globalPublicFilesCache, iconName)) {
                        // dist/favicon.ico
                        let Path = path.join(config.build.outDir, iconName)
                        if (fs.existsSync(Path)) {
                            globalRemoveDistFileNames.add(iconName)
                        } else {
                            // public/favicon.ico
                            Path = path.join(config.publicDir, iconName)
                        }
                        // read
                        const b = fs.readFileSync(Path)
                        globalPublicFilesCache[iconName] = {
                            dataURL: bufferToDataURL(iconName, b),
                            size: b.length
                        }
                    }
                    const { dataURL, size } = globalPublicFilesCache[iconName]
                    oldSize += size
                    newJSCode.push('document.querySelector("link[rel=icon]").href=' + JSON.stringify(dataURL))
                    if (!hasTag) {
                        // add link icon tag
                        const l = '<link rel="icon" href="data:">'
                        oldSize += l.length
                        newHtml = newHtml.replace(/(?=<script )/, l)
                    }
                } catch (e) {
                    if (hasTag) console.error(e)
                }
            }
        }

        // script
        let ok = false
        newHtml = newHtml.replace(/<script type="module"[^>]* src="\.\/(assets\/[^"]+)"[^>]*><\/script>/,
            (match, name: string) => {
                ok = true
                thisDel.add(name)
                const js = bundle[name] as OutputChunk
                oldSize += js.code.length
                // fix new URL
                newJSCode.push(`import.meta.url=location.origin+location.pathname.replace(/[^/]*$/,${JSON.stringify(name)})`)
                // do not delete not inlined asset
                for (const name of bundleAssetsNames) {
                    const assetName = name.slice('assets/'.length)
                    if (js.code.includes(assetName)) {
                        globalDoNotDelete.add(name)
                        delete assetsDataURL[assetName]
                    }
                }
                if (options.tryInlineHtmlAssets) {
                    // add script for load html assets
                    const assetsJSON = JSON.stringify(assetsDataURL)
                    if (assetsJSON != '{}')
                        newJSCode.push(templateAssets.join(assetsJSON))
                }
                // add script
                newJSCode.push(js.code.replace(/;?\n?$/, ''))
                // fill fake script
                return '<script type="module">self.__vitePluginSinglefileCompression=1</script>'
            }
        )
        if (!ok) continue

        // minify html
        if (options.htmlMinifierTerser)
            newHtml = await htmlMinify(newHtml, options.htmlMinifierTerser)

        // fill script
        newHtml = newHtml.split('self.__vitePluginSinglefileCompression=1', 2).join(
            options.useBase128
                ? templateBase128.join(gzipToBase128(newJSCode.toString()))
                : template.join(gzipToBase64(newJSCode.toString()))
        )

        // finish
        htmlChunk.source = newHtml
        console.log(
            "\n"
            + "  " + pc.underline(pc.cyan(distURL) + pc.greenBright(htmlFileName)) + '\n'
            + "  " + pc.gray(KiB(oldSize) + " -> ") + pc.cyanBright(KiB(newHtml.length)) + '\n'
        )

        // delete assets
        for (const name of thisDel) {
            globalDelete.add(name)
        }
    }

    if (options.removeInlinedAssetFiles) {
        // delete inlined assets
        for (const name of globalDelete) {
            // do not delete not inlined asset
            if (!globalDoNotDelete.has(name))
                delete bundle[name]
        }
    }
    if (options.removeInlinedPublicIconFiles) {
        // delete inlined public files
        for (const name of globalRemoveDistFileNames) {
            try {
                fs.unlinkSync(path.join(config.build.outDir, name))
            } catch (e) {
                console.error(e)
            }
        }
    }
    console.log(pc.green('Finish.\n'))
}
