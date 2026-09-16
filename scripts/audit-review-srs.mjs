import fs from 'node:fs'

const required = [
  'app/review/page.tsx',
  'components/review/ReviewCenter.tsx',
  'components/review/AddToReviewButton.tsx',
  'services/client-review.ts',
  'supabase/migrations/20260914060000_review_srs_language.sql',
]
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing V24.10 review file: ${file}`)
}
const review = fs.readFileSync('components/review/ReviewCenter.tsx','utf8')
for (const token of ['reviewWord(', 'vocabulary_progress', 'exercise_attempts', 'correct_answer', 'learning_language']) {
  if (!review.includes(token)) throw new Error(`Review center missing: ${token}`)
}
const fi = fs.readFileSync('components/classroom/LevelSkillClassroom.tsx','utf8')
const sv = fs.readFileSync('components/classroom/SwedishLevelSkillClassroom.tsx','utf8')
if (!fi.includes('AddToReviewButton language="fi"')) throw new Error('Finnish flashcards are not connected to SRS')
if (!sv.includes('AddToReviewButton language="sv"')) throw new Error('Swedish flashcards are not connected to SRS')
console.log('V24.10 review + SRS audit passed.')

