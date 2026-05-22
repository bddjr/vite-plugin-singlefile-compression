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
    zstd: zlib.zstdCompressSync && (
        (buf: zlib.InputType): Buffer => zlib.zstdCompressSync(buf, {
            params: {
                [zlib.constants.ZSTD_c_compressionLevel]: 19
            }
        })
    ),
} as const

export const compressFormatAlias = {
    deflateRaw: 'deflate-raw',
    gz: 'gzip',
    br: 'brotli',
    brotliCompress: 'brotli',
    zstandard: 'zstd',
    zst: 'zstd',
} as const

export type Compressor = ((buf: zlib.InputType) => (Buffer | Uint8Array | Promise<Buffer | Uint8Array>))
export type CompressFormat = keyof typeof compressors | CompressionFormat
export type CompressFormatAlias = keyof typeof compressFormatAlias

function switchCompressor(format: CompressFormat): Compressor {
    if (compressors.hasOwnProperty(format)) {
        const f = compressors[format]
        if (f) return f
        throw Error(`Could not get compressor: Please upgrade node.js or set your compressor function.`)
    }
    {
        const _format = format.replace(/-([a-zA-Z])/g, (m, a) => a.toUpperCase())
        for (const funcName of [
            _format + 'CompressSync',
            _format + 'Sync'
        ]) {
            if (Object.prototype.hasOwnProperty.call(zlib, funcName)) {
                const f = (zlib as any)[funcName]
                if (typeof f == 'function') return f
            }
        }
    }
    try {
        const cs = new CompressionStream(format as CompressionFormat)
        return (buf) => new Response(
            new ReadableStream({
                start(controller) {
                    controller.enqueue(buf)
                    controller.close()
                },
            }).pipeThrough(cs)
        ).bytes()
    } catch { }
    throw Error(`Could not get compressor: Unknown compress format '${format}', please set your compressor function.`)
}

export async function compress(format: CompressFormat, buf: zlib.InputType, useBase128: boolean, compressor: Compressor | undefined): Promise<string> {
    if (typeof compressor != 'function') {
        compressor = switchCompressor(format)
    }
    const out = await compressor(buf)
    if (useBase128) {
        // base128-ascii
        return base128.encode(out).toJSTemplateLiterals()
    }
    // base64
    if (typeof Uint8Array.prototype.toBase64 == 'function') {
        // Uint8Array Node.js v25
        return Uint8Array.prototype.toBase64.call(out) as string
    }
    return Buffer.prototype.base64Slice.call(out, 0, out.length) as string
}
