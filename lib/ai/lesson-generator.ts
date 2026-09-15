import type { GeneratedLessonDraft } from '@/types/teacher-content'

const lessonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['language','cefrLevel','title','objective','sourceSummary','lesson','vocabulary','grammar','blackboard','exercises','flashcards','test','teacherNotes','limitations'],
  properties: {
    language: { type: 'string', enum: ['fi','sv'] },
    cefrLevel: { type: 'string', enum: ['A0','A1','A2','B1','B2','C1','C2'] },
    title: { type: 'string' },
    objective: { type: 'string' },
    sourceSummary: { type: 'string' },
    lesson: {
      type: 'object', additionalProperties: false, required: ['theory','examples'], properties: {
        theory: { type: 'array', items: { type: 'string' } },
        examples: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['target','translation','note'], properties: {
          target: { type: 'string' }, translation: { type: 'string' }, note: { type: 'string' }
        } } }
      }
    },
    vocabulary: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['term','meaning','example'], properties: {
      term: { type: 'string' }, meaning: { type: 'string' }, example: { type: 'string' }
    } } },
    grammar: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['title','explanation','examples'], properties: {
      title: { type: 'string' }, explanation: { type: 'string' }, examples: { type: 'array', items: { type: 'string' } }
    } } },
    blackboard: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['heading','body','emphasis'], properties: {
      heading: { type: 'string' }, body: { type: 'string' }, emphasis: { type: 'string', enum: ['normal','root','suffix','warning'] }
    } } },
    exercises: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['type','prompt','options','answer','explanation'], properties: {
      type: { type: 'string', enum: ['multiple_choice','fill_blank','sentence_order','matching','error_correction'] },
      prompt: { type: 'string' }, options: { type: 'array', items: { type: 'string' } }, answer: { type: 'string' }, explanation: { type: 'string' }
    } } },
    flashcards: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['front','back'], properties: {
      front: { type: 'string' }, back: { type: 'string' }
    } } },
    test: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['prompt','options','answer','explanation'], properties: {
      prompt: { type: 'string' }, options: { type: 'array', items: { type: 'string' } }, answer: { type: 'string' }, explanation: { type: 'string' }
    } } },
    teacherNotes: { type: 'array', items: { type: 'string' } },
    limitations: { type: 'array', items: { type: 'string' } }
  }
} as const

function responseText(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const record = payload as Record<string, unknown>
  if (typeof record.output_text === 'string') return record.output_text
  const output = Array.isArray(record.output) ? record.output : []
  for (const item of output) {
    if (!item || typeof item !== 'object') continue
    const content = Array.isArray((item as Record<string, unknown>).content) ? (item as Record<string, unknown>).content as unknown[] : []
    for (const part of content) {
      if (part && typeof part === 'object' && typeof (part as Record<string, unknown>).text === 'string') return (part as Record<string, string>).text
    }
  }
  return null
}

export async function generateLessonDraft(input: { sourceText: string; language: 'fi'|'sv'; cefrLevel: GeneratedLessonDraft['cefrLevel']; teacherInstruction?: string }): Promise<GeneratedLessonDraft> {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPIOPE_AI_MODEL
  if (!apiKey || !model) throw new Error('ai-not-configured')

  const trimmedSource = input.sourceText.trim().slice(0, 24_000)
  if (trimmedSource.length < 20) throw new Error('source-too-short')

  const instructions = [
    'You are OpiOpe lesson-draft generator for a human teacher.',
    'Generate a pedagogically coherent DRAFT only. Never claim official YKI or CEFR certification.',
    'Use only information supported by the supplied source, plus ordinary language-teaching knowledge needed to explain it.',
    'Do not reproduce long copyrighted passages from the source. Summarize and create original exercises/examples.',
    'For Finnish, distinguish kirjakieli and puhekieli when relevant. For Swedish, do not invent Finnish YKI claims.',
    'Make difficulty appropriate to the requested CEFR level.',
    'The human teacher must review before publication, so list uncertainties or assumptions in limitations.',
    'Generate 5-8 vocabulary items, 1-3 grammar points, 5 exercises across varied types when feasible, 6 flashcards, and 5 test questions.',
  ].join(' ')

  const userText = `Language: ${input.language}\nCEFR: ${input.cefrLevel}\nTeacher instruction: ${input.teacherInstruction ?? 'none'}\n\nSOURCE MATERIAL:\n${trimmedSource}`

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'authorization': `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model,
      store: false,
      instructions,
      input: [{ role: 'user', content: [{ type: 'input_text', text: userText }] }],
      text: { format: { type: 'json_schema', name: 'opiope_lesson_draft', strict: true, schema: lessonSchema } },
      max_output_tokens: 8000,
    }),
  })

  if (!response.ok) throw new Error('ai-provider-failed')
  const payload = await response.json() as unknown
  const text = responseText(payload)
  if (!text) throw new Error('ai-empty-response')
  return JSON.parse(text) as GeneratedLessonDraft
}

