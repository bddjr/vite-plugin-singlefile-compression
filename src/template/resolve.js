//@ts-nocheck
{
    const resolve = import.meta.resolve;
    import.meta.resolve = (name) => (
        /^\.{0,2}\//.test(name)
            ? new URL(name, import.meta.url).href
            : resolve(name)
    )
}