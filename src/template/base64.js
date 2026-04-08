//@ts-nocheck

// License: Unlicense

fetch("data:;base64,__SPLIT__")
	.then(r => new Response(
		r.body.pipeThrough(new DecompressionStream(__SPLIT__)),
		{ headers: { "Content-Type": "text/javascript" } }
	).blob())
	.then(b => (
		import(b = URL.createObjectURL(b)),
		URL.revokeObjectURL(b)
	));
