import { NextRequest, NextResponse } from 'next/server'
import { enforceRateLimit } from '@/lib/security/rate-limit'
import { createClient } from '@/lib/supabase/server'
import type { QAEvaluationResponse, QAQuestion } from '@/types/qa'

type EvaluationRequest = { question?: QAQuestion; studentInputText?: string; learningLanguage?: 'fi' | 'sv'; nextQuestionText?: string }

function normalize(value: string) {
  return value.toLocaleLowerCase('fi-FI').normalize('NFKC').replace(/[^a-zåäö0-9\s-]/gi, ' ').replace(/\s+/g, ' ').trim()
}

function safeScore(input: string, expectedKeywords: string[]) {
  const haystack = normalize(input)
  const keywords = expectedKeywords.map(normalize).filter(Boolean)
  if (!haystack) return 0
  if (!keywords.length) return Math.min(100, 40 + Math.round(Math.min(haystack.length, 120) / 2))
  const hits = keywords.filter(keyword => haystack.includes(keyword)).length
  const coverage = hits / keywords.length
  const lengthBonus = Math.min(20, Math.floor(haystack.split(' ').length / 3) * 5)
  return Math.min(100, Math.round(coverage * 80) + lengthBonus)
}

function extractResponseText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return ''
  const record = payload as Record<string, unknown>
  if (typeof record.output_text === 'string') return record.output_text
  if (!Array.isArray(record.output)) return ''
  const chunks: string[] = []
  for (const item of record.output) {
    if (!item || typeof item !== 'object') continue
    const content = (item as Record<string, unknown>).content
    if (!Array.isArray(content)) continue
    for (const part of content) {
      if (!part || typeof part !== 'object') continue
      const text = (part as Record<string, unknown>).text
      if (typeof text === 'string') chunks.push(text)
    }
  }
  return chunks.join('\n')
}

function fallback(question: QAQuestion, studentInputText: string, nextQuestionText?: string): QAEvaluationResponse {
  const scorePercentage = safeScore(studentInputText, question.expectedKeywords)
  const isCorrect = scorePercentage >= 65
  return {
    questionId: question.id,
    skillType: question.skillType,
    cefrLevel: question.cefrLevel,
    studentInputText,
    isCorrect,
    scorePercentage,
    evaluationMode: 'key-point-check',
    feedback: {
      overallSummary: isCorrect
        ? 'Vastauksessa löytyi tehtävän keskeisiä asioita. Tämä on avainsanoihin perustuva harjoituspalaute, ei täydellinen kielioppianalyysi.'
        : 'Vastauksesta puuttuu vielä osa tehtävän keskeisistä asioista. Vertaa mallivastaukseen ja yritä uudelleen.',
      grammarCorrections: [],
      pronunciationStatus: question.inputMode === 'voice'
        ? 'Puhe voidaan transkriboida, mutta fonetiikka- ja pitch-pisteitä ei arvioida ilman erillistä audiosignaalin arviointipalvelua.'
        : undefined,
      vocabularySuggestions: question.dictionaryHeadwords?.slice(0, 3).map(word => ({ word, suggestion: word, reason: 'Kertaa tämä sana OpiOpe Advanced Dictionaryssa ja SRS-kertauksessa.' })),
    },
    modelAnswer: question.modelAnswer,
    nextQuestionPrompt: nextQuestionText ? { questionText: nextQuestionText } : undefined,
  }
}

function isEvaluation(value: unknown): value is Partial<QAEvaluationResponse> {
  return Boolean(value && typeof value === 'object')
}

