//@ts-nocheck

// License: Unlicense

for (var input = "<script>"
    , il = input.length
    , out = new Uint8Array(il / 8 * 7)
    , ii = 0
    , oi = 0
    , cache
    , next = _ => (
        (cache = input.charCodeAt(ii++)) > 127
            ? cache = 0 // In HTML, 0 is likely to be converted to 65533 (�)
            : cache
    )
    , R = Response
    ; ii < il;) {
    //     0        1        2        3        4        5        6        7
    // in  _0000000 _1111111 _2222222 _3333333 _4444444 _5555555 _6666666 _7777777
    // out 00000001 11111122 22222333 33334444 44455555 55666666 67777777

    /* 0 */ out[oi++] = next() << 1 | next() >> 6
    /* 1 */ out[oi++] = cache << 2 | next() >> 5
    /* 2 */ out[oi++] = cache << 3 | next() >> 4
    /* 3 */ out[oi++] = cache << 4 | next() >> 3
    /* 4 */ out[oi++] = cache << 5 | next() >> 2
    /* 5 */ out[oi++] = cache << 6 | next() >> 1
    /* 6 */ out[oi++] = cache << 7 | next()
}

new R(
    new R(out).body.pipeThrough(new DecompressionStream("<format>")),
    { headers: { "Content-Type": "text/javascript" } }
).blob().then(b => (
    import(b = URL.createObjectURL(b)),
    URL.revokeObjectURL(b)
));
