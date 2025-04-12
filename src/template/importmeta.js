//@ts-nocheck

// Unlicense.

{
    import.meta.url = new URL("<path>", location).href
    const resolve = import.meta.resolve
    import.meta.resolve = (name) => (
        /^\.{0,2}\//.test(name)
            ? new URL(name, import.meta.url).href
            : resolve(name)
    )
}
