//@ts-nocheck

// License: Unlicense

{
    /** @type {{[k:string]:string}} */
    let assets = __SPLIT__
    for (let name in assets) {
        for (let element of document.querySelectorAll(`[src="data:${name}"]`)) {
            element.src = assets[name]
        }
    }
}
