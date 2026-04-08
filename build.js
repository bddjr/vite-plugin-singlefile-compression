import fs from 'fs'
import path from 'path'

import esbuild from 'esbuild'
import { minify_sync } from 'terser'


let result = esbuild.buildSync({
    entryPoints: fs.globSync('src/template/*.js').filter(v => path.basename(v) != 'base128.js'),
    outdir: './',
    entryNames: '[name]',
    write: false,
    minify: true,
    bundle: true,
    format: 'esm',
    charset: 'ascii',
    logLevel: 'warning',
})

if (result.errors.length)
    throw result.errors

/** @type {{[k:string]:string}} */
const raw = {}

for (const i of result.outputFiles) {
    raw[path.basename(i.path).replace(/\.js$/, '')] = i.text.replace(/;?\s*$/, '')
}

{
    const rawCode = fs.readFileSync('src/template/base128.js').toString()
    const minifyOutput = minify_sync(rawCode, {
        module: true,
        format: {
            wrap_iife: false,
            quote_style: 2,
        },
        compress: {
            module: true,
            evaluate: false,
        }
    })
    // @ts-ignore
    raw['base128'] = minifyOutput.code.replace(/;?\s*$/, '')
}

fs.writeFileSync('dist/templateRaw.js', `export var raw=` + JSON.stringify(raw))

for (const name of fs.globSync('src/**/*.d.ts')) {
    const distName = name.replace('src', 'dist');
    fs.existsSync(distName) || fs.cpSync(name, distName)
}



// bundle

import { build as rolldownBuild } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

fs.renameSync('dist', '_dist')

await rolldownBuild({
    input: [
        './_dist/index.js',
        './_dist/index.d.ts',
    ],
    transform: {
        target: 'es2021'
    },
    output: {
        format: 'esm',
        dir: 'dist',
    },
    external(id) {
        return !id.startsWith('.') && !path.isAbsolute(id);
    },
    // external: /^[^./](?!:[/\\])/,
    platform: 'node',
    plugins: [
        dts()
    ],
})
