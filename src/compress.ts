import base128 from "base128-ascii"
import zlib from 'zlib'

const zlibDefaultOptions: zlib.ZlibOptions = {
    level: zlib.constants.Z_BEST_COMPRESSION,
}

const compressors = {
    "deflate-raw"(buf: zlib.InputType): Buffer {
        return zlib.deflateRawSync(buf, zlibDefaultOptions)
    },
    deflate(buf: zlib.InputType): Buffer {
        return zlib.deflateSync(buf, zlibDefaultOptions)
    },
    gzip(buf: zlib.InputType): Buffer {
        return zlib.gzipSync(buf, zlibDefaultOptions)
    },
    brotli: zlib.brotliCompressSync,
    zstd: zlib.zstdCompressSync,
}

export type compressor = ((buf: zlib.InputType) => Buffer)
export type compressFormat = keyof typeof compressors

function switchCompressor(format: compressFormat): compressor {
    if (!Object.prototype.hasOwnProperty.call(compressors, format)) {
        const f = zlib[format + 'CompressSync']
        if (!f) throw Error(`Could not get compressor: Unknown compress format '${format}', please set your compressor function.`)
        return f
    }
    const f = compressors[format]
    if (!f) throw Error(`Could not get compressor: Please upgrade node.js or set your compressor function.`)
    return f
}

export function compress(format: compressFormat, buf: zlib.InputType, useBase128: boolean, compressor: compressor) {
    const outBuf: Buffer = compressor ? compressor(buf) : switchCompressor(format)(buf)
    return useBase128
        ? base128.encode(outBuf).toJSTemplateLiterals()
        : outBuf.toString('base64')
}
