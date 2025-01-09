import esbuild from 'esbuild'
import fs from 'fs'

let result = esbuild.buildSync({
    entryPoints: [
        "src/template.js",
        "src/template-assets.js",
        "src/template-base128.js",
    ],
    outdir: "dist",
    minify: true,
    bundle: true,
    format: 'esm',
    charset: 'ascii',
    write: false,
})

if (result.errors.length)
    throw result.errors

for (const i of result.outputFiles) {
    fs.writeFileSync(i.path, i.text.replace(/;?\n?$/, ''))
}
