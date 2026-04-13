//@ts-nocheck

// License: Unlicense

fetch("data:;base64,__SPLIT__")
	.then(r => new Response(
		r.body.pipeThrough(new DecompressionStream(__SPLIT__))
	).text())
	.then(t => {
		var script = document.createElement("script")
		script.type = 'module'
		script.innerHTML = t
		document.head.appendChild(script)
	});
