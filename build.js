import esbuild from 'esbuild'
import fs from 'fs'
import path from 'path'

import packageJson from './package.json' with {type: 'json'}

fs.writeFileSync('dist/getVersion.js', `export var version=` + JSON.stringify(packageJson.version))

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
    logLevel: 'warning',
})

if (result.errors.length)
    throw result.errors

if (!fs.existsSync(outdir))
    fs.mkdirSync(outdir)

for (const i of result.outputFiles) {
    fs.writeFileSync(i.path, i.text.replace(/;?\s*$/, ''))
}
