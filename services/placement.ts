import type { CefrLevel, LearningLanguage, PlacementResult } from '@/types/learning'
import { placementQuestions } from '@/data/learning'

const orderedLevels: CefrLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']

type PlacementQuestion = { id: string; category: string; answer: string }

export function scorePlacement(answers: Record<string, string>, questions: readonly PlacementQuestion[] = placementQuestions, language: LearningLanguage = 'fi'): PlacementResult {
  const categoryScores: PlacementResult['categoryScores'] = {}
  let correct = 0
  questions.forEach((q) => {
    const cat = categoryScores[q.category] ?? { correct: 0, total: 0 }
    cat.total += 1
    if (answers[q.id] === q.answer) { cat.correct += 1; correct += 1 }
    categoryScores[q.category] = cat
  })
  const ratio = correct / questions.length
  const index = Math.min(orderedLevels.length - 1, Math.max(0, Math.floor(ratio * orderedLevels.length)))
  const estimatedLevel = orderedLevels[index]
  const recommendedLesson = estimatedLevel === 'A0' ? 'a0-start' : estimatedLevel === 'A1' ? 'a1-arki-1' : `${estimatedLevel.toLowerCase()}-continue`
  return { language, estimatedLevel, score: correct, total: questions.length, categoryScores, recommendedLesson: language === 'sv' ? 'sv-a1-vardag-1' : recommendedLesson, completedAt: new Date().toISOString() }
}
