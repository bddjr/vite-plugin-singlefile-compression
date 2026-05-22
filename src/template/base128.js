//@ts-nocheck

// License: Unlicense

for (var R = Response
    , D = document
    , script = D.createElement("script")
    , input = __SPLIT__
    , il = input.length
    , out = new Uint8Array(il / 8 * 7)
    , ii = 0
    , oi = 0
    , k
    , cache
    , next = _ =>
        (cache = input.charCodeAt(ii++)) >> 7
            ? cache = 0 // In HTML, 0 is likely to be converted to 65533 (�)
            : cache
    ; ii < il;) {
    //     0        1        2        3        4        5        6        7
    // in  _0000000 _1111111 _2222222 _3333333 _4444444 _5555555 _6666666 _7777777
    // out 00000001 11111122 22222333 33334444 44455555 55666666 67777777
    for (next(), k = 7; k;) {
        out[oi++] = cache << 7 - --k | next() >> k
    }
}

new R(
    new R(out).body.pipeThrough(new DecompressionStream(__SPLIT__))
).text().then(t => {
    script.type = 'module'
    script.innerHTML = t
    D.head.appendChild(script)
});
