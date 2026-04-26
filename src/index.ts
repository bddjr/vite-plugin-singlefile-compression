import type { UserConfig, PluginOption, ResolvedConfig, ConfigPluginContext, ConfigEnv } from "vite"
import type { OutputBundle, OutputChunk, OutputAsset, PluginContext } from 'rolldown'
import pc from "picocolors"
import { minify as htmlMinify } from 'html-minifier-terser'
import { JSDOM } from 'jsdom'

import path from 'path'
import fs from 'fs'
import { pathToFileURL } from "url"

import { version } from '../package.json' with { type: "json" }

import type { RollupOptions } from "@bddjr/types-rollupoptions-4.43.0"
import { template } from './getTemplate.js'
import { bufferToDataURL } from "./dataurl.js"
import { kB } from "./kB.js"
import { getInnerOptions, type Options, type InnerOptions as InnerOptions, type HtmlMinifierOptions, defaultHtmlMinifierTerserOptions } from "./options.js"
import { cutPrefix } from "./cutPrefix.js"
import { type CompressFormat, type CompressFormatAlias, type Compressor } from "./compress.js"

export function singleFileCompression(opt?: Options): PluginOption {
    let conf: ResolvedConfig
    const innerOptions = getInnerOptions(opt)
    return {
        name: "vite-plugin-singlefile-compression",
        enforce: "post",
        config(...args) {
            return setConfig.call(this, innerOptions, ...args)
        },
        configResolved(c) {
            conf = c
        },
        generateBundle(outputOptions, bundle, isWrite) {
            return generateBundle.call(this, bundle, conf, innerOptions)
        },
    }
}

export default singleFileCompression

export {
    Options,
    HtmlMinifierOptions,
    CompressFormat,
    CompressFormatAlias,
    Compressor,
    defaultHtmlMinifierTerserOptions,
}

function setConfig(this: ConfigPluginContext, opt: InnerOptions, config: UserConfig, env: ConfigEnv) {
    config.base ??= './'

    const build = (config.build ??= {})

    build.cssCodeSplit ??= false
    build.assetsInlineLimit ??= () => true
    build.modulePreload ?? build.polyfillModulePreload ?? (build.modulePreload = { polyfill: false })

    if (this.meta.rolldownVersion) {
        // Vite 8
        const rolldownOptions = build.rolldownOptions ?? build.rollupOptions ?? (build.rolldownOptions = {})

        for (const output of [rolldownOptions.output ??= {}].flat(1)) {
            output.codeSplitting ?? output.inlineDynamicImports ?? (output.codeSplitting = false)
        }
    } else {
        // Vite oldest
        const rollupOptions = (build.rollupOptions ??= {}) as RollupOptions

        for (const output of [rollupOptions.output ??= {}].flat(1)) {
            output.inlineDynamicImports ??= true
        }
    }
}

