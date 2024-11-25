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
    return String(Math.ceil(size / 10.24) / 100) + " KiB"
}

function generateBundle(_, bundle: OutputBundle) {
    console.log('\n\n' + pc.cyan('vite-plugin-singlefile-compression') + ' ' + pc.green('building...'))
    const setDel = new Set() as Set<string>

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
        let newJSCode = `var __VITE_PRELOAD__;`
        let cssFileName = ""

        // get css tag
        let tag = /\s*<link rel="stylesheet"[^>]* href="\.\/(assets\/[^"]+)"[^>]*>/.exec(newHtml)
        if (tag) {
            cssFileName = tag[1]
            const css = bundle[cssFileName] as OutputAsset
            let cssSource = css.source as string
            oldSize += cssSource.length
            cssSource = cssSource.replace(/\s+$/, '')
            // add script for load css
            if (cssSource)
                newJSCode += `document.head.appendChild(document.createElement("style")).innerHTML=${JSON.stringify(cssSource)};`
            // delete css tag
            newHtml = newHtml.slice(0, tag.index)
                + newHtml.slice(tag.index + tag[0].length)
        }

        // get html assets
        const assets = {}
        for (const i of newHtml.matchAll(/[\s"'](src|href)="\.\/assets\/([^"]+)"/g)) {
            const name = i[2]
            if (name.endsWith('.js') || Object.hasOwn(assets, name)) continue

            const bundleName = "assets/" + name
            const o = bundle[bundleName] as OutputAsset
            if (!o) continue

            oldSize += o.source.length
            assets[name] =
                name.endsWith('.svg')
                    ? svgToTinyDataUri(Buffer.from(o.source).toString())
                    : `data:${mime.getType(o.fileName)};base64,${Buffer.from(o.source).toString('base64')}`
            setDel.add(bundleName)
        }

        // add script for load html assets
        const assetsJSON = JSON.stringify(assets)
        if (assetsJSON != '{}')
            newJSCode += templateAssets.replace('{"":""}', assetsJSON)

        // get js tag
        tag = /<script type="module"[^>]* src="\.\/(assets\/[^"]+)"[^>]*><\/script>/.exec(newHtml)
        if (!tag) continue
        const jsFileName = tag[1]
        const js = bundle[jsFileName] as OutputChunk
        oldSize += js.code.length

        // gzip
        newJSCode += js.code
        const outputScript = template.replace('{<script>}', gzipToBase64(newJSCode))


        // write js tag
        newHtml = newHtml.slice(0, tag.index)
            + `<script type="module">${outputScript}</script>`
            + newHtml.slice(tag.index + tag[0].length)

        // replace assets
        newHtml = newHtml.replace(/="\.\/assets\//g, '="data:assets,')

        // finish
        htmlChunk.source = newHtml
        console.log(
            // "dist/%s  %d KiB => %d KiB",
            "\n  "
            + pc.underline(pc.cyan(fileProtocolDistPath) + pc.greenBright(htmlFileName))
            + "\n  "
            + pc.gray(KiB(oldSize) + " -> ")
            + pc.cyanBright(KiB(newHtml.length))
            + "\n"
        )

        setDel.add(cssFileName)
        setDel.add(jsFileName)
    }

    // delete inlined assets
    for (const name of setDel) {
        delete bundle[name]
    }
    console.log(pc.green('Finish.\n'))
}
