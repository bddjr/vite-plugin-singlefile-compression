import { compress, CompressFormat, Compressor } from './compress.js'
import files from './templateRaw.js'

export const template = {
    async base(script: string, format: CompressFormat, useBase128: boolean, compressor: Compressor | undefined) {
        script = await compress(format, script, useBase128, compressor)
        const t = useBase128 ? files.base128 : files.base64
        return t[0].concat(
            script,
            t[1],
            JSON.stringify(format),
            t[2]
        )
    },
    assets(assetsJSON: string) {
        const t = files.assets
        return t[0].concat(
            JSON.stringify(assetsJSON),
            t[1]
        )
    },
    css(cssSource: string) {
        return files.css + JSON.stringify(cssSource)
    },
    icon(dataURL: string) {
        return files.icon + JSON.stringify(dataURL)
    },
    importmeta(p: string) {
        const t = files.importmeta
        return t[0].concat(
            JSON.stringify(p),
            t[1]
        )
    },
}
