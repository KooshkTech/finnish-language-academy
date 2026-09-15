"use client"
import { ChangeEvent, useRef, useState } from "react"

const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp", "audio/mpeg", "audio/wav", "audio/x-wav"]

function downloadBlob(name: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url)
}

export function UniversalTools({ title, flashcards = [] }: { title: string; flashcards?: Array<{ front: string; back: string }> }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState("PDF, kuva tai MP3/WAV · max 15 MB")
  const [busy, setBusy] = useState(false)

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!allowedTypes.includes(file.type)) { setMessage("Tiedostotyyppiä ei tueta."); return }
    if (file.size > 15 * 1024 * 1024) { setMessage("Tiedosto on yli 15 MB."); return }
    const form = new FormData(); form.append("file", file); form.append("context", title)
    setBusy(true); setMessage("Tallennetaan…")
    try {
      const response = await fetch("/api/uploads", { method: "POST", body: form })
      const result = await response.json() as { message?: string; error?: string }
      setMessage(result.message ?? result.error ?? "Valmis")
    } catch { setMessage("Lataus epäonnistui. Tarkista verkkoyhteys.") } finally { setBusy(false); event.target.value = "" }
  }

  function downloadAnki() {
    const rows = [["Etupuoli","Takapuoli"], ...flashcards.map(card=>[card.front,card.back])]
    const csv = rows.map(row=>row.map(cell=>`"${cell.replaceAll('"','""')}"`).join(",")).join("\n")
    downloadBlob(`${title.toLowerCase().replace(/\s+/g,"-")}-anki.csv`, csv, "text/csv;charset=utf-8")
  }

  async function downloadStudySheet() {
    const response = await fetch("/api/download/study-sheet", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({ title:`OpiOpe-opiskelulomake — ${title}`, lines:flashcards.map(card=>`${card.front} — ${card.back}`) }) })
    if (!response.ok) { setMessage("PDF-opiskelulomakkeen luonti epäonnistui."); return }
    const blob = await response.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${title.toLowerCase().replace(/\s+/g,"-")}-study-sheet.pdf`; a.click(); URL.revokeObjectURL(url)
  }

  return <details className="universal-tools" aria-label="Lataus- ja vientityökalut">
    <summary><strong>Työkalut</strong><span>Lataa · Anki · PDF</span></summary>
    <div><strong>Materiaalin lataus</strong><span>{message}</span></div>
    <div className="universal-tool-actions">
      <input ref={inputRef} hidden type="file" accept=".pdf,image/*,.mp3,.wav,audio/mpeg,audio/wav" onChange={upload}/>
      <button type="button" disabled={busy} onClick={()=>inputRef.current?.click()}>{busy ? "Ladataan…" : "Lataa materiaali"}</button>
      <button type="button" disabled={!flashcards.length} onClick={downloadAnki}>Anki CSV</button>
      <button type="button" onClick={()=>void downloadStudySheet()}>PDF-opiskelulomake</button>
    </div>
    <small>OCR/Whisper-käsittely suoritetaan vain, jos palvelinprovider on konfiguroitu. Tallennus ei tarkoita automaattista analyysiä.</small>
  </details>
}

