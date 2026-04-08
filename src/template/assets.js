//@ts-nocheck

// License: Unlicense

{
    let assets = { "": "" }
    for (let name in assets) {
        for (let element of document.querySelectorAll(`[src="data:${name}"]`)) {
            element.src = assets[name]
        }
    }
}
