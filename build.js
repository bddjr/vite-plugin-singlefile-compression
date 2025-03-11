import esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import base128 from 'base128-ascii'

const brotliDecoder = zlib.deflateRawSync(
    fs.readFileSync('src/brotli/decode.min.js'),
    { level: zlib.constants.Z_BEST_COMPRESSION }
)

const inDir = "src/template"
const outdir = "dist/template"

let result = esbuild.buildSync({
    entryPoints: fs.readdirSync(inDir)
        .filter(i => i.endsWith('.js'))
        .map(i => path.join(inDir, i)),
    outdir: outdir,
    minify: true,
    bundle: true,
    format: 'esm',
    charset: 'ascii',
    write: false,
})

if (result.errors.length)
    throw result.errors

if (!fs.existsSync(outdir))
    fs.mkdirSync(outdir)

for (const i of result.outputFiles) {
    i.text = i.text.replace(/;?\n?$/, '')
    if (i.path.endsWith("base128-brotli.js")) {
        i.text = i.text
            .split('"<decoder>"', 2)
            .join(base128.encode(brotliDecoder).toJSTemplateLiterals())
    }
    fs.writeFileSync(i.path, i.text)
}

fs.copyFileSync(
    path.join(inDir, "LICENSE.txt"),
    path.join(outdir, "LICENSE.txt")
)
