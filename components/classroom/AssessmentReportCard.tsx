"use client"
import { useMemo, useState } from "react"
import type { AssessmentReport } from "@/types/assessment"

interface Question { question: string; options: string[]; answer: string; explanation: string; dictionaryHeadwords?: string[] }

function grade(percentage: number): AssessmentReport["letterGrade"] {
  if (percentage >= 90) return "A"; if (percentage >= 80) return "B"; if (percentage >= 70) return "C"; if (percentage >= 60) return "D"; if (percentage >= 50) return "E"; return "F"
}
function practiceBand(percentage: number): AssessmentReport["practiceBand"] {
  if (percentage >= 95) return "C2"; if (percentage >= 88) return "C1"; if (percentage >= 78) return "B2"; if (percentage >= 68) return "B1"; if (percentage >= 55) return "A2"; if (percentage >= 35) return "A1"; return "A0"
}

export function AssessmentReportCard({ title, questions, onSubmitted }: { title: string; questions: Question[]; onSubmitted?: (answers: Record<number,string>, report: AssessmentReport) => void | Promise<void> }) {
  const [answers, setAnswers] = useState<Record<number,string>>({})
  const [submitted, setSubmitted] = useState(false)
  const report = useMemo<AssessmentReport>(()=>{
    const items = questions.map((q,index)=>({ question:q.question, selectedAnswer:answers[index], correctAnswer:q.answer, isCorrect:answers[index]===q.answer, explanation:q.explanation, dictionaryHeadwords:q.dictionaryHeadwords }))
    const correctItems = items.filter(item=>item.isCorrect).length
    const percentage = questions.length ? Math.round(correctItems/questions.length*100) : 0
    return { moduleTitle:title, completedAt:new Date().toISOString(), totalItems:questions.length, correctItems, percentage, letterGrade:grade(percentage), practiceBand:practiceBand(percentage), disclaimer:"OpiOpen harjoitusarvio. Tämä ei ole virallinen CEFR- tai YKI-tulos.", items }
  },[answers,questions,title])

  async function pdf() {
    const response = await fetch("/api/download/report", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify(report) })
    if (!response.ok) return
    const blob = await response.blob(); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`${title.toLowerCase().replace(/\s+/g,"-")}-report.pdf`; a.click(); URL.revokeObjectURL(url)
  }

  return <div className="assessment-engine">
    {questions.map((q,index)=><article className="assessment-question" key={q.question}><strong>{index+1}. {q.question}</strong><div>{q.options.map(option=><button type="button" key={option} className={answers[index]===option?"selected":""} onClick={()=>!submitted&&setAnswers(current=>({...current,[index]:option}))}>{option}</button>)}</div>{submitted&&<div className={answers[index]===q.answer?"assessment-rationale good":"assessment-rationale bad"}><p><b>Sinun vastaus:</b> {answers[index]??"—"}</p><p><b>Oikea vastaus:</b> {q.answer}</p><p>{q.explanation}</p>{q.dictionaryHeadwords?.length?<p>Sanakirja: {q.dictionaryHeadwords.map(word=><a key={word} href={`/dictionary?q=${encodeURIComponent(word)}`}>{word}</a>)}</p>:null}</div>}</article>)}
    {!submitted ? <button className="primary-action" type="button" disabled={Object.keys(answers).length<questions.length} onClick={()=>{ setSubmitted(true); void onSubmitted?.(answers, report) }}>Arvioi testi</button> : <section className="report-card"><div><span>{report.percentage}%</span><strong>{report.letterGrade}</strong><small>Harjoitustaso {report.practiceBand}</small></div><p>{report.correctItems}/{report.totalItems} oikein</p><p>{report.disclaimer}</p><button type="button" onClick={pdf}>Lataa PDF-raportti</button></section>}
  </div>
}

