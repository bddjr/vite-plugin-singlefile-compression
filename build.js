import fs from 'fs'
import path from 'path'

import { minify_sync } from 'terser'
import { build as rolldownBuild } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

for (const dir of ['dist', '_dist']) {
    fs.rmSync(dir, { recursive: true, force: true })
    fs.mkdirSync(dir)
}

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

for (const filename of fs.globSync('src/template/*.js')) {
    const rawCode = fs.readFileSync(filename).toString()
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
    raw[/([^/\\]+)\.js$/i.exec(filename)[1]] = toTemplate(minifyOutput.code)
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
