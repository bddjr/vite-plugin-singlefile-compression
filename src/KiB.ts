export function KiB(size: number) {
    return `${Math.ceil(size / 10.24) / 100} KiB`
}
