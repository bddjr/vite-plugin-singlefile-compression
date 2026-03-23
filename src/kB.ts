export function kB(size: number) {
    const s = String(size).padStart(4, '0')
    return `${s.slice(0, -3)}.${s.slice(-3)} kB`
}
