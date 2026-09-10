'use client'

import { useState } from 'react'
import { ArrowRight, Check, RotateCcw, Sparkles } from 'lucide-react'
import { courses, grammarQuestions, placementQuestions, representativeLesson, words } from '@/data/learning'

type View = 'home' | 'placement' | 'lesson' | 'grammar' | 'vocabulary' | 'dashboard'

export default function Page() {
  const [view, setView] = useState<View>('home')
  const [placementIndex, setPlacementIndex] = useState(0)
  const [placementScore, setPlacementScore] = useState(0)
  const [grammarIndex, setGrammarIndex] = useState(0)
  const [grammarFeedback, setGrammarFeedback] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [wordAnswer, setWordAnswer] = useState('')
  const [wordFeedback, setWordFeedback] = useState('')
  const placement = placementQuestions[placementIndex]
  const grammar = grammarQuestions[grammarIndex]
  const word = words[wordIndex]

  function answerPlacement(answer: string) {
    const score = placementScore + (answer === placement.answer ? 1 : 0)
    if (placementIndex < placementQuestions.length - 1) { setPlacementScore(score); setPlacementIndex(index => index + 1); return }
    setPlacementScore(score); setView('dashboard')
  }
  function answerGrammar(answer: string) { setGrammarFeedback(answer === grammar.answer ? `Oikein. ${grammar.explanation}` : `Hyvä yritys. Oikea vastaus on ${grammar.answer}. ${grammar.explanation}`) }
  function answerWord() { setWordFeedback(wordAnswer.trim().toLowerCase() === word.translation ? 'Oikein. Hienosti muistettu.' : `Vastaus on: ${word.translation}.`) }

  return <main className="app-root">
    <header className="site-header"><button className="brand" onClick={() => setView('home')} aria-label="OPIOPE etusivu"><span className="brand-mark">OO</span><span className="brand-text"><strong>OPIOPE</strong><em>Suomen kielen oppimisalusta</em></span></button><nav className="desktop-nav" aria-label="Päävalikko"><button onClick={() => setView('dashboard')}>Oma polku</button><button onClick={() => setView('lesson')}>Oppitunti</button><button onClick={() => setView('grammar')}>Harjoittele</button></nav><button className="primary-button" onClick={() => setView('placement')}>Aloita ilmaiseksi <ArrowRight size={16} /></button></header>
    {view === 'home' && <><section className="hero"><div className="hero-copy"><p className="eyebrow">SUOMEN KIELEN OPPIMINEN · A0–C2</p><h1>Opi suomea.<br /><span>Puhu rohkeammin.</span><br />Elä Suomessa.</h1><p className="hero-lede">Rakennettu polku suomen kieleen: selkeä teoria, käytännön harjoitukset ja oppiminen, joka etenee kanssasi.</p><div className="hero-buttons"><button className="primary-button" onClick={() => setView('placement')}>Tee tasotesti <ArrowRight size={16} /></button><button className="outline-button" onClick={() => setView('lesson')}>Aloita oppitunti</button></div></div><div className="hero-preview"><p className="eyebrow">TÄNÄÄN</p><div className="word-card"><span>Päivän sana</span><strong>juurtua</strong><em>to put down roots</em><p>“Täällä on hyvä juurtua.”</p></div></div></section><section className="section" id="courses"><p className="eyebrow">OPIOPE-POLKU</p><h2>A0:sta C2:een, yksi taito kerrallaan.</h2><div className="course-grid">{courses.map(course => <article className="course-card" key={course.title}><div className="course-symbol">{course.icon}</div><small>{course.level}</small><h3>{course.title}</h3><p>{course.text}</p><button className="arrow-link" onClick={() => setView('lesson')}>Aloita <ArrowRight size={15} /></button></article>)}</div></section><section className="yki-banner"><div><p className="eyebrow">OPIOPE YKI</p><h2>Harjoittele tavoitteellisesti.</h2><p>Reading, listening, writing ja speaking samassa oppimispolussa. Tulokset ovat harjoittelua, eivät virallisia YKI-tuloksia.</p></div><button className="light-button" onClick={() => setView('placement')}>Löydä lähtötaso</button></section></>}
    {view === 'placement' && <section className="app-shell"><button className="back-link" onClick={() => setView('home')}>← Etusivulle</button><div className="practice-card"><p className="eyebrow">TASOTESTI · {placementIndex + 1}/{placementQuestions.length}</p><h2>{placement.prompt}</h2><p>Vastaa intuitiivisesti. Tämä on OPIOPEn oppimisarvio, ei virallinen CEFR-todistus.</p><div className="answer-list">{placement.options.map(option => <button key={option} onClick={() => answerPlacement(option)}>{option}</button>)}</div></div></section>}
    {view === 'dashboard' && <section className="app-shell"><p className="eyebrow">OMA OPPIMISPOLKU</p><h1>Hyvä alku.</h1><p>Vastasit oikein {placementScore}/{placementQuestions.length} tasotestin tehtävään.</p><div className="dashboard-actions"><button className="primary-button" onClick={() => setView('lesson')}>Jatka oppituntiin <ArrowRight size={16} /></button><button className="outline-button" onClick={() => setView('vocabulary')}>Kertaa sanastoa</button></div></section>}
    {view === 'lesson' && <section className="app-shell"><button className="back-link" onClick={() => setView('home')}>← Etusivulle</button><div className="practice-card"><p className="eyebrow">LUKUTAITO · KIELIOPPI · HARJOITUS</p><h2>{representativeLesson.title}</h2><p>{representativeLesson.objective}</p><div className="lesson-box"><strong>Ymmärrä rakenne</strong><p>{representativeLesson.explanation}</p>{representativeLesson.examples.map(example => <p key={example}>{example}</p>)}</div><button className="primary-button" onClick={() => setView('grammar')}>Harjoittele rakennetta <ArrowRight size={16} /></button></div></section>}
    {view === 'grammar' && <section className="app-shell"><button className="back-link" onClick={() => setView('lesson')}>← Oppituntiin</button><div className="practice-card"><p className="eyebrow">KIELIOPPI · {grammarIndex + 1}/{grammarQuestions.length}</p><h2>{grammar.prompt}</h2><div className="answer-list">{grammar.options.map(option => <button key={option} onClick={() => answerGrammar(option)}>{option}</button>)}</div>{grammarFeedback && <div className="feedback"><Check size={17} />{grammarFeedback}</div>}<button className="outline-button" onClick={() => { setGrammarIndex(index => (index + 1) % grammarQuestions.length); setGrammarFeedback('') }}><RotateCcw size={15} /> Seuraava tehtävä</button></div></section>}
    {view === 'vocabulary' && <section className="app-shell"><button className="back-link" onClick={() => setView('dashboard')}>← Oma polku</button><div className="practice-card"><p className="eyebrow">SANASTO · {wordIndex + 1}/{words.length}</p><div className="word-big">{word.word}</div><p>{word.example}</p><label htmlFor="translation">Mitä sana tarkoittaa englanniksi?</label><input id="translation" className="large-input" value={wordAnswer} onChange={event => setWordAnswer(event.target.value)} /><div className="row"><button className="primary-button" onClick={answerWord}><Sparkles size={15} /> Tarkista</button><button className="outline-button" onClick={() => { setWordIndex(index => (index + 1) % words.length); setWordAnswer(''); setWordFeedback('') }}>Seuraava</button></div>{wordFeedback && <div className="feedback">{wordFeedback}</div>}</div></section>}
    <footer className="footer"><div className="brand"><span className="brand-mark">OO</span><span className="brand-text"><strong>OPIOPE</strong><em>Opi suomea. Oikeasti.</em></span></div><span>© 2026 OPIOPE</span></footer>
  </main>
}
