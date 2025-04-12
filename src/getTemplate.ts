import fs from 'fs'
import { fileURLToPath } from 'url'
import { compress, compressFormat } from './compress.js'

function r(name: string) {
    return fs.readFileSync(
        fileURLToPath(import.meta.resolve(`./template/${name}.js`))
    ).toString()
}

function rt(name: string, template: string) {
    const s = r(name).split(template, 2)
    if (s.length !== 2) throw "s.length!==2"
    return s
}

const files = {
    base64: r('base64'),
    base128: r('base128'),
    assets: rt('assets', '{"":""}'),
    css: rt('css', '"<style>"'),
    icon: rt('icon', '"<icon>"'),
    importmeta: rt('importmeta', '"<path>"'),
}

export const template = {
    base(script: string, format: compressFormat, useBase128: boolean) {
        script = compress(format, script, useBase128)
        if (useBase128) {
            return files.base128
                .replace("<format>", format)
                .split('"<script>"', 2).join(script)
        }
        return files.base64
            .replace("<format>", format)
            .split("<script>", 2).join(script)
    },
    assets(assetsJSON: string) {
        return files.assets.join(assetsJSON)
    },
    css(cssSource: string) {
        return files.css.join(JSON.stringify(cssSource))
    },
    icon(dataURL: string) {
        return files.icon.join(JSON.stringify(dataURL))
    },
    importmeta(p: string) {
        return files.importmeta.join(JSON.stringify(p))
    },
}
