import { minify_sync } from 'terser'
import fs from 'fs'

/** @param {string} name */
function min(name) {
    fs.writeFileSync(`dist/${name}.js`,
        minify_sync(
            fs.readFileSync(`src/${name}.js`).toString()
        ).code
    )
}

min("template")
min("template-assets")
