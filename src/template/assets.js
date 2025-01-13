//@ts-nocheck
{
    const a = { "": "" }
    for (const n in a) {
        for (const e of document.querySelectorAll(`[src="data:${n}"]`))
            e.src = a[n]
        for (const e of document.querySelectorAll(`[href="data:${n}"]`))
            e.href = a[n]
    }
}
