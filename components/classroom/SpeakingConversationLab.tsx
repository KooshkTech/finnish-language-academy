'use client'

import { useMemo, useState } from 'react'
import { SpeakingRecorder } from './SpeakingRecorder'
import { getSpeakingConversations } from '@/data/speaking-conversations'
import type { LearningLevelId } from '@/data/levels'

export function SpeakingConversationLab({ level }: { level: LearningLevelId }) {
  const conversations = useMemo(() => getSpeakingConversations(level), [level])
  const [selectedId, setSelectedId] = useState(conversations[0]?.id ?? '')
  const [showEnglish, setShowEnglish] = useState(false)
  const [role, setRole] = useState<'A' | 'B'>('B')
  const selected = conversations.find(item => item.id === selectedId) ?? conversations[0]

  function speak(text: string, rate = 0.9) {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'fi-FI'
    utterance.rate = rate
    window.speechSynthesis.speak(utterance)
  }

  if (!selected) return null

  return <section className="conversation-lab" aria-labelledby="conversation-title">
    <div className="conversation-heading">
      <div>
        <p className="eyebrow">{level.toUpperCase()} · KESKUSTELUHARJOITUS</p>
        <h2 id="conversation-title">Puhu oikeissa tilanteissa</h2>
        <p>Valitse keskustelu, kuuntele malli, ota rooli ja äänitä oma vastauksesi. Ääntä ei pisteytetä ilman erikseen määritettyä puhepalvelua.</p>
      </div>
      <label className="conversation-toggle"><input type="checkbox" checked={showEnglish} onChange={event => setShowEnglish(event.target.checked)}/> Näytä englanninkielinen tuki</label>
    </div>

    <div className="conversation-picker" role="tablist" aria-label="Keskustelut">
      {conversations.map(item => <button key={item.id} role="tab" aria-selected={item.id === selected.id} onClick={() => setSelectedId(item.id)}>{item.title}</button>)}
    </div>

    <div className="conversation-context">
      <div><strong>Tilanne</strong><p>{selected.situation}</p></div>
      <div><strong>Tavoite</strong><p>{selected.goal}</p></div>
    </div>

    <div className="role-selector" aria-label="Valitse oma roolisi">
      <span>Sinun roolisi:</span>
      <button className={role === 'A' ? 'selected' : ''} onClick={() => setRole('A')}>A</button>
      <button className={role === 'B' ? 'selected' : ''} onClick={() => setRole('B')}>B</button>
      <button onClick={() => speak(selected.turns.map(turn => turn.fi).join(' '), 0.88)}>▶ Kuuntele koko keskustelu</button>
      <button onClick={() => speak(selected.turns.map(turn => turn.fi).join(' '), 0.72)}>🐢 Hitaasti</button>
    </div>

    <div className="conversation-script">
      {selected.turns.map((turn, index) => <article key={`${turn.speaker}-${index}`} className={`conversation-turn ${turn.speaker === role ? 'learner-turn' : ''}`}>
        <div className="conversation-speaker">{turn.speaker === role ? `Sinä · ${turn.speaker}` : `Henkilö ${turn.speaker}`}</div>
        <div className="conversation-line"><strong>{turn.fi}</strong><button aria-label={`Kuuntele: ${turn.fi}`} onClick={() => speak(turn.fi)}>▶</button></div>
        {showEnglish && <p>{turn.en}</p>}
      </article>)}
    </div>

    <div className="conversation-practice-grid">
      <div className="conversation-task-card"><h3>Sinun vuorosi</h3>{selected.learnerPrompts.map(prompt => <p key={prompt}>• {prompt}</p>)}</div>
      <div className="conversation-task-card"><h3>Hyödylliset ilmaukset</h3>{selected.usefulPhrases.map(phrase => <button key={phrase} onClick={() => speak(phrase)}>▶ {phrase}</button>)}</div>
    </div>

    <SpeakingRecorder />
  </section>
}

