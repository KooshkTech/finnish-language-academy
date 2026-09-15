import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const files = [
  'components/classroom/LevelSkillClassroom.tsx',
  'components/classroom/SkillClassroom.tsx',
  'components/dictionary/DictionaryCard.tsx',
  'components/dictionary/InlineDictionaryText.tsx',
  'data/qa-sessions.ts',
]
const forbiddenVisible = [
  'in the morning', 'bus stop', 'shopping list', 'Time of day',
  '>Save word<', '>Log in to save<', '>Morphology<', '>Collocations<', '>Synonyms<', '>Antonyms<',
  'Test & Assessment',
]
let failures = []
for (const rel of files) {
  const text = fs.readFileSync(path.join(root, rel), 'utf8')
  for (const phrase of forbiddenVisible) {
    if (text.includes(phrase)) failures.push(`${rel}: ${phrase}`)
  }
}
if (failures.length) {
  console.error('Course-language audit failed:')
  for (const item of failures) console.error(`- ${item}`)
  process.exit(1)
}
console.log('Course-language audit passed for known Finnish UI leakage patterns.')

