import { NextRequest, NextResponse } from "next/server"
import { dictionaryEntries, normalizeDictionaryQuery } from "@/data/dictionary"
import { enforceRateLimit } from "@/lib/security/rate-limit"
import { createClient } from "@/lib/supabase/server"

type TutorRequest = { question?: string; level?: string; learningLanguage?: "fi" | "sv"; ageTier?: "kids" | "youth" | "adult" }

function extractResponseText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return ""
  const record = payload as Record<string, unknown>
  if (typeof record.output_text === "string") return record.output_text
  if (!Array.isArray(record.output)) return ""
  const chunks: string[] = []
  for (const item of record.output) {
    if (!item || typeof item !== "object") continue
    const content = (item as Record<string,unknown>).content
    if (!Array.isArray(content)) continue
    for (const part of content) {
      if (!part || typeof part !== "object") continue
      const text = (part as Record<string,unknown>).text
      if (typeof text === "string") chunks.push(text)
    }
  }
  return chunks.join("\n")
}

export async function POST(request: NextRequest) {
  const body = await request.json() as TutorRequest
  const question = body.question?.trim()
  if (!question) return NextResponse.json({ error: "Kysymys puuttuu." }, { status: 400 })
  if (question.length > 1500) return NextResponse.json({ error: "Kysymys on liian pitkä." }, { status: 413 })
  const supabase = await createClient()
  const userId = supabase ? (await supabase.auth.getUser()).data.user?.id : undefined
  const allowed = await enforceRateLimit({ request, scope: "ai-tutor", identifier: userId, maxHits: userId ? 30 : 8, windowSeconds: 60 * 60 })
  if (!allowed) return NextResponse.json({ error: "AI-kyselyraja täyttyi. Yritä myöhemmin." }, { status: 429 })
  const key = process.env.OPENAI_API_KEY
  if (!key) return NextResponse.json({ error: "AI-opettaja ei ole vielä käytettävissä. OPENAI_API_KEY puuttuu palvelinympäristöstä." }, { status: 503 })

  const ageTone = body.ageTier === "kids" ? "warm, short, playful, positive-only" : body.ageTier === "youth" ? "natural, concise, relatable" : "clear, rigorous, Socratic, professional"
  const language = body.learningLanguage === "sv" ? "Swedish" : "Finnish"
  const instructions = [
    `You are OpiOpe's Socratic ${language} teacher.`,
    `Learner level: ${body.level ?? "A2"}. Teaching tone: ${ageTone}.`,
    "Explain WHY, not only the answer. Ask at most one useful follow-up question.",
    "For Finnish, explicitly distinguish kirjakieli and puhekieli when relevant.",
    "Never claim official YKI/CEFR scoring, accreditation, or certainty you do not have.",
    "Do not provide legal, immigration, or medical advice; keep such scenarios language-focused.",
    "Keep the response useful on a classroom blackboard: short sections, examples, and one rule summary.",
  ].join(" ")

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.OPENAI_TUTOR_MODEL ?? "gpt-5.6-luna", instructions, input: question, max_output_tokens: 900 }),
    signal: AbortSignal.timeout(45_000),
  })
  if (!response.ok) {
    const detail = await response.text()
    console.error("AI provider failed", response.status, detail.slice(0, 180))
    return NextResponse.json({ error: "AI-palvelu ei vastannut. Yritä myöhemmin." }, { status: 502 })
  }
  const payload: unknown = await response.json()
  const answer = extractResponseText(payload)
  if (!answer) return NextResponse.json({ error: "AI-provider returned no readable answer." }, { status: 502 })

  const normalizedQuestion = normalizeDictionaryQuery(question)
  const dictionaryMatches = dictionaryEntries.filter(entry => normalizedQuestion.includes(entry.normalizedHeadword) || entry.synonyms.some(s => normalizedQuestion.includes(normalizeDictionaryQuery(s)))).slice(0, 3).map(entry => ({ headword: entry.headword, ipa: entry.ipaPhonetic, definition: entry.definitions[0]?.definitionEn ?? "" }))
  return NextResponse.json({ answer, blackboard: { title: "AI-opettajan selitys", body: answer.slice(0, 900) }, dictionaryMatches })
}

