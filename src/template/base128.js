//@ts-nocheck

// License: Unlicense
{
    let R = Response
        , D = document
        , script = D.createElement("script")
        , input = __SPLIT__
        , inputLen = __SPLIT__
        , out = new Uint8Array(__SPLIT__)
        , ii = 0
        , oi = 0
        , k
        , cache
        , next = _ =>
            (cache = input.charCodeAt(ii++)) >> 7
                ? cache = 0 // In HTML, 0 is likely to be converted to 65533 (�)
                : cache

    for (script.type = 'module'; ii < __SPLIT__; out[oi++] = cache << 8 - k | next() >> --k)
        k || next(k = 7);

    new R(
        new R(out).body.pipeThrough(new DecompressionStream(__SPLIT__))
    ).text().then(t => {
        script.innerHTML = t
        D.head.appendChild(script)
    })
}