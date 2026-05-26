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
    for (; ii < __SPLIT__; out[oi++] = cache << 8 - k | next() >> --k) {
        //     0        1        2        3        4        5        6        7
        // in  _0000000 _1111111 _2222222 _3333333 _4444444 _5555555 _6666666 _7777777
        // out 00000001 11111122 22222333 33334444 44455555 55666666 67777777
        k || next(k = 7)
    }

    new R(
        new R(out).body.pipeThrough(new DecompressionStream(__SPLIT__))
    ).text().then(t => {
        script.type = 'module'
        script.innerHTML = t
        D.head.appendChild(script)
    });
}