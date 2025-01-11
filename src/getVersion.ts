import fs from 'fs'
import path from 'path'

export const { version } = JSON.parse(
    fs.readFileSync(
        path.join(import.meta.dirname, "../package.json")
    ).toString()
) as { version: string }
