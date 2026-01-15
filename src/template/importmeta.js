//@ts-nocheck

// Unlicense.

{
    let meta = import.meta
        , resolve = meta.resolve
        , url = (meta.url = new URL("<path>", location).href)

    meta.resolve = function (name) {
        return /^\.{0,2}\//.test(name)
            ? new URL(name, url).href
            : resolve.apply(this, arguments)
    }
}
