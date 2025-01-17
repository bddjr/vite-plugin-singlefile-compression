import fs from 'fs'
import { fileURLToPath } from 'url'

export const { version } = JSON.parse(
    fs.readFileSync(
        fileURLToPath(import.meta.resolve("../package.json"))
    ).toString()
) as { version: string }
