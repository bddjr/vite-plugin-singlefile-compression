import svgToTinyDataUri from "mini-svg-data-uri";
import { lookup } from 'mrmime'
import { toBase64 } from "./to-base64";
import { textDecoder, textEncoder } from "./encoding-api";

export function toDataURL(name: string, source: string | Uint8Array): string {
    if (/\.svg$/i.test(name)) {
        if (typeof source != 'string')
            source = textDecoder.decode(source)
        return svgToTinyDataUri(source)
    }
    if (typeof source == 'string')
        source = textEncoder.encode(source)
    return `data:${lookup(name)};base64,${toBase64(source)}`
}

export function toDataURL_andGetByteLength(name: string, source: string | Uint8Array): { dataURL: string, byteLength: number } {
    if (/\.svg$/i.test(name)) {
        if (typeof source == 'string') return {
            dataURL: svgToTinyDataUri(source),
            byteLength: Buffer.byteLength(source)
        }
        return {
            dataURL: svgToTinyDataUri(textDecoder.decode(source)),
            byteLength: source.byteLength,
        }
    }
    if (typeof source == 'string')
        source = textEncoder.encode(source)
    return {
        dataURL: `data:${lookup(name)};base64,${toBase64(source)}`,
        byteLength: source.byteLength,
    }
}