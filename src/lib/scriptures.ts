import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { Scripture, ScriptureSchema } from './schemas/scripture'

const SCRIPTURES_DIR = join(process.cwd(), 'src/data/scriptures')

export async function getAllScriptures(): Promise<Scripture[]> {
    try {
        const files = readdirSync(SCRIPTURES_DIR).filter(file => file.endsWith('.json'))
        const scriptures = files.map(file => {
            const content = readFileSync(join(SCRIPTURES_DIR, file), 'utf8')
            const data = JSON.parse(content)
            return ScriptureSchema.parse(data)
        })

        return scriptures.sort((a, b) => a.title.localeCompare(b.title))
    } catch (error) {
        console.error('Error loading scriptures:', error)
        return []
    }
}

export async function getScriptureBySlug(slug: string): Promise<Scripture | null> {
    try {
        const content = readFileSync(join(SCRIPTURES_DIR, `${slug}.json`), 'utf8')
        const data = JSON.parse(content)
        return ScriptureSchema.parse(data)
    } catch (error) {
        console.error('Error loading scripture:', error)
        return null
    }
}
