'use client'

import { useState } from 'react'
import { speakLearningText } from '@/lib/speech/browser-voice'

export function LessonAudioPractice({ text }: { text: string }) {
  const [speed, setSpeed] = useState<0.75 | 1>(1)
  const [showTranscript, setShowTranscript] = useState(false)
  const [message, setMessage] = useState('')

  function speak() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setMessage('Selaimen puhesynteesi ei ole käytettävissä tällä laitteella.')
      return
    }
    const result = speakLearningText(text, 'fi', speed)
    if (!result.ok) {
      setMessage(result.reason === 'voice-missing' ? 'Suomenkielistä ääntä ei ole saatavilla tällä laitteella.' : 'Selaimen puhesynteesi ei ole käytettävissä tällä laitteella.')
      return
    }
    result.utterance.onend = () => setMessage('Kuuntelu valmis. Toista vielä kerran ilman tekstiä.')
    setMessage('Kuuntele ensin kokonaisuus. Älä yritä erottaa jokaista sanaa.')
  }

  return <div className="lesson-audio-practice">
    <div className="lesson-audio-heading">
      <div><small>KUUNTELU</small><strong>Kuuntele mallilause</strong></div>
      <div className="lesson-audio-speed" aria-label="Kuuntelunopeus">
        {([0.75, 1] as const).map(value => <button key={value} type="button" aria-pressed={speed === value} onClick={() => setSpeed(value)}>{value}×</button>)}
      </div>
    </div>
    <div className="lesson-audio-actions">
      <button type="button" className="primary-button" onClick={speak}>▶ Kuuntele</button>
      <button type="button" className="outline-button" onClick={() => setShowTranscript(value => !value)}>{showTranscript ? 'Piilota teksti' : 'Näytä teksti'}</button>
    </div>
    {showTranscript && <p className="lesson-audio-transcript">{text}</p>}
    {message && <p className="lesson-audio-message" aria-live="polite">{message}</p>}
  </div>
}

