'use client'

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, BookOpen, Check, LogOut, Menu, PenLine, Sparkles, Target, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { courses, grammarQuestions, placementQuestions, representativeLesson, words } from '@/data/learning'
import type { DashboardData, Profile } from '@/types/learning'
import { useGuestProgress } from '@/hooks/useGuestProgress'
import { loadDashboardData, recordDailyActivity, savePlacementResult } from '@/services/progress'
import { saveGrammarAttempt } from '@/services/grammar'
import { createVocabularyProgress, scheduleVocabularyReview } from '@/services/vocabulary'
import { scorePlacement } from '@/services/placement'
import { signIn, signUp, supabaseConfigured } from '@/services/auth'

type User = { id: string; email?: string }
type View = 'home' | 'placement' | 'dashboard' | 'lesson' | 'vocabulary' | 'grammar' | 'ai' | 'translation' | 'yki'

export default function Page() {
  const supabase = useMemo(() => createClient(), [])
  const { guestState, updateGuestState } = useGuestProgress()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [view, setView] = useState<View>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [placementIndex, setPlacementIndex] = useState(0)
  const [placementAnswers, setPlacementAnswers] = useState<Record<string, string>>({})
  const [grammarIndex, setGrammarIndex] = useState(0)
  const [grammarAnswer, setGrammarAnswer] = useState('')
  const [grammarFeedback, setGrammarFeedback] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [wordAnswer, setWordAnswer] = useState('')
  const [wordFeedback, setWordFeedback] = useState('')
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const refreshDashboard = useCallback(async (id: string) => {
    if (!supabaseConfigured()) return
    try { setDashboard(await loadDashboardData(supabase, id)) } catch { setDashboard(null) }
  }, [supabase])

  const loadProfile = useCallback(async (id: string) => {
    if (!supabaseConfigured()) return
    const { data } = await supabase.from('profiles').select('display_name,level,goal,daily_minutes').eq('id', id).maybeSingle()
    if (data) setProfile(data as Profile)
  }, [supabase])

  useEffect(() => {
    if (!supabaseConfigured()) return
    let active = true
    void supabase.auth.getUser().then(({ data }) => {
      if (!active || !data.user) return
      setUser(data.user)
      void loadProfile(data.user.id)
      void refreshDashboard(data.user.id)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      if (session?.user) {
        setUser(session.user)
        void loadProfile(session.user.id)
        void refreshDashboard(session.user.id)
      } else {
        setUser(null); setProfile(null); setDashboard(null)
      }
    })
    return () => { active = false; data.subscription.unsubscribe() }
  }, [loadProfile, refreshDashboard, supabase])

  async function authenticate(event: FormEvent) {
    event.preventDefault()
    if (!supabaseConfigured()) { setAuthMessage('Tilipalvelu ei ole vielä käytettävissä. Supabase-määritys puuttuu.'); return }
    setBusy(true); setAuthMessage('')
    try {
      const result = authMode === 'signup' ? await signUp(supabase, email, password) : await signIn(supabase, email, password)
      if (result.error) { setAuthMessage('Kirjautuminen epäonnistui. Tarkista tiedot.'); return }
      if (authMode === 'signup') setAuthMessage('Tarkista sähköpostisi ja vahvista tili.')
      else { setAuthOpen(false); setView('dashboard') }
    } finally { setBusy(false) }
  }

  function choosePlacement(answer: string) {
    const q = placementQuestions[placementIndex]
    const next = { ...placementAnswers, [q.id]: answer }
    setPlacementAnswers(next)
    if (placementIndex < placementQuestions.length - 1) { setPlacementIndex(i => i + 1); return }
    const result = scorePlacement(next)
    updateGuestState(current => ({ ...current, placementResult: result, recommendedLesson: result.recommendedLesson }))
    if (user && supabaseConfigured()) void savePlacementResult(supabase, user.id, result).then(() => refreshDashboard(user.id))
  }

  async function answerGrammar(answer: string) {
    const q = grammarQuestions[grammarIndex]
    const correct = answer === q.answer
    const attempt = { exerciseId: `grammar-${grammarIndex + 1}`, topic: q.topic, selectedAnswer: answer, isCorrect: correct, attemptedAt: new Date().toISOString() }
    setGrammarAnswer(answer)
    setGrammarFeedback(correct ? `Oikein. ${q.explanation}` : `Hyvä yritys. Oikea vastaus on ${q.answer}. ${q.explanation}`)
    if (user && supabaseConfigured()) {
      try { await saveGrammarAttempt(supabase, user.id, attempt); await recordDailyActivity(supabase, user.id); await refreshDashboard(user.id) } catch { /* feedback still remains useful */ }
    } else updateGuestState(current => ({ ...current, grammarAttempts: [...current.grammarAttempts, attempt] }))
  }

  async function answerWord() {
    const item = words[wordIndex]
    const correct = wordAnswer.trim().toLowerCase() === item.translation.toLowerCase()
    setWordFeedback(correct ? 'Oikein. Hienosti muistettu.' : `Vastaus on: ${item.translation}.`)
    if (!user || !supabaseConfigured()) {
      updateGuestState(current => {
        const base = current.vocabularyProgress[item.word] ?? createVocabularyProgress(item.word, item.translation)
        return { ...current, vocabularyProgress: { ...current.vocabularyProgress, [item.word]: scheduleVocabularyReview(base, correct) } }
      })
      return
    }
    const { data } = await supabase.from('vocabulary_progress').select('*').eq('user_id', user.id).eq('word', item.word).maybeSingle()
    const base = data ? { word: data.word, translation: data.translation, firstSeen: data.first_seen, lastReviewed: data.last_reviewed, nextReview: data.next_review, correctCount: data.correct_count ?? 0, wrongCount: data.wrong_count ?? 0, interval: data.interval ?? 0, easeFactor: Number(data.ease_factor ?? 2.5), confidence: data.confidence ?? 0, mastery: data.mastery ?? 0 } : createVocabularyProgress(item.word, item.translation)
    const next = scheduleVocabularyReview(base, correct)
    await supabase.from('vocabulary_progress').upsert({ user_id: user.id, word: next.word, translation: next.translation, first_seen: next.firstSeen, last_reviewed: next.lastReviewed, next_review: next.nextReview, correct_count: next.correctCount, wrong_count: next.wrongCount, interval: next.interval, ease_factor: next.easeFactor, confidence: next.confidence, mastery: next.mastery, updated_at: new Date().toISOString() }, { onConflict: 'user_id,word' })
    await refreshDashboard(user.id)
  }

  async function signOut() {
    if (supabaseConfigured()) await supabase.auth.signOut()
    setUser(null); setProfile(null); setDashboard(null); setView('home')
  }

  const placementDone = guestState.placementResult
  const currentWord = words[wordIndex]
  const guestWeak = [...new Set(guestState.grammarAttempts.filter(a => !a.isCorrect).map(a => a.topic))].slice(0, 3)
  const weakTopics = user ? dashboard?.weakGrammarTopics ?? [] : guestWeak
  const dueWords = user ? dashboard?.dueVocabulary ?? 0 : Object.values(guestState.vocabularyProgress).filter(v => new Date(v.nextReview).getTime() <= Date.now()).length

  return <main className="app-root">
    <header className="site-header">
      <button className="brand" onClick={() => setView('home')} aria-label="OpiOpe etusivu"><span className="brand-mark">OO</span><span className="brand-text"><strong>OpiOpe</strong><em>Suomen kielen oppimisalusta</em></span></button>
      <nav className="desktop-nav" aria-label="Päävalikko"><button onClick={() => setView('dashboard')}>Oma polku</button><a href="#courses">Kurssit</a><button onClick={() => setView('grammar')}>Harjoittele</button><button onClick={() => setView('yki')}>YKI</button><a href="#resources">Resurssit</a></nav>
      <div className="header-actions">{user ? <button className="outline-button" onClick={signOut}><LogOut size={15}/> Kirjaudu ulos</button> : <button className="outline-button" onClick={() => { setAuthMode('login'); setAuthOpen(true) }}>Kirjaudu</button>}<button className="primary-button" onClick={() => setView('placement')}>Aloita ilmaiseksi</button><button className="menu-btn" onClick={() => setMenuOpen(v => !v)} aria-label="Valikko">{menuOpen ? <X/> : <Menu/>}</button></div>
    </header>
    {menuOpen && <nav className="mobile-menu"><button onClick={() => setView('dashboard')}>Oma polku</button><button onClick={() => setView('grammar')}>Harjoittele</button><button onClick={() => setView('yki')}>YKI</button><button onClick={() => setView('placement')}>Tasotesti</button></nav>}

    {view === 'home' && <>
      <section className="hero"><div className="hero-copy"><p className="eyebrow">SUOMEN KIELEN OPPIMINEN · A0–C2</p><h1>Opi suomea.<br/><span>Puhu rohkeammin.</span><br/>Elä Suomessa.</h1><p className="hero-lede">Opi käytännön suomea omaan tahtiisi. Harjoittele kielioppia, sanastoa, puhekieltä, työelämän suomea ja YKI-tehtäviä yhdessä paikassa.</p><div className="hero-actions"><button className="primary-button large" onClick={() => setView('placement')}>Aloita ilmaiseksi <ArrowRight size={17}/></button><button className="outline-button large" onClick={() => setView('placement')}>Tee tasotesti</button></div><p className="guest-note">Voit aloittaa ilman rekisteröitymistä.</p></div><div className="hero-preview"><p className="eyebrow">SEURAAVAKSI SINULLE</p><div className="preview-card"><span className="preview-badge">{weakTopics.length ? 'SUOSITUS' : 'ESIMERKKI'}</span><h2>{weakTopics[0] ?? 'Partitiivi'}</h2><p>8 min · {weakTopics.length ? 'Perustuu viime harjoituksiisi' : 'Näe, miten henkilökohtainen harjoittelu toimii'}</p><button className="outline-button" onClick={() => setView('grammar')}>Harjoittele nyt</button></div><div className="word-card"><span>Päivän sana</span><strong>juurtua</strong><em>to put down roots</em><p>“Täällä on hyvä juurtua.”</p></div></div></section>
      <section className="section" id="courses"><p className="eyebrow">OPINTOPOLUT</p><h2>Löydä oma polkusi.</h2><div className="course-grid">{courses.map(c => <article className="course-card" key={c.title}><div className="course-symbol">{c.icon}</div><small>{c.level}</small><h3>{c.title}</h3><p>{c.text}</p><button onClick={() => setView('lesson')}>Aloita <ArrowRight size={16}/></button></article>)}</div></section>
      <section className="yki-strip"><div><p className="eyebrow">YKI-HARJOITTELU</p><h2>Harjoittele tavoitteellisesti.</h2><p>Tehtäviä kielioppiin, sanastoon ja lukemiseen ilman tekaistuja virallisia pistemääriä.</p></div><button className="light-button" onClick={() => setView('yki')}>Tutustu YKI-polkuun</button></section>
    </>}

    {view === 'placement' && <section className="app-shell"><button className="back-link" onClick={() => setView('home')}>← Etusivulle</button>{placementDone ? <div className="practice-card"><p className="eyebrow">TASOTESTI VALMIS</p><h1>{placementDone.estimatedLevel}</h1><p>Sait {placementDone.score}/{placementDone.total} oikein. Tämä on OpiOpen arvio, ei virallinen CEFR-todistus.</p><button className="primary-button" onClick={() => setView('lesson')}>Jatka suositeltuun harjoitukseen</button></div> : <div className="practice-card"><p className="eyebrow">KYSYMYS {placementIndex + 1} / {placementQuestions.length}</p><h2>{placementQuestions[placementIndex].prompt}</h2><div className="answer-list">{placementQuestions[placementIndex].options.map(o => <button key={o} onClick={() => choosePlacement(o)}>{o}</button>)}</div></div>}</section>}

    {view === 'dashboard' && <section className="app-shell"><button className="back-link" onClick={() => setView('home')}>← Etusivulle</button><div className="dashboard-head"><p className="eyebrow">OMA POLKU</p><h1>Hei, {profile?.display_name ?? 'oppija'}.</h1><p>{user ? 'Tilisi edistyminen tallennetaan Supabaseen.' : 'Käytät vierailijatilaa. Edistyminen tallennetaan tähän selaimeen.'}</p></div><div className="stats-grid"><div><strong>{placementDone?.estimatedLevel ?? dashboard?.placementResult?.estimatedLevel ?? '—'}</strong><span>arvioitu taso</span></div><div><strong>{dueWords}</strong><span>sanaa kerrattavana</span></div><div><strong>{weakTopics.length}</strong><span>heikkoa kielioppialuetta</span></div></div><div className="dashboard-actions"><button className="primary-button" onClick={() => setView('lesson')}>Jatka oppimista</button><button className="outline-button" onClick={() => setView('vocabulary')}>Sanastokertaus</button><button className="outline-button" onClick={() => setView('grammar')}>Kielioppi</button></div></section>}

    {view === 'lesson' && <section className="app-shell"><button className="back-link" onClick={() => setView('dashboard')}>← Oma polku</button><div className="practice-card"><p className="eyebrow">OPPITUNTI</p><h2>{representativeLesson.title}</h2><p>{representativeLesson.objective}</p><div className="lesson-box"><strong>Miksi?</strong><p>{representativeLesson.explanation}</p>{representativeLesson.examples.map(e => <p key={e}>• {e}</p>)}</div><button className="primary-button" onClick={() => setView('grammar')}>Harjoittele rakennetta</button></div></section>}

    {view === 'grammar' && <section className="app-shell"><button className="back-link" onClick={() => setView('dashboard')}>← Oma polku</button><div className="practice-card"><p className="eyebrow">KIELIOPPI · {grammarIndex + 1}/{grammarQuestions.length}</p><h2>{grammarQuestions[grammarIndex].prompt}</h2><div className="answer-list">{grammarQuestions[grammarIndex].options.map(o => <button className={grammarAnswer === o ? 'selected' : ''} key={o} onClick={() => void answerGrammar(o)}>{o}</button>)}</div>{grammarFeedback && <div className="feedback"><Check size={17}/>{grammarFeedback}</div>}<button className="outline-button" onClick={() => { setGrammarIndex(i => (i + 1) % grammarQuestions.length); setGrammarAnswer(''); setGrammarFeedback('') }}>Seuraava tehtävä</button></div></section>}

    {view === 'vocabulary' && <section className="app-shell"><button className="back-link" onClick={() => setView('dashboard')}>← Oma polku</button><div className="practice-card"><p className="eyebrow">SRS-SANASTO · {wordIndex + 1}/{words.length}</p><div className="word-big">{currentWord.word}</div><p>Mitä sana tarkoittaa englanniksi?</p><input className="large-input" value={wordAnswer} onChange={e => setWordAnswer(e.target.value)} placeholder="Kirjoita käännös"/>{wordFeedback && <div className="feedback"><Sparkles size={17}/>{wordFeedback}</div>}<div className="row"><button className="primary-button" onClick={() => void answerWord()}>Tarkista</button><button className="outline-button" onClick={() => { setWordIndex(i => (i + 1) % words.length); setWordAnswer(''); setWordFeedback('') }}>Seuraava</button></div></div></section>}

    {view === 'yki' && <section className="app-shell"><button className="back-link" onClick={() => setView('home')}>← Etusivulle</button><div className="practice-card"><p className="eyebrow">YKI · EI VIRALLINEN TULOS</p><h2>YKI-harjoittelua ilman tekaistua arvosanaa.</h2><p>Harjoittele kielioppia, sanastoa ja lukemista. OpiOpe ei väitä antavansa virallista YKI- tai CEFR-todistusta.</p><div className="row"><button className="primary-button" onClick={() => setView('grammar')}>Kielioppi</button><button className="outline-button" onClick={() => setView('vocabulary')}>Sanasto</button></div></div></section>}

    {view === 'ai' && <section className="app-shell"><div className="practice-card"><p className="eyebrow">EI KONFIGUROITU</p><h2>AI-opettaja ei ole vielä käytettävissä.</h2><p>Turvallinen palvelinpuolen AI-integraatio on määritettävä ennen käyttöönottoa.</p></div></section>}
    {view === 'translation' && <section className="app-shell"><div className="practice-card"><p className="eyebrow">EI KONFIGUROITU</p><h2>Käännöspalvelu ei ole tällä hetkellä käytettävissä.</h2><p>OpiOpe ei esitä esimerkkivastauksia oikean käännöspalvelun tuloksina.</p></div></section>}

    <section className="section tools" id="resources"><p className="eyebrow">ILMAISET TYÖKALUT</p><h2>Aloita ilman tiliä.</h2><div className="tool-grid"><button onClick={() => setView('placement')}><Target/>Tasotesti</button><button onClick={() => setView('grammar')}><PenLine/>Kielioppi</button><button onClick={() => setView('vocabulary')}><Sparkles/>Sanasto</button><button onClick={() => setView('lesson')}><BookOpen/>Oppitunti</button></div></section>
    <footer><div className="brand"><span className="brand-mark">OO</span><span className="brand-text"><strong>OpiOpe</strong><em>Opi suomea. Oikeasti.</em></span></div><nav><a href="/privacy">Tietosuoja</a><a href="/cookies">Evästeet</a><a href="/terms">Käyttöehdot</a><a href="/account/privacy">Omat tiedot</a></nav><span>© 2026 OpiOpe</span></footer>

    {authOpen && <div className="modal-backdrop" onClick={() => setAuthOpen(false)}><div className="auth-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true"><button className="modal-close" onClick={() => setAuthOpen(false)} aria-label="Sulje"><X/></button><p className="eyebrow">{authMode === 'signup' ? 'LUO TILI' : 'KIRJAUDU'}</p><h2>{authMode === 'signup' ? 'Tallenna oma polkusi.' : 'Tervetuloa takaisin.'}</h2><form onSubmit={authenticate}><label>Sähköposti<input className="large-input" type="email" required value={email} onChange={e => setEmail(e.target.value)}/></label><label>Salasana<input className="large-input" type="password" minLength={6} required value={password} onChange={e => setPassword(e.target.value)}/></label>{authMessage && <p className="auth-message">{authMessage}</p>}<button className="primary-button" disabled={busy}>{busy ? 'Odota…' : authMode === 'signup' ? 'Luo tili' : 'Kirjaudu'}</button></form><button className="text-link" onClick={() => setAuthMode(m => m === 'signup' ? 'login' : 'signup')}>{authMode === 'signup' ? 'Minulla on jo tili' : 'Luo uusi tili'}</button></div></div>}
  </main>
}
