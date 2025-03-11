import fs from 'fs'
import { fileURLToPath } from 'url'

const files = {
    base64: fs.readFileSync(
        fileURLToPath(import.meta.resolve("./template/base64.js"))
    ).toString(),

    base128: fs.readFileSync(
        fileURLToPath(import.meta.resolve("./template/base128.js"))
    ).toString(),

    base128_brotli: fs.readFileSync(
        fileURLToPath(import.meta.resolve("./template/base128-brotli.js"))
    ).toString(),

    assets: fs.readFileSync(
        fileURLToPath(import.meta.resolve("./template/assets.js"))
    ).toString().split('{"":""}', 2),

    resolve: fs.readFileSync(
        fileURLToPath(import.meta.resolve("./template/resolve.js"))
    ).toString(),
}

export const template = {
    base(script: string, format: string, useBase128: boolean) {
        if (["br","brotli"].includes(format)){
            return files.base128_brotli
            .split('"<script>"', 2).join(script)
        }
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
    resolve: files.resolve,
}
