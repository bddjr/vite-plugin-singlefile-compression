import { UserConfig, PluginOption, ResolvedConfig, ConfigPluginContext, ConfigEnv } from "vite"
import { RollupOptions } from 'rollup'
import { OutputBundle, OutputChunk, OutputAsset } from 'rolldown'
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
import { getInnerOptions, Options, InnerOptions as InnerOptions, HtmlMinifierOptions, defaultHtmlMinifierTerserOptions } from "./options.js"
import { cutPrefix } from "./cutPrefix.js"
import { CompressFormat, CompressFormatAlias, Compressor } from "./compress.js"

export function singleFileCompression(opt?: Options): PluginOption {
    let conf: ResolvedConfig
    const innerOptions = getInnerOptions(opt)
    return {
        name: "singleFileCompression",
        enforce: "post",
        config(...args) {
            return setConfig.call(this, innerOptions, ...args)
        },
        configResolved(c) {
            conf = c
        },
        generateBundle(outputOptions, bundle) {
            return generateBundle(bundle, conf, innerOptions)
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

async function generateBundle(bundle: OutputBundle, config: ResolvedConfig, options: InnerOptions) {
    console.log(
        pc.reset('\n\n') +
        pc.cyan('vite-plugin-singlefile-compression ' + version) +
        ' ' +
        (options.enableCompress ? pc.green(options.compressFormat) : pc.red('disable compress'))
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

    for (const name in bundle) {
        if (name.startsWith(assetsDir))
            bundleAssetsNames.push(name)
        else if (/\.html$/i.test(name))
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
            scriptElement = document.querySelector<HTMLScriptElement>(`script[type=module]${assetsSrcSelector}`),
            scriptName = scriptElement ? cutPrefix(scriptElement.src, config.base) : ''

        let oldSize = oldHTML.length

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
                oldSize += cssSource.length
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
            if (options.enableCompress) {
                newJSCode.push(template.css(allCSS))
            } else {
                const e = document.createElement('style')
                e.innerHTML = allCSS
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
                    oldSize += a.source.length
                    let dataURL: string
                    if (Object.prototype.hasOwnProperty.call(globalAssetsDataURL, name)) {
                        dataURL = globalAssetsDataURL[name]
                    } else {
                        globalAssetsDataURL[name] = dataURL = bufferToDataURL(name, Buffer.from(a.source))
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
                    if (options.enableCompress) {
                        newJSCode.push(template.icon(dataURL))
                        if (!element) {
                            // add link icon tag
                            document.head.insertAdjacentHTML('beforeend', '<link rel="icon" href="data:">')
                        }
                    } else {
                        if (element) {
                            element.href = dataURL
                        } else {
                            const e = document.head.appendChild(document.createElement('link'))
                            e.rel = 'icon'
                            e.href = dataURL
                        }
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

            // 此 polyfill 仅在以下选项的值为 false 时需要。
            // config.build.rolldownOptions.output.codeSplitting
            if (/\b__VITE_PRELOAD__\b/.test(code))
                newJSCode.push("var __VITE_PRELOAD__")

            newJSCode.push(code)
        } else {
            inlineHtmlAssets()
        }

        let outputScript = newJSCode.join(';')
        if (options.enableCompress) {
            outputScript = template.base(outputScript, options.compressFormat, options.useBase128, options.compressor)
        } else {
            outputScript = outputScript.replaceAll('</script', '<\\/script')
        }

        htmlChunk.source = htmlChunk.source.split(fakeScript, 2).join(outputScript)

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
