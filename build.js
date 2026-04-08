import fs from 'fs'
import path from 'path'

import esbuild from 'esbuild'
import { minify_sync } from 'terser'

fs.rmSync('dist', { recursive: true, force: true })
fs.mkdirSync('dist')

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
    legalComments: 'none',
})

if (result.errors.length)
    throw result.errors

/** @type {{[k:string]:string[]}} */
const raw = {}

for (const i of result.outputFiles) {
    // @ts-ignore
    raw[/([^/\\]+)\.js$/i.exec(i.path)[1]] = i.text.replace(/;?\s*$/, '').split('__SPLIT__')
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
    raw.base128 = minifyOutput.code.replace(/;?\s*$/, '').split('__SPLIT__')
}

const templateRawFilePath = 'dist/templateRaw.js'

fs.writeFileSync(templateRawFilePath, `export default ${JSON.stringify(raw)}`)


// bundle

import { build as rolldownBuild } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

await rolldownBuild({
    input: [
        'src/index.ts',
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
    platform: 'node',
    plugins: [
        dts()
    ],
    resolve: {
        alias: {
            './templateRaw.js': '../' + templateRawFilePath,
        },
    },
})

fs.rmSync(templateRawFilePath)
