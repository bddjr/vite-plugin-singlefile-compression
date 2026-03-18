import fs from 'fs'
import path from 'path'

import esbuild from 'esbuild'

import packageJson from './package.json' with {type: 'json'}

fs.writeFileSync('dist/getVersion.js', `export var version=` + JSON.stringify(packageJson.version))

let result = esbuild.buildSync({
    entryPoints: fs.globSync('src/template/*.js'),
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
        return !id.startsWith('.') && !id.startsWith('/') && !id.includes('\\');
    },
    platform: 'node',
    plugins: [
        dts()
    ],
})