export async function POST(request: NextRequest) {
  const body = await request.json() as EvaluationRequest
  const question = body.question
  const studentInputText = body.studentInputText?.trim() ?? ''
  if (!question || !question.id || !studentInputText) return NextResponse.json({ error: 'Kysymys tai vastaus puuttuu.' }, { status: 400 })
  if (studentInputText.length > 5000) return NextResponse.json({ error: 'Vastaus on liian pitkä.' }, { status: 413 })

  const supabase = await createClient()
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id : undefined
  const allowed = await enforceRateLimit({ request, scope: 'qa-evaluate', identifier: userId, maxHits: userId ? 120 : 25, windowSeconds: 60 * 60 })
  if (!allowed) return NextResponse.json({ error: 'Harjoitusraja täyttyi hetkeksi. Yritä myöhemmin.' }, { status: 429 })

  const key = process.env.OPENAI_API_KEY
  if (!key) return NextResponse.json(fallback(question, studentInputText, body.nextQuestionText))

  const schemaGuide = {
    isCorrect: true,
    scorePercentage: 0,
    overallSummary: 'short Finnish learner feedback',
    grammarCorrections: [{ originalPhrase: '', correctedPhrase: '', ruleExplanation: '' }],
    registerNote: { currentRegister: 'Kirjakieli', alternativeRegisterForm: '' },
    vocabularySuggestions: [{ word: '', suggestion: '', reason: '' }],
  }
  const instructions = [
    'You are OpiOpe answer evaluator for Finnish/Swedish language learning.',
    `CEFR practice level: ${question.cefrLevel}. Skill: ${question.skillType}.`,
    'Evaluate task fulfilment, grammar, vocabulary and register only from the supplied text.',
    'Do NOT invent pronunciation, pitch, phoneme, emotion, identity, official CEFR or official YKI scores.',
    'If the input came from speech, text alone is insufficient for phonetic scoring.',
    'For Finnish, explain relevant case, word-order, object, consonant-gradation or kirjakieli/puhekieli issues concisely.',
    'Return JSON only, no markdown. scorePercentage is an OpiOpe practice score, not an official assessment.',
    `Required shape: ${JSON.stringify(schemaGuide)}`,
  ].join(' ')
  const input = JSON.stringify({ question: question.prompt, stimulus: question.stimulusText ?? question.passage ?? null, expectedKeywords: question.expectedKeywords, modelAnswer: question.modelAnswer, studentInputText })

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.OPENAI_QA_MODEL ?? process.env.OPENAI_TUTOR_MODEL ?? 'gpt-5.6-luna', instructions, input, max_output_tokens: 1000 }),
      signal: AbortSignal.timeout(45_000),
    })
    if (!response.ok) return NextResponse.json(fallback(question, studentInputText, body.nextQuestionText))
    const raw = extractResponseText(await response.json())
    const parsed: unknown = JSON.parse(raw.replace(/^```json\s*|```$/g, '').trim())
    if (!isEvaluation(parsed)) return NextResponse.json(fallback(question, studentInputText, body.nextQuestionText))
    const record = parsed as Record<string, unknown>
    const grammarCorrections = Array.isArray(record.grammarCorrections) ? record.grammarCorrections : []
    const vocabularySuggestions = Array.isArray(record.vocabularySuggestions) ? record.vocabularySuggestions : []
    const register = record.registerNote && typeof record.registerNote === 'object' ? record.registerNote as { currentRegister?: string; alternativeRegisterForm?: string } : undefined
    const score = typeof record.scorePercentage === 'number' ? Math.max(0, Math.min(100, Math.round(record.scorePercentage))) : safeScore(studentInputText, question.expectedKeywords)
    const result: QAEvaluationResponse = {
      questionId: question.id,
      skillType: question.skillType,
      cefrLevel: question.cefrLevel,
      studentInputText,
      isCorrect: typeof record.isCorrect === 'boolean' ? record.isCorrect : score >= 65,
      scorePercentage: score,
      evaluationMode: 'ai',
      feedback: {
        overallSummary: typeof record.overallSummary === 'string' ? record.overallSummary : 'Vastaus arvioitiin.',
        grammarCorrections: grammarCorrections.filter(item => item && typeof item === 'object').slice(0, 6).map(item => {
          const correction = item as Record<string, unknown>
          return { originalPhrase: String(correction.originalPhrase ?? ''), correctedPhrase: String(correction.correctedPhrase ?? ''), ruleExplanation: String(correction.ruleExplanation ?? '') }
        }),
        pronunciationStatus: question.inputMode === 'voice' ? 'Transkriptiota voidaan arvioida kieliopillisesti, mutta fonetiikka/pitch vaatii erillisen audiosignaalin arviointiadapterin.' : undefined,
        registerNote: register && (register.currentRegister === 'Kirjakieli' || register.currentRegister === 'Puhekieli') ? { currentRegister: register.currentRegister, alternativeRegisterForm: String(register.alternativeRegisterForm ?? '') } : undefined,
        vocabularySuggestions: vocabularySuggestions.filter(item => item && typeof item === 'object').slice(0, 4).map(item => {
          const suggestion = item as Record<string, unknown>
          return { word: String(suggestion.word ?? ''), suggestion: String(suggestion.suggestion ?? ''), reason: String(suggestion.reason ?? '') }
        }),
      },
      modelAnswer: question.modelAnswer,
      nextQuestionPrompt: body.nextQuestionText ? { questionText: body.nextQuestionText } : undefined,
    }
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(fallback(question, studentInputText, body.nextQuestionText))
  }
}

