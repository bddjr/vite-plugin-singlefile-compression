import base128 from 'base128-ascii'
import { compress, CompressFormat, Compressor } from './compress.js'
import files from './templateRaw.js'

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
        if (useBase128) {
            const b128Result = base128.encode(compressedBytes)
            /** input.length and out.length using const number */
            let ioLenUsingConstNumber = true
            /** input length string */
            let inputLenStr = b128Result.bytes.length.toString()
            if (inputLenStr.length > base128ConstInputLenStr.length) {
                ioLenUsingConstNumber = false
                inputLenStr = base128ConstInputLenStr
            }
            /** out length string */
            let outLenStr = compressedBytes.length.toString()
            if (outLenStr.length > base128ConstOutLenStr.length) {
                ioLenUsingConstNumber = false
                outLenStr = base128ConstOutLenStr
            }
            const b128Str = b128Result.toJSTemplateLiterals()
            const _format_ = JSON.stringify(format)
            const t = files.base128
            if (ioLenUsingConstNumber) {
                // remove inputLen variable
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
            return t[0].concat(
                b128Str,
                t[1],
                inputLenStr,
                t[2],
                outLenStr,
                t[3],
                base128InputLenVarName,
                t[4],
                _format_,
                t[5]
            )
        }
        const b64 = (
            typeof Uint8Array.prototype.toBase64 == 'function'
                ? Uint8Array.prototype.toBase64.call(compressedBytes)
                : Buffer.prototype.base64Slice.call(compressedBytes, 0, compressedBytes.length) as string
        )
        const t = files.base64
        return t[0].concat(
            b64,
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
    importmeta(p: string) {
        const t = files.importmeta
        return t[0].concat(
            JSON.stringify(p),
            t[1]
        )
    },
}
