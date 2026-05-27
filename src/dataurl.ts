import svgToTinyDataUri from "mini-svg-data-uri";
import { lookup } from 'mrmime'
import { toBase64 } from "./to-base64";

const te = new TextEncoder
const td = new TextDecoder

export function toDataURL(name: string, source: string | Uint8Array): string {
    if (/\.svg$/i.test(name)) {
        if (typeof source != 'string')
            source = td.decode(source)
        return svgToTinyDataUri(source)
    }
    if (typeof source == 'string')
        source = te.encode(source)
    return `data:${lookup(name)};base64,${toBase64(source)}`
}

export function toDataURL_andGetByteLength(name: string, source: string | Uint8Array): { dataURL: string, byteLength: number } {
    if (/\.svg$/i.test(name)) {
        if (typeof source == 'string') return {
            dataURL: svgToTinyDataUri(source),
            byteLength: Buffer.byteLength(source)
        }
        return {
            dataURL: svgToTinyDataUri(td.decode(source)),
            byteLength: source.byteLength,
        }
    }
    if (typeof source == 'string')
        source = te.encode(source)
    return {
        dataURL: `data:${lookup(name)};base64,${toBase64(source)}`,
        byteLength: source.byteLength,
    }
}