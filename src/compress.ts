import base128 from "base128-ascii"
import zlib from 'zlib'

export type compressFormat = "deflate-raw" | "deflate" | "gzip"

export function compress(format: compressFormat, buf: zlib.InputType, useBase128: boolean) {
    const options = {
        level: zlib.constants.Z_BEST_COMPRESSION,
    }
    let outBuf: Buffer
    switch (format) {
        case "deflate":
            outBuf = zlib.deflateSync(buf, options)
            break
        case "deflate-raw":
            outBuf = zlib.deflateRawSync(buf, options)
            break
        case "gzip":
            outBuf = zlib.gzipSync(buf, options)
            break
        default:
            throw `unknown compress format ${format}`
    }
    return useBase128
        ? base128.encode(Uint8Array.from(outBuf)).toJSTemplateLiterals()
        : outBuf.toString('base64')
}
