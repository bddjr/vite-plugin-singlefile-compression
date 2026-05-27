import base128 from 'base128-ascii'
import { compress, CompressFormat, Compressor } from './compress.js'
import files from './templateRaw.js'
import { toBase64 } from './to-base64.js'

/** base128 input variable name */
const base128InputVarName = files.base128[0].slice(-2, -1)

/** base128 const inputLen string */
const base128ConstInputLenStr = base128InputVarName + '.length'

/** base128 inputLen variable name */
const base128InputLenVarName = files.base128[1].slice(-2, -1)

/** base128 const outLen string */
const base128ConstOutLenStr = base128InputLenVarName + '/8*7'

export const template = {
    async base(script: string, format: CompressFormat, useBase128: boolean, compressor: Compressor | undefined) {
        const compressedBytes = await compress(format, script, compressor)
        const _format_ = JSON.stringify(format)
        if (useBase128) {
            const t = files.base128
            const b128Result = base128.encode(compressedBytes)
            const b128Str = b128Result.toJSTemplateLiterals()
            /** input length string */
            const inputLenStr = b128Result.bytes.length.toString()
            /** out length string */
            const outLenStr = compressedBytes.length.toString()
            if ((inputLenStr.length + outLenStr.length) > 17) {
                // Do not remove inputLen variable
                return t[0].concat(
                    b128Str,
                    t[1],
                    base128ConstInputLenStr,
                    t[2],
                    base128ConstOutLenStr,
                    t[3],
                    base128InputLenVarName,
                    t[4],
                    _format_,
                    t[5]
                )
            }
            // Remove inputLen variable
            return t[0].concat(
                b128Str,
                t[2],
                outLenStr,
                t[3],
                inputLenStr,
                t[4],
                _format_,
                t[5]
            )
        }
        const t = files.base64
        const b64 = toBase64(compressedBytes)
        return t[0].concat(
            b64,
            t[1],
            _format_,
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
    importmeta(p: string) {
        const t = files.importmeta
        return t[0].concat(
            JSON.stringify(p),
            t[1]
        )
    },
}
