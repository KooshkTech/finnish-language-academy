'use client'

import { useState } from 'react'
import { ArrowUpRight, BookOpen, CalendarDays, Check, ChevronRight, Plus, Users } from 'lucide-react'

type ClassItem = { id: string; name: string; class_type: string; target_language: string; cefr_level: string; join_code: string; member_count?: number }

type Props = { teacherName: string; classes: ClassItem[] }

const plans = [
  { title: 'Viikon aloitus', meta: 'A1 · Suomi · 45 min', status: 'Valmis tarkistettavaksi' },
  { title: 'Asiointi ja palvelut', meta: 'A2 · Suomi · 60 min', status: 'Luonnos' },
  { title: 'YKI-kirjoittaminen', meta: 'B1 · Suomi · 45 min', status: 'Julkaistu' },
]

export function TeacherDashboard({ teacherName, classes }: Props) {
  const [active, setActive] = useState<'overview' | 'classes' | 'plans'>('overview')
  const [showForm, setShowForm] = useState(false)

  return <main className="teacher-app">
    <header className="teacher-header">
      <a className="teacher-brand" href="/"><span>OP</span><strong>OPIOPE</strong><small>TEACHER STUDIO</small></a>
      <nav aria-label="Teacher navigation">
        <button className={active === 'overview' ? 'active' : ''} onClick={() => setActive('overview')}>Yleiskatsaus</button>
        <button className={active === 'classes' ? 'active' : ''} onClick={() => setActive('classes')}>Luokat</button>
        <button className={active === 'plans' ? 'active' : ''} onClick={() => setActive('plans')}>Tuntisuunnitelmat</button>
      </nav>
      <a className="teacher-exit" href="/">Opiskelijanäkymä <ArrowUpRight size={15} /></a>
    </header>

    <section className="teacher-intro">
      <div><p className="eyebrow">Opettajan työtila · Syksy 2026</p><h1>Hyvää huomenta,<br /><em>{teacherName}.</em></h1><p className="teacher-lede">Suunnittele, tarkista ja seuraa oppimista yhdessä rauhallisessa työtilassa.</p></div>
      <div className="teacher-date"><CalendarDays size={18} /><span>Tänään</span><strong>11. syyskuuta</strong></div>
    </section>

    <section className="teacher-stats" aria-label="Teaching overview">
      <article><span>AKTIIVISET OPPIJAT</span><strong>24</strong><small>+4 tällä viikolla</small></article>
      <article><span>TARKISTETTAVAA</span><strong>08</strong><small>2 kiireellistä</small></article>
      <article><span>AKTIIVISET LUOKAT</span><strong>{classes.length || 3}</strong><small>Kaikki tasot</small></article>
      <article className="teacher-accent"><span>VIIKON AKTIIVISUUS</span><strong>78%</strong><small>+12% viime viikosta</small></article>
    </section>

    {active === 'overview' && <section className="teacher-grid">
      <article className="teacher-panel teacher-wide"><div className="panel-heading"><div><p className="eyebrow">Tämän päivän työ</p><h2>Pidä oppiminen<br /><em>liikkeessä.</em></h2></div><button className="teacher-icon-button" aria-label="Avaa päivän työ"><ChevronRight /></button></div><div className="teacher-tasks"><div><Check /><span><strong>2 vastausta</strong><small>odottaa palautettasi</small></span><b>NYT</b></div><div><BookOpen /><span><strong>Viikon aloitus</strong><small>on valmis julkaistavaksi</small></span><b>UUSI</b></div><div><Users /><span><strong>A1 Suomi arjessa</strong><small>24 oppijaa aktiivisena</small></span><b>78%</b></div></div></article>
      <article className="teacher-panel next-lesson"><p className="eyebrow">Seuraava tunti</p><span className="lesson-time">MA · 14:00</span><h2>Puhekieli<br /><em>arjessa</em></h2><p>Harjoittele luonnollista keskustelua kahvilassa ja kaupassa.</p><button className="teacher-dark-button">Avaa suunnitelma <ArrowUpRight size={16} /></button></article>
    </section>}

    {active === 'classes' && <section className="teacher-panel teacher-list-panel"><div className="panel-heading"><div><p className="eyebrow">Oppimisryhmät</p><h2>Luokkasi.</h2></div><button className="teacher-dark-button" onClick={() => setShowForm(true)}><Plus size={16} /> Uusi luokka</button></div><div className="class-list">{(classes.length ? classes : [{ id: 'demo', name: 'Suomi arjessa · A1', class_type: 'general', target_language: 'fi', cefr_level: 'A1', join_code: 'OPIOPE24', member_count: 12 }, { id: 'demo2', name: 'Työelämän suomi · B1', class_type: 'work', target_language: 'fi', cefr_level: 'B1', join_code: 'TYO2026', member_count: 8 }]).map(item => <div className="class-row" key={item.id}><span className="level-chip">{item.cefr_level}</span><div><strong>{item.name}</strong><small>{item.member_count ?? 0} oppijaa · Liittymiskoodi {item.join_code}</small></div><ChevronRight /></div>)}</div></section>}

    {active === 'plans' && <section className="teacher-panel teacher-list-panel"><div className="panel-heading"><div><p className="eyebrow">Sisältötyökalut</p><h2>Tuntisuunnitelmat.</h2></div><button className="teacher-dark-button" onClick={() => setShowForm(true)}><Plus size={16} /> Luo suunnitelma</button></div><div className="class-list">{plans.map(plan => <div className="class-row" key={plan.title}><span className="plan-dot" /><div><strong>{plan.title}</strong><small>{plan.meta} · {plan.status}</small></div><ChevronRight /></div>)}</div></section>}

    {showForm && <div className="teacher-modal-backdrop" role="presentation" onClick={() => setShowForm(false)}><div className="teacher-modal" role="dialog" aria-modal="true" aria-labelledby="teacher-modal-title" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={() => setShowForm(false)} aria-label="Sulje">×</button><p className="eyebrow">Uusi työ</p><h2 id="teacher-modal-title">Aloita<br /><em>tästä.</em></h2><label>Nimi<input placeholder="Esimerkiksi: Viikon aloitus" /></label><label>Taso<select defaultValue="A1"><option>A1</option><option>A2</option><option>B1</option><option>B2</option></select></label><button className="teacher-dark-button full" onClick={() => setShowForm(false)}>Tallenna luonnoksena</button></div></div>}
  </main>
}