async function generateBundle(this: PluginContext, bundle: OutputBundle, config: ResolvedConfig, options: InnerOptions) {
    console.log(
        pc.reset('\n\n') +
        pc.cyan('vite-plugin-singlefile-compression ' + version) +
        ' ' +
        (options.enableCompress
            ? pc.green(options.compressFormat + ' ' + (
                options.useBase128
                    ? 'base128-ascii'
                    : 'base64'
            ))
            : pc.red('disable-compress')
        )
    )

    // rename
    if (options.rename
        && options.rename != "index.html"
        && Object.prototype.hasOwnProperty.call(bundle, "index.html")
        && !Object.prototype.hasOwnProperty.call(bundle, options.rename)
    ) {
        bundle[options.rename] = bundle["index.html"]
        bundle[options.rename].fileName = options.rename
        delete bundle["index.html"]
    }

    const distURL = pathToFileURL(config.build.outDir).href + '/'
        /** "assets/" */
        , assetsDir = path.posix.join(config.build.assetsDir, '/')
        /** "./assets/" */
        , assetsDirWithBase = config.base + assetsDir
        /** '[href^="./assets/"]' */
        , assetsHrefSelector = `[href^="${assetsDirWithBase}"]`
        /** '[src^="./assets/"]' */
        , assetsSrcSelector = `[src^="${assetsDirWithBase}"]`

        , fakeScript = `_vitePluginSinglefileCompression(${Date.now()})`

        , globalDelete = new Set<string>()
        , globalDoNotDelete = new Set<string>()
        , globalRemoveDistFileNames = new Set<string>()

        , globalAssetsDataURL = {} as { [key: string]: string }
        , globalPublicFilesCache = {} as {
            [key: string]: {
                buffer: Buffer,
                dataURL: string,
                size: number,
            }
        }
        /** format: ["assets/index-XXXXXXXX.js"] */
        , bundleAssetsNames = [] as string[]
        /** format: ["index.html"] */
        , bundleHTMLNames = [] as string[]

    for (const name in bundle) {
        if (name.startsWith(assetsDir))
            bundleAssetsNames.push(name)
        else if (/\.html$/i.test(name))
            bundleHTMLNames.push(name)
    }

    for (const htmlFileName of bundleHTMLNames) {
        console.log("\n  " + pc.underline(pc.cyan(distURL) + pc.greenBright(bundle[htmlFileName].fileName)))

        // init
        const htmlChunk = bundle[htmlFileName] as OutputAsset
            , oldHTML = htmlChunk.source as string
            , dom = new JSDOM(oldHTML)
            , document = dom.window.document
            , thisDel = new Set<string>()
            , newJSCode: string[] = []
            , scriptElement = document.querySelector<HTMLScriptElement>(`script[type=module]${assetsSrcSelector}`)
            , scriptName = scriptElement ? cutPrefix(scriptElement.src, config.base) : ''
            , compressHeadElements: HTMLElement[] = []

        let oldSize = Buffer.byteLength(oldHTML)

        // fill fake script
        if (scriptElement) {
            scriptElement.remove()
            scriptElement.removeAttribute('src')
            scriptElement.removeAttribute('crossorigin')
            scriptElement.innerHTML = fakeScript
            document.body.appendChild(scriptElement)
        } else {
            document.body.insertAdjacentHTML('beforeend', `<script type="module">${fakeScript}</script>`)
        }

        // get css tag
        let allCSS = ''
        const linkStylesheet = document.querySelectorAll<HTMLLinkElement>(`link[rel=stylesheet]${assetsHrefSelector}`)
        for (const element of linkStylesheet) {
            const name = cutPrefix(element.href, config.base)
            thisDel.add(name)
            const css = bundle[name] as OutputAsset
            const cssSource = css.source as string
            if (cssSource) {
                oldSize += Buffer.byteLength(cssSource)
                // do not delete not inlined asset
                for (const name of bundleAssetsNames) {
                    if (cssSource.includes(name.slice(assetsDir.length)))
                        globalDoNotDelete.add(name)
                }
                // add script for load css
                allCSS += cssSource.replace(/\s*(\/\*[^*]*\*\/)?\s*$/, '')
            }
            // remove tag
            if (options.enableCompress)
                element.remove()
        }
        if (allCSS) {
            const e = document.createElement('style')
            e.innerHTML = allCSS
            if (options.enableCompress) {
                compressHeadElements.push(e)
            } else {
                linkStylesheet[0].before(e)
                for (const e of linkStylesheet) {
                    e.remove()
                }
            }
        }

        // inline html assets
        const assetsDataURL = {} as { [key: string]: string }
        if (options.tryInlineHtmlAssets) {
            for (const element of document.querySelectorAll<HTMLImageElement>(assetsSrcSelector)) {
                const name = cutPrefix(element.src, assetsDirWithBase)
                if (/\.js$/i.test(name))
                    continue
                if (!options.enableCompress || !Object.prototype.hasOwnProperty.call(assetsDataURL, name)) {
                    const bundleName = assetsDir + name
                    const a = bundle[bundleName] as OutputAsset
                    if (!a)
                        continue
                    thisDel.add(bundleName)
                    let dataURL: string
                    if (Object.prototype.hasOwnProperty.call(globalAssetsDataURL, name)) {
                        oldSize += Buffer.byteLength(a.source)
                        dataURL = globalAssetsDataURL[name]
                    } else {
                        const buf = Buffer.from(a.source)
                        oldSize += buf.length
                        globalAssetsDataURL[name] = dataURL = bufferToDataURL(name, buf)
                    }
                    if (options.enableCompress) {
                        assetsDataURL[name] = dataURL
                    } else {
                        element.src = dataURL
                    }
                }
                if (options.enableCompress) {
                    element.src = `data:${name}`
                }
            }
        }

        // inline html favicon
        const createIconElement = (href?: string | null) => {
            const e = document.createElement('link')
            e.rel = 'icon'
            if (href != null) e.href = href
            return e
        }

        const getPublicIcon = (faviconName: string) => {
            if (!Object.prototype.hasOwnProperty.call(globalPublicFilesCache, faviconName)) {
                // dist/favicon.ico
                let _path = path.join(config.build.outDir, faviconName)
                if (fs.existsSync(_path)) {
                    globalRemoveDistFileNames.add(faviconName)
                } else {
                    // public/favicon.ico
                    _path = path.join(config.publicDir, faviconName)
                    if (!fs.existsSync(_path)) return null
                }
                // read
                const b = fs.readFileSync(_path)
                globalPublicFilesCache[faviconName] = {
                    buffer: b,
                    dataURL: bufferToDataURL(faviconName, b),
                    size: b.length
                }
            }
            return globalPublicFilesCache[faviconName]
        }

        const linkFaviconAll = document.querySelectorAll<HTMLLinkElement>(`link[rel=icon][href]:not([href=""]),link[rel="shortcut icon"][href]:not([href=""])`)

        if (linkFaviconAll.length == 0) {
            if (options.tryInlineHtmlPublicIcon) {
                const fileCache = getPublicIcon('favicon.ico')
                if (fileCache) {
                    oldSize += fileCache.size
                    const e = createIconElement(fileCache.dataURL)
                    if (options.enableCompressInlinedIcon) {
                        compressHeadElements.push(e)
                    } else {
                        document.head.appendChild(e)
                    }
                }
            }
        } else for (const linkFavicon of linkFaviconAll) {
            let faviconName = linkFavicon.href
            const faviconIsDataURL = /^data:/i.test(faviconName)
            if (!faviconIsDataURL)
                faviconName = cutPrefix(faviconName, config.base)

            const setFaviconDataURL = (dataURL: string) => {
                if (options.enableCompressInlinedIcon) {
                    if (linkFavicon) {
                        linkFavicon.remove()
                        linkFavicon.href = dataURL
                        compressHeadElements.push(linkFavicon)
                    } else {
                        compressHeadElements.push(createIconElement(dataURL))
                    }
                } else {
                    if (linkFavicon) {
                        linkFavicon.href = dataURL
                    } else {
                        document.head.appendChild(createIconElement(dataURL))
                    }
                }
            }

            if (faviconIsDataURL) {
                if (options.enableCompressInlinedIcon) {
                    linkFavicon.remove()
                    compressHeadElements.push(linkFavicon)
                }
            } else if (bundleAssetsNames.includes(faviconName)) {
                const asset = bundle[faviconName] as OutputAsset
                if (asset) {
                    setFaviconDataURL(bufferToDataURL(faviconName, Buffer.from(asset.source)))
                    thisDel.add(faviconName)
                }
            } else if (options.tryInlineHtmlPublicIcon) {
                const fileCache = getPublicIcon(faviconName)
                if (fileCache) {
                    oldSize += fileCache.size
                    setFaviconDataURL(fileCache.dataURL)
                }
            }
        }

        // compressHeadElements
        if (compressHeadElements.length) {
            const html = compressHeadElements.map(v => v.outerHTML).join('')
            newJSCode.push(`document.head.insertAdjacentHTML("beforeend",${JSON.stringify(html)})`)
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
            oldSize += Buffer.byteLength(code)
            code = code.replace(/;?\s*$/, '')
            // do not delete not inlined asset
            for (const name of bundleAssetsNames) {
                const assetName = name.slice(assetsDir.length)
                if (code.includes(assetName)) {
                    globalDoNotDelete.add(name)
                    // delete assetsDataURL[assetName]
                }
            }
            inlineHtmlAssets()

            if (options.useImportMetaPolyfill)
                newJSCode.push(template.importmeta(scriptName))

            // 此 polyfill 仅在以下选项的值为 false 时需要。
            // config.build.rolldownOptions.output.codeSplitting
            if (/\b__VITE_PRELOAD__\b/.test(code)) {
                if (code.startsWith('var ')) {
                    code = 'var __VITE_PRELOAD__,' + code.slice(4)
                } else {
                    newJSCode.push("var __VITE_PRELOAD__")
                }
            }

            newJSCode.push(code)
        } else {
            inlineHtmlAssets()
        }

        let outputScript = newJSCode.join(';').replaceAll('</script', '<\\/script')
        if (options.enableCompress) {
            outputScript = await template.base(outputScript, options.compressFormat, options.useBase128, options.compressor)
        }

        htmlChunk.source = htmlChunk.source.replace(fakeScript, () => outputScript)

        // log
        console.log("  " + pc.gray(kB(oldSize) + " -> ") + pc.cyanBright(kB(Buffer.byteLength(htmlChunk.source))) + '\n')

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
        const { outDir } = config.build
        const mustStartsWith = path.resolve(outDir) + path.sep
        for (const name of globalRemoveDistFileNames) {
            try {
                const _path = path.resolve(outDir, name)
                if (_path.startsWith(mustStartsWith)) {
                    fs.rmSync(_path, { force: true })
                }
            } catch (e) {
                console.error(e)
            }
        }
    }

    console.log(pc.green('Finish.') + pc.reset('\n'))
}
