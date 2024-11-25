//@ts-nocheck

fetch("data:application/gzip;base64,{<script>}")
	.then(r => r.blob())
	.then(b => new Response(
		b.stream().pipeThrough(new DecompressionStream("gzip")),
		{ headers: { "Content-Type": "text/javascript" } }
	).blob())
	.then(b =>
		import(b = URL.createObjectURL(b))
			.finally(() => URL.revokeObjectURL(b))
	);
