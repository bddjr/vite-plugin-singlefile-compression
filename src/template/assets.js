//@ts-nocheck
{
    const assets = { "": "" }
    for (const name in assets) {
        for (const element of document.querySelectorAll(`[src="data:${name}"]`)) {
            element.src = assets[name]
        }
    }
}
