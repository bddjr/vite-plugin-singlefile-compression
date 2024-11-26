//@ts-nocheck

{
    const a = { "": "" }
    for (const name in a) {
        for (const e of document.querySelectorAll(`[src="data:${name}"]`)) {
            e.src = a[name]
        }
        for (const e of document.querySelectorAll(`[href="data:${name}"]`)) {
            e.href = a[name]
        }
    }
}
