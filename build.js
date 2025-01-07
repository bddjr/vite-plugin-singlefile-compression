import esbuild from 'esbuild'
import fs from 'fs'

let result = esbuild.buildSync({
    entryPoints: [
        "src/template.js",
        "src/template-assets.js",
    ],
    outdir: "dist",
    minifyWhitespace: true,
    write: false,
})

if (result.errors.length)
    throw result.errors

for (const i of result.outputFiles) {
    fs.writeFileSync(i.path, i.text.replace(/;?\n?$/, ''))
}

result = esbuild.buildSync({
    entryPoints: [
        "src/template-base128.js",
    ],
    outdir: "dist",
    minify: true,
    bundle: true,
    write: false,
})

if (result.errors.length)
    throw result.errors

for (const i of result.outputFiles) {
    fs.writeFileSync(i.path,
        i.text
            .replace(/^\(\(\)=>\{/, '')
            .replace(/;?\}\)\(\);\n$/, ''))
}
