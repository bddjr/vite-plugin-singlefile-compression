import svgToTinyDataUri from "mini-svg-data-uri";
import { lookup } from 'mrmime'

export function bufferToDataURL(name: string, b: Buffer) {
    return /\.svg$/i.test(name)
        ? svgToTinyDataUri(b.toString())
        : `data:${lookup(name)};base64,${b.toString('base64')}`
}
