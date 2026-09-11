import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const allowedFrequencies = new Set(['manual','daily','weekly','monthly','yearly'])

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Palvelua ei ole määritetty.' }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Kirjaudu sisään.' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, ui_language').eq('id', user.id).single()
  if (!profile || !['teacher','admin'].includes(profile.role)) {
    return NextResponse.json({ error: profile?.ui_language === 'sv' ? 'Du har inte behörighet.' : 'Sinulla ei ole käyttöoikeutta.' }, { status: 403 })
  }

  const body = await request.json().catch(() => null) as null | {
    topic?: string
    cefrLevel?: string
    targetLanguage?: 'fi' | 'sv'
    classId?: string | null
    frequency?: string
    specialProfile?: 'general' | 'work' | 'yki' | 'integration'
  }

  if (!body?.topic || !body.cefrLevel || !['fi','sv'].includes(body.targetLanguage ?? '')) {
    return NextResponse.json({ error: profile.ui_language === 'sv' ? 'Kontrollera uppgifterna.' : 'Tarkista tiedot.' }, { status: 400 })
  }

  const frequency = allowedFrequencies.has(body.frequency ?? '') ? body.frequency! : 'manual'
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPIOPE_AI_MODEL ?? process.env.OPENAI_QA_MODEL ?? 'gpt-5-mini'

  if (!apiKey) {
    return NextResponse.json({ error: profile.ui_language === 'sv' ? 'AI-tjänsten är inte tillgänglig just nu.' : 'Tekoälypalvelu ei ole tällä hetkellä käytettävissä.' }, { status: 503 })
  }

  const languageInstruction = body.targetLanguage === 'sv'
    ? 'Skriv allt elevinnehåll på naturlig svenska. Använd ingen engelska.'
    : 'Kirjoita kaikki opiskelijalle näkyvä sisältö luonnollisella suomen kielellä. Älä käytä englantia.'

  const prompt = `Olet OPIOPE-opettajan avustaja. Luo vain luonnos, ei julkaistavaa sisältöä ilman opettajan hyväksyntää.\n${languageInstruction}\nCEFR: ${body.cefrLevel}\nAihe: ${body.topic}\nKurssityyppi: ${body.specialProfile ?? 'general'}\nJos kurssityyppi on integration, painota käytännön asiointia Suomessa: terveys, asuminen, työ, palvelut, viranomaisasiointi ja arjen puhekieli.\nPalauta JSON: title, objectives, vocabulary, reading, listeningScript, grammar, exercises, speaking, writing, masteryTest, teacherNotes.`

  const aiResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, input: prompt }),
  })

  if (!aiResponse.ok) {
    return NextResponse.json({ error: profile.ui_language === 'sv' ? 'AI-utkastet kunde inte skapas.' : 'Tekoälyluonnosta ei voitu luoda.' }, { status: 502 })
  }

  const payload = await aiResponse.json() as { output_text?: string }
  let content: unknown = payload.output_text ?? ''
  try { content = JSON.parse(payload.output_text ?? '{}') } catch {}

  const lessonKey = `draft-${Date.now()}`
  const { data: latest } = await supabase.from('lesson_versions').select('version').eq('lesson_key', lessonKey).order('version', { ascending: false }).limit(1).maybeSingle()
  const version = (latest?.version ?? 0) + 1

  const { data: saved, error: saveError } = await supabase.from('lesson_versions').insert({
    lesson_key: lessonKey,
    version,
    teacher_id: user.id,
    class_id: body.classId ?? null,
    source: 'llm',
    model,
    content,
    status: 'draft',
  }).select('id, lesson_key, version, status').single()

  if (saveError) return NextResponse.json({ error: saveError.message }, { status: 500 })

  if (frequency !== 'manual') {
    await supabase.from('recurring_lesson_plans').insert({
      teacher_id: user.id,
      class_id: body.classId ?? null,
      target_language: body.targetLanguage,
      cefr_level: body.cefrLevel,
      topic: body.topic,
      skill_focus: [],
      frequency,
      is_active: true,
      requires_teacher_approval: true,
    })
  }

  return NextResponse.json({ draft: saved, content })
}
