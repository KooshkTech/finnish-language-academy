import type { AssessmentReport } from "@/types/assessment"

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)").replace(/[^\x20-\x7E]/g, "?")
}

export function createTextPdf(title: string, lines: string[]): Uint8Array {
  const visible = [title, "", ...lines].slice(0, 46)
  const content = ["BT", "/F1 11 Tf", "50 790 Td", ...visible.flatMap((line,index)=>index === 0 ? [`(${escapePdfText(line)}) Tj`] : ["0 -16 Td", `(${escapePdfText(line)}) Tj`]), "ET"].join("\n")
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${Buffer.byteLength(content, "ascii")} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ]
  let pdf = "%PDF-1.4\n"
  const offsets = [0]
  objects.forEach((object,index)=>{ offsets.push(Buffer.byteLength(pdf,"ascii")); pdf += `${index+1} 0 obj\n${object}\nendobj\n` })
  const xrefOffset = Buffer.byteLength(pdf,"ascii")
  pdf += `xref\n0 ${objects.length+1}\n0000000000 65535 f \n`
  for (let i=1;i<offsets.length;i++) pdf += `${String(offsets[i]).padStart(10,"0")} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new TextEncoder().encode(pdf)
}

export function createAssessmentPdf(report: AssessmentReport): Uint8Array {
  const lines = [
    `Completed: ${new Date(report.completedAt).toLocaleString("en-GB")}`,
    `Score: ${report.correctItems}/${report.totalItems} (${report.percentage}%)`,
    `Grade: ${report.letterGrade}`,
    `Practice band: ${report.practiceBand}`,
    "",
    report.disclaimer,
    "",
    ...report.items.flatMap((item,index)=>[
      `${index+1}. ${item.question}`,
      `Student: ${item.selectedAnswer ?? "No answer"}`,
      `Correct: ${item.correctAnswer}`,
      `${item.isCorrect ? "Correct" : "Needs review"}: ${item.explanation}`,
      "",
    ]),
  ]
  return createTextPdf(`OpiOpe Assessment Report - ${report.moduleTitle}`, lines)
}

