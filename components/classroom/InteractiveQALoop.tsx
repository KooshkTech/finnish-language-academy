'use client'

import Link from 'next/link'
import { InlineDictionaryText } from '@/components/dictionary/InlineDictionaryText'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { QAQuestion, QAEvaluationResponse } from '@/types/qa'
import { speakLearningText } from '@/lib/speech/browser-voice'

const REVIEW_KEY = 'opiope_qa_review_v1'

type Props = {
  questions: QAQuestion[]
  title: string
  language?: 'fi' | 'sv'
}

export function InteractiveQALoop({ questions, title, language = 'fi' }: Props) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [evaluation, setEvaluation] = useState<QAEvaluationResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const [recording, setRecording] = useState(false)
  const [message, setMessage] = useState('')
  const [speed, setSpeed] = useState<0.5 | 0.75 | 1>(1)
  const [showTranscript, setShowTranscript] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>()
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const question = questions[index]
  const progress = questions.length ? `${index + 1}/${questions.length}` : '0/0'
  const voiceEnabled = question?.inputMode === 'voice' || question?.inputMode === 'text-or-voice'
  const textEnabled = question?.inputMode === 'text' || question?.inputMode === 'text-or-voice'
  const sourceToSpeak = question?.stimulusText ?? question?.prompt ?? ''

  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl) }, [audioUrl])

  const dictionaryHeadwords = useMemo(() => question?.dictionaryHeadwords ?? [], [question])

  function speak(text = sourceToSpeak) {
    if (!text || !('speechSynthesis' in window)) {
      setMessage('Selaimen puhesynteesi ei ole käytettävissä tällä laitteella.')
      return
    }
    const result = speakLearningText(text, language, speed)
    if (!result.ok) setMessage(language === 'sv' ? 'En svensk röst är inte tillgänglig på den här enheten.' : 'Suomenkielistä ääntä ei ole saatavilla tällä laitteella.')
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = event => chunksRef.current.push(event.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const url = URL.createObjectURL(blob)
        if (audioUrl) URL.revokeObjectURL(audioUrl)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
        void transcribe(blob)
      }
      recorder.start()
      setRecording(true)
      setMessage('Nauhoitetaan vastausta…')
    } catch {
      setMessage('Mikrofonin käyttö estettiin tai mikrofonia ei löytynyt.')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
    setRecording(false)
    setMessage('Muunnetaan puhe tekstiksi…')
  }

  async function transcribe(blob: Blob) {
    const form = new FormData()
    form.append('audio', blob, 'qa-answer.webm')
    form.append('language', language)
    try {
      const response = await fetch('/api/voice/transcribe', { method: 'POST', body: form })
      const data = await response.json() as { text?: string; error?: string; pronunciationStatus?: string }
      if (!response.ok) {
        setMessage(data.error ?? 'Puheentunnistus ei ole käytettävissä.')
        return
      }
      setAnswer(data.text ?? '')
      setMessage(data.pronunciationStatus ?? 'Transkriptio valmis.')
    } catch {
      setMessage('Puhepalveluun ei saatu yhteyttä.')
    }
  }

  function addReviewWord(word: string) {
    try {
      const raw = window.localStorage.getItem(REVIEW_KEY)
      const current = raw ? JSON.parse(raw) as string[] : []
      const next = Array.from(new Set([word, ...current])).slice(0, 100)
      window.localStorage.setItem(REVIEW_KEY, JSON.stringify(next))
      window.dispatchEvent(new CustomEvent('opiope:srs-add', { detail: { word } }))
      setMessage(`“${word}” lisättiin tämän laitteen kertausjonoon.`)
    } catch {
      setMessage('Sanaa ei voitu tallentaa tämän laitteen kertausjonoon.')
    }
  }

  async function submit() {
    if (!question || !answer.trim()) {
      setMessage('Anna vastaus ensin.')
      return
    }
    setBusy(true)
    setMessage('Arvioidaan vastausta…')
    try {
      const response = await fetch('/api/qa/evaluate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question, studentInputText: answer, learningLanguage: language, nextQuestionText: questions[index + 1]?.prompt }),
      })
      const data = await response.json() as QAEvaluationResponse | { error?: string }
      if (!response.ok || !('questionId' in data)) {
        setMessage(('error' in data && data.error) || 'Arviointi ei onnistunut.')
        return
      }
      setEvaluation(data)
      setMessage(data.evaluationMode === 'ai' ? 'AI-palaute valmis.' : 'Avainsanoihin perustuva harjoituspalaute valmis.')
      window.dispatchEvent(new CustomEvent('opiope:blackboard-note', {
        detail: {
          title: `Q&A · ${data.scorePercentage}%`,
          body: `${data.feedback.overallSummary}\nMallivastaus: ${data.modelAnswer.standardForm}`,
        },
      }))
      if ('speechSynthesis' in window) speakLearningText(data.feedback.overallSummary, language, speed)
    } catch {
      setMessage('Arviointipalveluun ei saatu yhteyttä.')
    } finally {
      setBusy(false)
    }
  }

  function resetQuestionState() {
    setAnswer('')
    setEvaluation(null)
    setShowTranscript(false)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(undefined)
  }

  function next() {
    resetQuestionState()
    if (index < questions.length - 1) {
      setMessage('')
      setIndex(current => current + 1)
    } else {
      setIndex(0)
      setMessage('Kierros valmis. Aloitettiin uusi kierros ensimmäisestä kysymyksestä.')
    }
  }

  if (!question) return null

  return <section className="qa-engine" aria-labelledby="qa-engine-title">
    <div className="qa-engine-head">
      <div>
        <p className="eyebrow">{language === 'sv' ? 'INTERAKTIV FRÅGA OCH SVAR' : 'INTERAKTIIVINEN KYSYMYS JA VASTAUS'} · {question.cefrLevel}</p>
        <h2 id="qa-engine-title">{title}</h2>
        <p>Kysymys → vastaus → palaute → Blackboard → seuraava kysymys</p>
      </div>
      <strong className="qa-progress">{progress}</strong>
    </div>

    <div className="qa-question-card">
      {question.passage && <div className="qa-passage"><small>LUE TEKSTI · klikkaa sanoja sanakirjaan</small><p><InlineDictionaryText text={question.passage}/></p></div>}
      {question.stimulusText && <div className="qa-audio-stimulus">
        <small>KUUNTELUTEHTÄVÄ</small>
        <button type="button" onClick={() => speak(question.stimulusText)}>▶ Toista äänite</button>
        {showTranscript && <p>{question.stimulusText}</p>}
        <button type="button" onClick={() => setShowTranscript(value => !value)}>{showTranscript ? (language === 'sv' ? 'Dölj text' : 'Piilota teksti') : (language === 'sv' ? 'Visa text för kontroll' : 'Näytä teksti tarkistukseen')}</button>
      </div>}
      <h3>{question.prompt}</h3>
      <div className="speed-control"><span>{language === 'sv' ? 'Ljud' : 'Ääni'}</span>{([0.5,0.75,1] as const).map(value => <button key={value} type="button" aria-pressed={speed===value} onClick={() => setSpeed(value)}>{value}×</button>)}<button type="button" onClick={() => speak()}>🔊 Kysymys</button></div>

      {textEnabled && <textarea className="qa-answer-box" rows={5} value={answer} onChange={event => setAnswer(event.target.value)} placeholder="Kirjoita vastauksesi tähän…"/>}
      {voiceEnabled && <div className="qa-voice-actions">
        {!recording ? <button type="button" onClick={startRecording}>🎙 Aloita vastaus</button> : <button type="button" onClick={stopRecording}>■ Lopeta nauhoitus</button>}
        {audioUrl && <audio controls src={audioUrl}/>}
      </div>}
      {voiceEnabled && answer && <div className="qa-transcript"><small>PUHEEN TRANSKRIPTIO</small><p>{answer}</p></div>}
      <div className="qa-submit-row"><button type="button" disabled={busy || !answer.trim()} onClick={submit}>{busy ? 'Arvioidaan…' : 'Tarkista vastaus'}</button><span>{message}</span></div>
    </div>

    {evaluation && <div className="qa-feedback-grid">
      <article className={evaluation.isCorrect ? 'qa-feedback good' : 'qa-feedback bad'}>
        <div className="qa-score-line"><strong>{evaluation.scorePercentage}%</strong><span>{evaluation.evaluationMode === 'ai' ? (language === 'sv' ? 'AI-baserad övningsrespons' : 'Tekoälypohjainen harjoituspalaute') : (language === 'sv' ? 'Kontroll av nyckelpunkter' : 'Avainkohtien tarkistus')}</span></div>
        <h3>{evaluation.isCorrect ? 'Hyvä vastaus' : 'Korjataan vielä'}</h3>
        <p>{evaluation.feedback.overallSummary}</p>
        <p className="module-notice">Tulos on OpiOpe-harjoituspalaute, ei virallinen CEFR- tai YKI-arvio.</p>
      </article>

      <article className="qa-feedback">
        <h3>Korjaukset</h3>
        {evaluation.feedback.grammarCorrections.length ? evaluation.feedback.grammarCorrections.map((item, correctionIndex) => <div className="qa-correction" key={`${item.originalPhrase}-${correctionIndex}`}>
          <p className="qa-original">✕ {item.originalPhrase}</p><p className="qa-corrected">✓ {item.correctedPhrase}</p><small>{item.ruleExplanation}</small>
        </div>) : <p>Ei varmennettuja kielioppikorjauksia tässä arviointitilassa.</p>}
        {evaluation.feedback.registerNote && <div className="qa-register"><small>{evaluation.feedback.registerNote.currentRegister}</small><p>{evaluation.feedback.registerNote.alternativeRegisterForm}</p></div>}
        {evaluation.feedback.pronunciationStatus && <p className="module-notice">{evaluation.feedback.pronunciationStatus}</p>}
      </article>

      <article className="qa-feedback">
        <h3>Mallivastaus</h3>
        <p><small>KIRJAKIELI</small><br/><strong>{evaluation.modelAnswer.standardForm}</strong></p>
        <p><small>PUHEKIELI</small><br/><strong>{evaluation.modelAnswer.spokenForm}</strong></p>
        
        <button type="button" onClick={() => speak(evaluation.modelAnswer.standardForm)}>🔊 Kuuntele mallivastaus</button>
      </article>

      <article className="qa-feedback">
        <h3>Sanasto & kertaus</h3>
        <p>OpiOpe Advanced Dictionary -linkit. Ei väitettä Oxford-yhteydestä tai lisenssistä.</p>
        <div className="qa-word-list">{dictionaryHeadwords.map(word => <div key={word}><Link href={`/dictionary?q=${encodeURIComponent(word)}`}>{word} ↗</Link><button type="button" onClick={() => addReviewWord(word)}>+ SRS</button></div>)}</div>
        {evaluation.feedback.vocabularySuggestions?.map((item, suggestionIndex) => <div key={`${item.word}-${suggestionIndex}`} className="qa-vocab-suggestion"><strong>{item.suggestion || item.word}</strong><span>{item.reason}</span></div>)}
      </article>

      <div className="qa-next-row"><button type="button" onClick={next}>{index < questions.length - 1 ? 'Seuraava kysymys →' : 'Aloita uusi kierros ↻'}</button></div>
    </div>}
  </section>
}

