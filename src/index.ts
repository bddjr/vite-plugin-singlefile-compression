import { UserConfig, PluginOption, ResolvedConfig } from "vite"
import { OutputChunk, OutputAsset, OutputBundle } from "rollup"
import pc from "picocolors"
import { minify as htmlMinify } from 'html-minifier-terser'
import { JSDOM } from 'jsdom'

import path from 'path'
import fs from 'fs'
import { pathToFileURL } from "url"

import { version } from './getVersion.js'
import { template } from './getTemplate.js'
import { bufferToDataURL } from "./dataurl.js"
import { kB } from "./kB.js"
import { getInnerOptions, Options, innerOptions } from "./options.js"
import { cutPrefix } from "./cutPrefix.js"

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
    config.base ??= './'

    config.build ??= {}
    config.build.cssCodeSplit ??= false

    config.build.assetsInlineLimit ??= () => true
    config.build.chunkSizeWarningLimit ??= Number.MAX_SAFE_INTEGER
    config.build.modulePreload ??= { polyfill: false }
    config.build.reportCompressedSize ??= false

    config.build.rollupOptions ??= {}
    for (const output of [config.build.rollupOptions.output ??= {}].flat(1)) {
        output.inlineDynamicImports ??= true
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

    const
        distURL = pathToFileURL(config.build.outDir).href + '/',
        /** "assets/" */
        assetsDir = path.posix.join(config.build.assetsDir, '/'),
        /** "./assets/" */
        assetsDirWithBase = config.base + assetsDir,
        /** '[href^="./assets/"]' */
        assetsHrefSelector = `[href^="${assetsDirWithBase}"]`,
        /** '[src^="./assets/"]' */
        assetsSrcSelector = `[src^="${assetsDirWithBase}"]`,

        fakeScript = `_vitePluginSinglefileCompression(${Date.now()})`,

        globalDelete = new Set<string>(),
        globalDoNotDelete = new Set<string>(),
        globalRemoveDistFileNames = new Set<string>(),

        globalAssetsDataURL = {} as { [key: string]: string },
        globalPublicFilesCache = {} as {
            [key: string]: {
                dataURL: string,
                size: number,
            }
        },

        /** format: ["assets/index-XXXXXXXX.js"] */
        bundleAssetsNames = [] as string[],
        /** format: ["index.html"] */
        bundleHTMLNames = [] as string[]

    for (const name of Object.keys(bundle)) {
        if (name.startsWith(assetsDir))
            bundleAssetsNames.push(name)
        else if (name.endsWith('.html'))
            bundleHTMLNames.push(name)
    }

    for (const htmlFileName of bundleHTMLNames) {
        console.log("\n  " + pc.underline(pc.cyan(distURL) + pc.greenBright(bundle[htmlFileName].fileName)))

        // init
        const htmlChunk = bundle[htmlFileName] as OutputAsset,
            oldHTML = htmlChunk.source as string,
            dom = new JSDOM(oldHTML),
            document = dom.window.document,
            thisDel = new Set<string>(),
            newJSCode = [] as string[],
            scriptElement = document.querySelector(`script[type=module]${assetsSrcSelector}`) as HTMLScriptElement | null,
            scriptName = scriptElement ? cutPrefix(scriptElement.src, config.base) : ''

        let oldSize = oldHTML.length

        // fill fake script
        if (scriptElement) {
            scriptElement.remove()
            scriptElement.removeAttribute('src')
            scriptElement.innerHTML = fakeScript
            document.body.appendChild(scriptElement)
        } else {
            document.body.insertAdjacentHTML('beforeend', `<script type="module">${fakeScript}</script>`)
        }

        // get css tag
        let allCSS = ''
        for (const element of document.querySelectorAll<HTMLLinkElement>(`link[rel=stylesheet]${assetsHrefSelector}`)) {
            const name = cutPrefix(element.href, config.base)
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
                allCSS += cssSource.replace(/\n$/, '')
            }
            // remove tag
            element.remove()
        }
        newJSCode.push(template.css(allCSS))

        // inline html assets
        const assetsDataURL = {} as { [key: string]: string }
        if (options.tryInlineHtmlAssets) {
            for (const element of (document.querySelectorAll(assetsSrcSelector) as NodeListOf<HTMLImageElement>)) {
                const name = cutPrefix(element.src, assetsDirWithBase)
                if (name.endsWith('.js'))
                    continue
                if (!Object.prototype.hasOwnProperty.call(assetsDataURL, name)) {
                    const bundleName = assetsDir + name
                    const a = bundle[bundleName] as OutputAsset
                    if (!a)
                        continue
                    thisDel.add(bundleName)
                    oldSize += a.source.length
                    if (!Object.prototype.hasOwnProperty.call(globalAssetsDataURL, name))
                        globalAssetsDataURL[name] = bufferToDataURL(name, Buffer.from(
                            //@ts-ignore
                            a.source
                        ))
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
            const element = document.querySelector(`link[rel=icon][href^="${config.base}"], link[rel="shortcut icon"][href^="${config.base}"]`) as HTMLLinkElement
            if (element) {
                iconName = cutPrefix(element.href, config.base)
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
                    if (!Object.prototype.hasOwnProperty.call(globalPublicFilesCache, iconName)) {
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
                    newJSCode.push(template.icon(dataURL))
                    if (!element) {
                        // add link icon tag
                        document.head.insertAdjacentHTML('beforeend', '<link rel="icon" href="data:">')
                    }
                } catch (e) {
                    if (element) console.error(e)
                }
            }
        }

        // generate html
        htmlChunk.source = dom.serialize()

        // minify html
        if (options.htmlMinifierTerser)
            htmlChunk.source = await htmlMinify(htmlChunk.source, options.htmlMinifierTerser)

        // fill script
        function inlineHtmlAssets() {
            if (options.tryInlineHtmlAssets) {
                // add script for load html assets
                const assetsJSON = JSON.stringify(assetsDataURL)
                if (assetsJSON !== '{}')
                    newJSCode.push(template.assets(assetsJSON))
            }
        }
        if (scriptElement) {
            thisDel.add(scriptName)
            let { code } = bundle[scriptName] as OutputChunk
            oldSize += code.length
            code = code.replace(/;?\n?$/, '')
            // do not delete not inlined asset
            for (const name of bundleAssetsNames) {
                const assetName = name.slice(assetsDir.length)
                if (code.includes(assetName)) {
                    globalDoNotDelete.add(name)
                    delete assetsDataURL[assetName]
                }
            }
            inlineHtmlAssets()

            if (options.useImportMetaPolyfill)
                newJSCode.push(template.importmeta(scriptName))

            // 此 polyfill 仅在以下选项的值为 true 时需要。
            // config.build.rollupOptions.output.inlineDynamicImports
            if (code.includes("__VITE_PRELOAD__"))
                newJSCode.push("var __VITE_PRELOAD__")

            newJSCode.push(code)
        } else {
            inlineHtmlAssets()
        }

        htmlChunk.source = htmlChunk.source.split(fakeScript, 2).join(
            template.base(newJSCode.join(';'), options.compressFormat, options.useBase128, options.compressor)
        )

        // log
        console.log("  " + pc.gray(kB(oldSize) + " -> ") + pc.cyanBright(kB(htmlChunk.source.length)) + '\n')

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

    console.log(pc.green('Finish.') + pc.reset('\n'))
}
