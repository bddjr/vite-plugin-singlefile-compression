//@ts-nocheck

import { decode } from "base128-ascii";

new Response(
    new ReadableStream({
        start(c) {
            c.enqueue(decode("<script>"))
            c.close()
        }
    }).pipeThrough(new DecompressionStream("gzip")),
    { headers: { "Content-Type": "text/javascript" } }
).blob().then(b =>
    import(b = URL.createObjectURL(b))
        .finally(() => URL.revokeObjectURL(b))
);
