import { NextRequest, NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
import { enforceRateLimit } from '@/lib/security/rate-limit'
import { generateLessonDraft } from '@/lib/ai/lesson-generator'
import { safeObjectName, signatureMatches, teacherAllowedMimeTypes, teacherUploadMaxBytes } from '@/lib/security/file-validation'
import type { GeneratedLessonDraft } from '@/types/teacher-content'

const levels = new Set<GeneratedLessonDraft['cefrLevel']>(['A0','A1','A2','B1','B2','C1','C2'])
const languages = new Set<GeneratedLessonDraft['language']>(['fi','sv'])

async function extractSourceText(params: {
  file: File | null
  pastedText: string
  teacherId: string
  materialId: string
}) {
  const { file, pastedText, teacherId, materialId } = params
  if (pastedText.trim().length >= 20) return pastedText.trim().slice(0, 24_000)
  if (!file) return null
  if (file.type === 'text/plain' || file.type === 'text/markdown') {
    return (await file.text()).trim().slice(0, 24_000)
  }

  const processorUrl = process.env.OPIOPE_DOCUMENT_PROCESSOR_URL
  const processorSecret = process.env.OPIOPE_DOCUMENT_PROCESSOR_SECRET
  if (!processorUrl || !processorSecret) return null

  const response = await fetch(processorUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'authorization': `Bearer ${processorSecret}` },
    body: JSON.stringify({ teacherId, materialId, purpose: 'lesson-source-extraction' }),
    signal: AbortSignal.timeout(45_000),
  })
  if (!response.ok) return null
  const payload = await response.json() as { text?: string }
  return typeof payload.text === 'string' ? payload.text.trim().slice(0, 24_000) : null
}

