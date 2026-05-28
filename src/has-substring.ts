export function hasSubstring(str: string, sub: string): 0 | 1 | 2 {
    const i = str.indexOf(sub)
    // does not has
    if (i === -1) return 0
    // has once
    if (i === str.lastIndexOf(sub)) return 1
    // has multiple
    return 2
}
