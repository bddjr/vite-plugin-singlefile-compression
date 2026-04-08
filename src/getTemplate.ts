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
