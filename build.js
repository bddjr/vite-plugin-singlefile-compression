import esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'

const inDir = "src/template"
const outdir = "dist/template"

let result = esbuild.buildSync({
    entryPoints: [
        path.join(inDir, "base128.js"),
        path.join(inDir, "base64.js"),
        path.join(inDir, "assets.js"),
    ],
    outdir: outdir,
    minify: true,
    bundle: true,
    format: 'esm',
    charset: 'ascii',
    write: false,
})

if (result.errors.length)
    throw result.errors

fs.mkdirSync(outdir)

for (const i of result.outputFiles) {
    fs.writeFileSync(i.path, i.text.replace(/;?\n?$/, ''))
}

fs.copyFileSync(
    path.join(inDir, "LICENSE.txt"),
    path.join(outdir, "LICENSE.txt")
)
