import svgToTinyDataUri from "mini-svg-data-uri";
import mime from 'mime'

export function bufferToDataURL(name: string, b: Buffer) {
    return name.endsWith('.svg')
        ? svgToTinyDataUri(b.toString())
        : `data:${mime.getType(name)};base64,${b.toString('base64')}`
}
