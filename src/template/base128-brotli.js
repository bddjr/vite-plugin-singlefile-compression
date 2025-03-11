//@ts-nocheck
import { decode } from "base128-ascii";

new Response(
    new ReadableStream({
        start(c) {
            c.enqueue(decode("<decoder>"))
            c.close()
        }
    }).pipeThrough(new DecompressionStream("deflate-raw")),
    { headers: { "Content-Type": "text/javascript" } }
).blob().then(b =>
    import(b = URL.createObjectURL(b))
        .then(m => (
            import(
                URL.createObjectURL(
                    m = new Blob([m.BrotliDecode(
                        new Int8Array(
                            decode("<script>")
                        )
                    )], { type: "text/javascript" })
                )
            ).finally(() => URL.revokeObjectURL(m))
        ))
        .finally(() => URL.revokeObjectURL(b))
);
