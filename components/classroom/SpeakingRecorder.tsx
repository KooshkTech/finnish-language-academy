"use client"
import { useRef, useState } from "react"

export function SpeakingRecorder() {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) { setMessage("Tallennus ei ole käytettävissä tässä selaimessa."); return }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = event => { if (event.data.size) chunksRef.current.push(event.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" })
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }
      recorder.start(); setRecording(true); setMessage("")
    } catch { setMessage("Mikrofonilupaa ei saatu.") }
  }

  function stop() { recorderRef.current?.stop(); setRecording(false) }

  return <div className="recorder-card"><h3>Äänitä oma puheesi</h3><p>Tallenne pysyy selaimessasi. OpiOpe ei väitä arvioivansa ääntämistä ilman erikseen määritettyä puhepalvelua.</p><div className="recorder-actions">{recording ? <button onClick={stop}>Lopeta tallennus</button> : <button onClick={start}>Aloita tallennus</button>}{audioUrl && <audio controls src={audioUrl} />}</div>{message && <p className="module-notice">{message}</p>}</div>
}

