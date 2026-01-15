import fs from 'fs'
import { fileURLToPath } from 'url'

export const version = JSON.parse(
    fs.readFileSync(
        fileURLToPath(new URL("../package.json", import.meta.url))
    ).toString()
).version as string
