import { textDecoder } from "./encoding-api";

export function sourceToString(source: string | Uint8Array): string {
    return typeof source == 'string'
        ? source
        : textDecoder.decode(source)
}