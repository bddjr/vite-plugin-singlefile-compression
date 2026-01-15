import fs from 'fs'
import { fileURLToPath } from 'url'
import { compress, compressFormat, compressor } from './compress.js'

function r(name: string) {
    return fs.readFileSync(
        fileURLToPath(new URL(`./template/${name}.js`, import.meta.url))
    ).toString()
}

function rt(name: string, template: string) {
    const s = r(name).split(template)
    if (s.length !== 2) throw Error("s.length!==2")
    return s
}

const files = {
    base64: r('base64'),
    base128: r('base128'),
    assets: rt('assets', '{"":""}'),
    css: rt('css', '"<style>"'),
    icon: rt('icon', '"<icon>"'),
    importmeta: rt('importmeta', '"<path>"'),
}

export const template = {
    base(script: string, format: compressFormat, useBase128: boolean, compressor: compressor) {
        script = compress(format, script, useBase128, compressor)
        if (useBase128) {
            return files.base128
                .replace("<format>", format)
                .split('"<script>"', 2).join(script)
        }
        return files.base64
            .replace("<format>", format)
            .split("<script>", 2).join(script)
    },
    assets(assetsJSON: string) {
        return files.assets.join(assetsJSON)
    },
    css(cssSource: string) {
        return files.css.join(JSON.stringify(cssSource))
    },
    icon(dataURL: string) {
        return files.icon.join(JSON.stringify(dataURL))
    },
    importmeta(p: string) {
        return files.importmeta.join(JSON.stringify(p))
    },
}
