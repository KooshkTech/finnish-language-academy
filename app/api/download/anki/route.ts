import { NextRequest, NextResponse } from "next/server"

type Card = { front: string; back: string }
function isCard(value: unknown): value is Card { return Boolean(value && typeof value === "object" && typeof (value as Record<string,unknown>).front === "string" && typeof (value as Record<string,unknown>).back === "string") }
function csvCell(value: string) { return `"${value.replaceAll('"','""')}"` }

export async function POST(request: NextRequest) {
  const body: unknown = await request.json()
  const record = body && typeof body === "object" ? body as Record<string,unknown> : {}
  const cards = Array.isArray(record.cards) ? record.cards.filter(isCard) : []
  if (!cards.length) return NextResponse.json({ error: "No cards supplied." }, { status: 400 })
  const csv = [["Front","Back"], ...cards.map(card=>[card.front,card.back])].map(row=>row.map(csvCell).join(",")).join("\n")
  return new NextResponse(csv, { headers: { "content-type":"text/csv; charset=utf-8", "content-disposition":"attachment; filename=opiope-anki.csv" } })
}

