import { NextRequest, NextResponse } from "next/server"
import { createAssessmentPdf } from "@/services/pdf-report"
import type { AssessmentReport } from "@/types/assessment"

function isReport(value: unknown): value is AssessmentReport {
  if (!value || typeof value !== "object") return false
  const record = value as Record<string, unknown>
  return typeof record.moduleTitle === "string" && typeof record.percentage === "number" && Array.isArray(record.items)
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json()
  if (!isReport(body)) return NextResponse.json({ error: "Invalid report payload." }, { status: 400 })
  const pdf = createAssessmentPdf(body)
  return new NextResponse(pdf, { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="opiope-${body.moduleTitle.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-report.pdf"`, "cache-control": "no-store" } })
}