export async function POST(request: NextRequest) {
  const access = await checkTeacherAccess(true)
  if (!access.ok) {
    const status = access.reason === 'mfa-required' ? 403 : 401
    return NextResponse.json({ error: access.reason === 'mfa-required' ? 'MFA vaaditaan.' : 'Opettajan käyttöoikeus vaaditaan.' }, { status })
  }

  const allowed = await enforceRateLimit({ request, scope: 'teacher-content-generate', identifier: access.userId, maxHits: 10, windowSeconds: 60 * 60 })
  if (!allowed) return NextResponse.json({ error: 'Luonnosten luontiraja täyttyi. Yritä myöhemmin.' }, { status: 429 })

  const admin = createAdminClient()
  if (!admin) return NextResponse.json({ error: 'Palvelin ei ole konfiguroitu.' }, { status: 503 })

  const form = await request.formData()
  const language = String(form.get('language') ?? 'fi') as GeneratedLessonDraft['language']
  const cefrLevel = String(form.get('cefrLevel') ?? 'A1').toUpperCase() as GeneratedLessonDraft['cefrLevel']
  const teacherInstruction = String(form.get('instruction') ?? '').trim().slice(0, 1200)
  const pastedText = String(form.get('sourceText') ?? '')
  const rightsConfirmed = form.get('rightsConfirmed') === 'true'
  const fileValue = form.get('file')
  const file = fileValue instanceof File && fileValue.size > 0 ? fileValue : null

  if (!languages.has(language) || !levels.has(cefrLevel)) return NextResponse.json({ error: 'Kieli tai taso ei ole sallittu.' }, { status: 400 })
  if (!rightsConfirmed) return NextResponse.json({ error: 'Vahvista, että sinulla on oikeus käyttää materiaalia opetuksessa.' }, { status: 400 })
  if (!file && pastedText.trim().length < 20) return NextResponse.json({ error: 'Lisää tiedosto tai vähintään 20 merkkiä lähdetekstiä.' }, { status: 400 })

  let storagePath: string | null = null
  let originalName: string | null = null
  let mimeType: string | null = null
  let byteSize: number | null = null

  const { data: material, error: materialInsertError } = await admin.from('teacher_materials').insert({
    teacher_id: access.userId,
    original_name: file?.name?.slice(0, 180) ?? 'Pasted text',
    mime_type: file?.type ?? 'text/plain',
    byte_size: file?.size ?? new TextEncoder().encode(pastedText).byteLength,
    language,
    cefr_level: cefrLevel,
    rights_confirmed: true,
    status: 'processing',
  }).select('id').single()

  if (materialInsertError || !material) return NextResponse.json({ error: 'Materiaalin luonnin aloitus epäonnistui.' }, { status: 500 })
  const materialId = String(material.id)

  try {
    if (file) {
      if (!teacherAllowedMimeTypes.has(file.type)) throw new Error('unsupported-file')
      if (file.size < 1 || file.size > teacherUploadMaxBytes) throw new Error('bad-size')
      const bytes = new Uint8Array(await file.arrayBuffer())
      if (!signatureMatches(file.type, bytes)) throw new Error('bad-signature')
      const bucket = process.env.OPIOPE_TEACHER_MATERIAL_BUCKET ?? 'teacher-materials'
      storagePath = safeObjectName(access.userId, file.type)
      const { error: uploadError } = await admin.storage.from(bucket).upload(storagePath, bytes, { contentType: file.type, upsert: false, cacheControl: 'private, max-age=0' })
      if (uploadError) throw new Error('upload-failed')
      originalName = file.name.slice(0, 180)
      mimeType = file.type
      byteSize = file.size
      await admin.from('teacher_materials').update({ storage_path: storagePath }).eq('id', materialId)
    }

    const sourceText = await extractSourceText({ file, pastedText, teacherId: access.userId, materialId })
    if (!sourceText) {
      await admin.from('teacher_materials').update({ status: 'awaiting-processor' }).eq('id', materialId)
      return NextResponse.json({
        materialId,
        status: 'awaiting-processor',
        message: 'Materiaali tallennettiin turvallisesti. PDF/kuva/ääni tarvitsee OCR/puheentunnistus-processorin ennen automaattista luonnosta.',
      }, { status: 202 })
    }

    const draft = await generateLessonDraft({ sourceText, language, cefrLevel, teacherInstruction })
    const { data: savedDraft, error: draftError } = await admin.from('teacher_lesson_drafts').insert({
      teacher_id: access.userId,
      material_id: materialId,
      language,
      cefr_level: cefrLevel,
      title: draft.title,
      draft_json: draft,
      source_excerpt: sourceText.slice(0, 1800),
      status: 'review-required',
      ai_model: process.env.OPIOPE_AI_MODEL ?? null,
    }).select('id').single()
    if (draftError || !savedDraft) throw new Error('draft-save-failed')

    await admin.from('teacher_materials').update({ status: 'draft-ready' }).eq('id', materialId)
    return NextResponse.json({
      materialId,
      draftId: savedDraft.id,
      status: 'review-required',
      draft,
      message: 'Oppituntiluonnos on valmis opettajan tarkistettavaksi. Sitä ei julkaistu automaattisesti.',
    })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'unknown'
    await admin.from('teacher_materials').update({ status: 'failed', failure_code: code.slice(0, 80) }).eq('id', materialId)
    if (storagePath && code !== 'draft-save-failed') {
      // Keep successfully uploaded source only when it may be useful for a retry.
    }
    const message = code === 'ai-not-configured'
      ? 'AI-luonnostin ei ole konfiguroitu. Määritä OPENAI_API_KEY ja OPIOPE_AI_MODEL.'
      : code === 'unsupported-file' ? 'Tiedostotyyppiä ei tueta.'
      : code === 'bad-size' ? 'Tiedoston koko ei ole sallittu.'
      : code === 'bad-signature' ? 'Tiedoston sisältö ei vastaa tiedostotyyppiä.'
      : 'Automaattinen oppituntiluonnos epäonnistui. Materiaalia ei julkaistu.'
    return NextResponse.json({ error: message, materialId, originalName, mimeType, byteSize }, { status: 500 })
  }
}

