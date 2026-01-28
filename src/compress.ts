import base128 from "base128-ascii"
import zlib from 'zlib'

const compressors = {
    "deflate-raw"(buf: zlib.InputType): Buffer {
        return zlib.deflateRawSync(buf, {
            level: zlib.constants.Z_BEST_COMPRESSION,
        })
    },
    deflate(buf: zlib.InputType): Buffer {
        return zlib.deflateSync(buf, {
            level: zlib.constants.Z_BEST_COMPRESSION,
        })
    },
    gzip(buf: zlib.InputType): Buffer {
        return zlib.gzipSync(buf, {
            level: zlib.constants.Z_BEST_COMPRESSION,
        })
    },
    brotli: zlib.brotliCompressSync,
    zstd: zlib.zstdCompressSync && function (buf: zlib.InputType) {
        return zlib.zstdCompressSync(buf, {
            params: {
                [zlib.constants.ZSTD_c_compressionLevel]: 22
            }
        })
    },
}

export type compressor = ((buf: zlib.InputType) => (Buffer | Uint8Array))
export type compressFormat = keyof typeof compressors

function switchCompressor(format: compressFormat): compressor {
    if (Object.prototype.hasOwnProperty.call(compressors, format)) {
        const f = compressors[format]
        if (f) return f
        throw Error(`Could not get compressor: Please upgrade node.js or set your compressor function.`)
    }
    let funcName = format + 'CompressSync'
    if (Object.prototype.hasOwnProperty.call(zlib, funcName)) {
        const f = (zlib as any)[funcName]
        if (typeof f == 'function') return f
    }
    throw Error(`Could not get compressor: Unknown compress format '${format}', please set your compressor function.`)
}

export function compress(format: compressFormat, buf: zlib.InputType, useBase128: boolean, compressor: compressor | undefined) {
    if (typeof compressor != 'function')
        compressor = switchCompressor(format)
    const outBuf = compressor(buf)
    if (useBase128)
        return base128.encode(outBuf).toJSTemplateLiterals()
    if (outBuf instanceof Buffer)
        return outBuf.toString('base64')
    if (typeof (outBuf as any).toBase64 == 'function') // Uint8Array Node25
        return (outBuf as any).toBase64()
    return Buffer.from(outBuf).toString('base64')
}
