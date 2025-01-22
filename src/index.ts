import { UserConfig, PluginOption, ResolvedConfig } from "vite"
import { OutputChunk, OutputAsset, OutputBundle, OutputOptions } from "rollup"
import pc from "picocolors"
import { minify as htmlMinify } from 'html-minifier-terser'

import path from 'path'
import fs from 'fs'
import { pathToFileURL } from "url"

import { version } from './getVersion.js'
import { template } from './getTemplate.js'
import { compress } from "./compress.js"
import { bufferToDataURL } from "./dataurl.js"
import { KiB } from "./KiB.js"
import { getInnerOptions, Options, innerOptions } from "./options.js"

export function singleFileCompression(opt?: Options): PluginOption {
    let conf: ResolvedConfig
    return {
        name: "singleFileCompression",
        enforce: "post",
        config: setConfig,
        configResolved(c) { conf = c },
        generateBundle: (_, bundle) => generateBundle(bundle, conf, getInnerOptions(opt)),
    }
}

export default singleFileCompression

function setConfig(config: UserConfig) {
    config.base = './'

    config.build ??= {}
    config.build.assetsDir = 'assets'
    config.build.cssCodeSplit = false

    config.build.assetsInlineLimit ??= () => true
    config.build.chunkSizeWarningLimit ??= Infinity
    config.build.modulePreload ??= { polyfill: false }
    config.build.target ??= 'esnext'
    config.build.reportCompressedSize ??= false

    config.build.rollupOptions ??= {}
    config.build.rollupOptions.output ??= {}

    function setRollupOutput(output: OutputOptions) {
        output.inlineDynamicImports = true
        delete output.assetFileNames
        delete output.chunkFileNames
        delete output.entryFileNames
    }

    if (Array.isArray(config.build.rollupOptions.output)) {
        for (const output of config.build.rollupOptions.output) {
            setRollupOutput(output)
        }
    } else {
        setRollupOutput(config.build.rollupOptions.output)
    }
}

async function generateBundle(bundle: OutputBundle, config: ResolvedConfig, options: innerOptions) {
    console.log(pc.reset('\n\n') + pc.cyan('vite-plugin-singlefile-compression ' + version) + pc.green(' building...'))

    // rename
    if (options.rename
        && options.rename !== "index.html"
        && ("index.html" in bundle)
        && !(options.rename in bundle)
    ) {
        bundle[options.rename] = bundle["index.html"]
        bundle[options.rename].fileName = options.rename
        delete bundle["index.html"]
    }

    const distURL = pathToFileURL(config.build.outDir).href + '/'

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
                newJSCode.push(`import.meta.url=new URL(${JSON.stringify(name)},location).href`)
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
                        newJSCode.push(template.assets(assetsJSON))
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
        const compressedScript = compress(options.compressFormat, newJSCode.join(';'), options.useBase128)
        newHtml = newHtml.split('self.__vitePluginSinglefileCompression=1', 2).join(
            template.base(compressedScript, options.compressFormat, options.useBase128)
        )

        // finish
        htmlChunk.source = newHtml
        console.log(
            "\n"
            + "  " + pc.underline(pc.cyan(distURL) + pc.greenBright(bundle[htmlFileName].fileName)) + '\n'
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
