import { UserConfig, PluginOption, ResolvedConfig } from "vite"
import { OutputChunk, OutputAsset, OutputBundle, OutputOptions } from "rollup"
import pc from "picocolors"
import { minify as htmlMinify } from 'html-minifier-terser'
import { JSDOM } from 'jsdom'

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
    // config.build.assetsDir = 'assets'
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
        // delete output.assetFileNames
        // delete output.chunkFileNames
        // delete output.entryFileNames
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
    /** "assets/" */
    const assetsDir = path.posix.join(config.build.assetsDir, '/')
    /** '[href^="./assets/"]' */
    const assetsHrefSelector = `[href^="./${assetsDir}"]`
    /** '[src^="./assets/"]' */
    const assetsSrcSelector = `[src^="./${assetsDir}"]`

    const fakeScript = `_vitePluginSinglefileCompression(${Date.now()})`

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
        if (name.startsWith(assetsDir))
            bundleAssetsNames.push(name)
        else if (name.endsWith('.html'))
            bundleHTMLNames.push(name)
    }

    for (const htmlFileName of bundleHTMLNames) {
        // init
        const htmlChunk = bundle[htmlFileName] as OutputAsset
        const oldHTML = htmlChunk.source as string
        let oldSize = oldHTML.length
        const dom = new JSDOM(oldHTML)
        const document = dom.window.document

        const scriptElement = document.querySelector(`script[type=module]${assetsSrcSelector}`) as HTMLScriptElement
        if (!scriptElement) {
            console.error(`Error: Can not find script tag from ${htmlFileName}`)
            continue
        }

        const thisDel = new Set<string>()

        // Fix async import
        const newJSCode = ["self.__VITE_PRELOAD__=void 0"]

        // get css tag
        {
            const element = document.querySelector(`link[rel=stylesheet]${assetsHrefSelector}`) as HTMLLinkElement
            if (element) {
                const name = element.href.slice("./".length)
                thisDel.add(name)
                const css = bundle[name] as OutputAsset
                const cssSource = css.source as string
                if (cssSource) {
                    oldSize += cssSource.length
                    // do not delete not inlined asset
                    for (const name of bundleAssetsNames) {
                        if (cssSource.includes(name.slice(assetsDir.length)))
                            globalDoNotDelete.add(name)
                    }
                    // add script for load css
                    newJSCode.push(
                        // 'document.querySelector("script[type=module]").insertAdjacentElement("afterend",document.createElement("style")).innerHTML='
                        'document.head.appendChild(document.createElement("style")).innerHTML='
                        + JSON.stringify(cssSource.replace(/\n$/, ''))
                    )
                }
                // delete tag
                element.remove()
            }
        }

        // inline html assets
        const assetsDataURL = {} as { [key: string]: string }
        if (options.tryInlineHtmlAssets) {
            for (const element of (document.querySelectorAll(assetsSrcSelector) as NodeListOf<HTMLImageElement>)) {
                const name = element.src.slice(`./${assetsDir}`.length)
                if (name.endsWith('.js'))
                    continue
                if (!Object.hasOwn(assetsDataURL, name)) {
                    const bundleName = assetsDir + name
                    const a = bundle[bundleName] as OutputAsset
                    if (!a)
                        continue
                    thisDel.add(bundleName)
                    oldSize += a.source.length
                    if (!Object.hasOwn(globalAssetsDataURL, name))
                        globalAssetsDataURL[name] = bufferToDataURL(name, Buffer.from(a.source as Uint8Array<ArrayBufferLike>))
                    assetsDataURL[name] = globalAssetsDataURL[name]
                }
                element.src = `data:${name}`
            }
        }

        // inline html icon
        if (options.tryInlineHtmlPublicIcon) {
            let needInline = true
            let iconName = 'favicon.ico'
            // replace tag
            const element = document.querySelector('link[rel=icon][href^="./"], link[rel="shortcut icon"][href^="./"]') as HTMLLinkElement
            if (element) {
                iconName = element.href.slice("./".length)
                if (bundleAssetsNames.includes(iconName)) {
                    needInline = false
                } else {
                    element.rel = 'icon'
                    element.href = 'data:'
                }
            }
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
                    if (!element) {
                        // add link icon tag
                        document.head.insertAdjacentHTML('beforeend', '<link rel="icon" href="data:">')
                    }
                } catch (e) {
                    if (element) console.error(e)
                }
            }
        }

        // script
        {
            const name = scriptElement.src.slice("./".length)
            thisDel.add(name)
            const js = bundle[name] as OutputChunk
            oldSize += js.code.length

            // fix new URL
            newJSCode.push(`import.meta.url=new URL(${JSON.stringify(name)},location).href`)
            // fix import.meta.resolve
            newJSCode.push(template.resolve)

            // do not delete not inlined asset
            for (const name of bundleAssetsNames) {
                const assetName = name.slice(assetsDir.length)
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
        }

        // fill fake script
        scriptElement.removeAttribute('src')
        scriptElement.removeAttribute('crossorigin')
        scriptElement.innerHTML = fakeScript

        // generate html
        htmlChunk.source = dom.serialize()

        // minify html
        if (options.htmlMinifierTerser)
            htmlChunk.source = await htmlMinify(htmlChunk.source, options.htmlMinifierTerser)

        // fill script
        htmlChunk.source = htmlChunk.source.split(fakeScript, 2).join(
            template.base(
                compress(options.compressFormat, newJSCode.join(';'), options.useBase128),
                options.compressFormat,
                options.useBase128
            )
        )

        // log
        console.log(
            "\n"
            + "  " + pc.underline(pc.cyan(distURL) + pc.greenBright(bundle[htmlFileName].fileName)) + '\n'
            + "  " + pc.gray(KiB(oldSize) + " -> ") + pc.cyanBright(KiB(htmlChunk.source.length)) + '\n'
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
