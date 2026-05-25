import base128 from "base128-ascii"
import zlib from 'zlib'

const compressors = {
    "deflate-raw"(script) {
        return zlib.deflateRawSync(script, {
            level: zlib.constants.Z_BEST_COMPRESSION,
        })
    },
    deflate(script) {
        return zlib.deflateSync(script, {
            level: zlib.constants.Z_BEST_COMPRESSION,
        })
    },
    gzip(script) {
        return zlib.gzipSync(script, {
            level: zlib.constants.Z_BEST_COMPRESSION,
        })
    },
    brotli: zlib.brotliCompressSync,
    zstd: zlib.zstdCompressSync && function (script) {
        return zlib.zstdCompressSync(script, {
            params: {
                [zlib.constants.ZSTD_c_compressionLevel]: 19
            }
        })
    },
} as const satisfies Record<string, Compressor>

export const compressFormatAlias = {
    deflateRaw: 'deflate-raw',
    gz: 'gzip',
    br: 'brotli',
    brotliCompress: 'brotli',
    zstandard: 'zstd',
    zst: 'zstd',
} as const satisfies Record<string, CompressFormat>

export type Compressor = ((script: string) => (Uint8Array | Promise<Uint8Array>))
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
        return (script: string) => new Response(
            new Response(script).body!.pipeThrough(cs)
        ).bytes()
    } catch { }
    throw Error(`Could not get compressor: Unknown compress format '${format}', please set your compressor function.`)
}

export function compress(format: CompressFormat, script: string, compressor: Compressor | undefined) {
    if (typeof compressor != 'function') {
        compressor = switchCompressor(format)
    }
    return compressor(script)
}
