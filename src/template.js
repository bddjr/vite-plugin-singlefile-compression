//@ts-nocheck

fetch("data:application/gzip;base64,{<script>}")
	.then(r => new Response(
		r.body.pipeThrough(new DecompressionStream("gzip")),
		{ headers: { "Content-Type": "text/javascript" } }
	).blob())
	.then(b =>
		import(b = URL.createObjectURL(b))
			.finally(() => URL.revokeObjectURL(b))
	);
