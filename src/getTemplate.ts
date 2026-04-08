import { compress, CompressFormat, Compressor } from './compress.js'
import { raw } from './templateRaw.js'

function split2(str: string, separator: string) {
    const s = str.split(separator)
    if (s.length !== 2) throw Error("s.length!==2")
    return s
}

const files = {
    base64: raw.base64,
    base128: raw.base128,
    assets: split2(raw.assets, '{"":""}'),
    css: split2(raw.css, '"<style>"'),
    icon: split2(raw.icon, '"<icon>"'),
    importmeta: split2(raw.importmeta, '"<path>"'),
}

export const template = {
    async base(script: string, format: CompressFormat, useBase128: boolean, compressor: Compressor | undefined) {
        script = await compress(format, script, useBase128, compressor)
        if (useBase128) {
            return files.base128
                .replace("<format>", () => format)
                .replace('"<script>"', () => script)
        }
        return files.base64
            .replace("<format>", () => format)
            .replace("<script>", () => script)
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
