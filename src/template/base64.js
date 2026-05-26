//@ts-nocheck

// License: Unlicense

fetch("data:;base64,__SPLIT__")
	.then(r => new Response(
		r.body.pipeThrough(new DecompressionStream(__SPLIT__))
	).text())
	.then(t => {
		var D = document
			, script = D.createElement("script")
		script.type = 'module'
		script.innerHTML = t
		D.head.appendChild(script)
	});
