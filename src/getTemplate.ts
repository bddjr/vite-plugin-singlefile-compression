import path from 'path'
import fs from 'fs'

const files = {
    base64: fs.readFileSync(
        path.join(import.meta.dirname, "template/base64.js")
    ).toString(),

    base128: fs.readFileSync(
        path.join(import.meta.dirname, "template/base128.js")
    ).toString(),

    assets: fs.readFileSync(
        path.join(import.meta.dirname, "template/assets.js")
    ).toString().split('{"":""}', 2),
}

export const template = {
    base(script: string, format: string, useBase128: boolean) {
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
}
