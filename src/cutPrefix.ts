export function cutPrefix(str: string, prefix: string) {
    return str.startsWith(prefix)
        ? str.slice(prefix.length)
        : str
}