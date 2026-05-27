export const toBase64: (bytes: Uint8Array) => string = (
    typeof Uint8Array.prototype.toBase64 == 'function'
        ? (bytes) => Uint8Array.prototype.toBase64.call(bytes)
        : (bytes) => Buffer.prototype.base64Slice.call(bytes, 0, bytes.length)
)