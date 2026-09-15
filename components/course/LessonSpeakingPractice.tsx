'use client'

import { useRef, useState } from 'react'

export function LessonSpeakingPractice({ modelSentence }: { modelSentence: string }) {
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const currentUrlRef = useRef<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [message, setMessage] = useState('Kuuntele mallilause, sano se itse ja vertaa tallennetta.')

  function playModel() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setMessage('Selaimen puhesynteesi ei ole käytettävissä.')
      return
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(modelSentence)
    utterance.lang = 'fi-FI'
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
  }

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage('Mikrofonitallennus ei ole käytettävissä tässä selaimessa.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = event => { if (event.data.size > 0) chunksRef.current.push(event.data) }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        if (currentUrlRef.current) URL.revokeObjectURL(currentUrlRef.current)
        const nextUrl = URL.createObjectURL(blob)
        currentUrlRef.current = nextUrl
        setAudioUrl(nextUrl)
        stream.getTracks().forEach(track => track.stop())
        streamRef.current = null
        setMessage('Kuuntele oma tallenteesi ja vertaa sitä malliin. OpiOpe ei näytä keksittyä ääntämispistemäärää.')
      }
      recorderRef.current = recorder
      recorder.start()
      setRecording(true)
      setMessage('Nauhoitetaan… sano mallilause tai oma samantyyppinen lause.')
    } catch {
      setMessage('Mikrofonilupaa ei saatu. Tarkista selaimen käyttöoikeus.')
    }
  }

  function stop() {
    recorderRef.current?.stop()
    setRecording(false)
  }

  return <div className="lesson-speaking-practice">
    <div className="lesson-speaking-heading"><small>PUHUMINEN</small><strong>Puhu ja kuuntele oma vastauksesi</strong></div>
    <p className="lesson-speaking-model"><span>Mallilause:</span> {modelSentence}</p>
    <div className="lesson-speaking-actions">
      <button type="button" className="outline-button" onClick={playModel}>▶ Kuuntele malli</button>
      {recording
        ? <button type="button" className="primary-button" onClick={stop}>■ Lopeta tallennus</button>
        : <button type="button" className="primary-button" onClick={start}>● Äänitä oma puhe</button>}
    </div>
    {audioUrl && <audio controls src={audioUrl} className="lesson-speaking-audio" />}
    <p className="lesson-audio-message" aria-live="polite">{message}</p>
  </div>
}

