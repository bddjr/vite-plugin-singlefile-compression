import fs from 'fs'
import path from 'path'

import esbuild from 'esbuild'
import { minify_sync } from 'terser'
import { build as rolldownBuild } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

for (const dir of ['dist', '_dist']) {
    fs.rmSync(dir, { recursive: true, force: true })
    fs.mkdirSync(dir)
}

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


/** @type {{[k: string]: string | string[]}} */
const raw = {}

/**
 * @param {string} code 
 */
function toTemplate(code) {
    code = code.replace(/;?\s*$/, '')
    const arr = code.split('__SPLIT__')
    if (arr.at(-1) === '') {
        if (arr.length == 2) return arr[0]
        if (arr.length == 1) throw Error('invalid template')
        arr.splice(-1, 1)
    }
    return arr.length > 1 ? arr : code
}

for (const i of result.outputFiles) {
    // @ts-ignore
    raw[/([^/\\]+)\.js$/i.exec(i.path)[1]] = toTemplate(i.text)
}

{
    const rawCode = fs.readFileSync('src/template/base128.js').toString()
    const minifyOutput = minify_sync(rawCode, {
        module: true,
        format: {
            wrap_iife: false,
        },
        compress: {
            module: true,
            evaluate: false,
        }
    })
    // @ts-ignore
    raw.base128 = toTemplate(minifyOutput.code)
}

const templateRawFileImportPath = './templateRaw.js'
const templateRawFileDistPath = '_dist/templateRaw.ts'

const templateRawDTS = fs.readFileSync('src/templateRaw.d.ts').toString()

fs.writeFileSync(templateRawFileDistPath, templateRawDTS.replace('/*={}*/', () => ` = ${JSON.stringify(raw, null, 2)}`))


// bundle

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
            [templateRawFileImportPath]: '../' + templateRawFileDistPath,
        },
    },
})
