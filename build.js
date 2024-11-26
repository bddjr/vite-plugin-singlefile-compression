import esbuild from 'esbuild'
import fs from 'fs'

const result = esbuild.buildSync({
    entryPoints: [
        "src/template.js",
        "src/template-assets.js",
    ],
    outdir: "dist",
    minifyWhitespace: true,
    write: false,
})

for (const i of result.outputFiles) {
    fs.writeFileSync(i.path, i.text.replace(/;?\n?$/, ''))
}
