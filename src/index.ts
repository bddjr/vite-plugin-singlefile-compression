import { UserConfig, PluginOption } from "vite"
import { OutputChunk, OutputAsset, OutputBundle } from "rollup"
import mime from 'mime'
import pc from "picocolors"
import svgToTinyDataUri from "mini-svg-data-uri"

import zlib from 'zlib'
import path from 'path'
import fs from 'fs'

export function singleFileCompression(): PluginOption {
    return {
        name: "singleFileGzip",
        enforce: "post",
        config: setConfig,
        generateBundle,
    }
}

export default singleFileCompression

const template = fs.readFileSync(path.join(import.meta.dirname, "template.js")).toString()

const templateAssets = fs.readFileSync(path.join(import.meta.dirname, "template-assets.js")).toString()

const fileProtocolDistPath = (p =>
    p.startsWith('/')
        ? `file://${p}/`
        : `file:///${p.replaceAll('\\', '/')}/`
)(path.resolve("dist"))

function setConfig(config: UserConfig) {
    config.base = './'

    if (!config.build)
        config.build = {}

    config.build.assetsInlineLimit = Infinity
    config.build.chunkSizeWarningLimit = Infinity
    config.build.cssCodeSplit = false
    config.build.assetsDir = 'assets'
    config.build.modulePreload = { polyfill: false }

    if (!config.build.rollupOptions)
        config.build.rollupOptions = {}

    config.build.rollupOptions.output = { inlineDynamicImports: true }

}

function gzipToBase64(buf: zlib.InputType) {
    return zlib.gzipSync(buf, {
        level: zlib.constants.Z_BEST_COMPRESSION,
    }).toString('base64')
}

function KiB(size: number) {
    return `${Math.ceil(size / 10.24) / 100} KiB`
}

function generateBundle(_, bundle: OutputBundle) {
    console.log(pc.cyan('\n\nvite-plugin-singlefile-compression ') + pc.green('building...'))
    const globalDel = new Set() as Set<string>

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
        const thisDel = new Set() as Set<string>

        // Fix async import
        let newJSCode = ["self.__VITE_PRELOAD__=null"] as string[]

        // get css tag
        newHtml = newHtml.replace(/\s*<link rel="stylesheet"[^>]* href="\.\/(assets\/[^"]+)"[^>]*>/,
            (match, name: string) => {
                thisDel.add(name)
                const css = bundle[name] as OutputAsset
                let cssSource = css.source as string
                oldSize += cssSource.length
                cssSource = cssSource.replace(/\s+$/, '')
                // add script for load css
                if (cssSource)
                    newJSCode.push(`document.head.appendChild(document.createElement("style")).innerHTML=${JSON.stringify(cssSource)}`)
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
                    oldSize += a.source.length
                    const b = Buffer.from(a.source)
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
                newJSCode.push(js.code.replace(/;?\n?$/, ''))
                // gzip
                return '<script type="module">'
                    + template.replace('{<script>}', gzipToBase64(newJSCode.join(';')))
                    + '</script>'
            }
        )
        if (!ok) continue

        // finish
        htmlChunk.source = newHtml
        console.log(
            "\n"
            + "  " + pc.underline(pc.cyan(fileProtocolDistPath) + pc.greenBright(htmlFileName)) + '\n'
            + "  " + pc.gray(KiB(oldSize) + " -> ") + pc.cyanBright(KiB(newHtml.length)) + '\n'
        )

        // delete assets
        for (const name of thisDel) {
            globalDel.add(name)
        }
    }

    // delete inlined assets
    for (const name of globalDel) {
        delete bundle[name]
    }
    console.log(pc.green('Finish.\n'))
}
