import Link from 'next/link'
import { Contact } from 'lucide-react'
import { levelSkills, getLearningLevel } from '@/data/levels'
import { LevelQuickSearch } from './LevelQuickSearch'

export function LevelNav({ level }: { level: string }) {
  const current = getLearningLevel(level)
  if (!current) return null
  const base = `/levels/${current.id}`
  return <aside className="level-sidebar" aria-label={`${current.label} oppimisvalikko`}>
    <Link href="/learn" className="level-brand"><span>OO</span><strong>OpiOpe</strong></Link>
    <div className="level-current"><small>VALITTU TASO</small><strong>{current.label}</strong></div>
    <LevelQuickSearch level={current.id}/>
    <nav>
      <Link href={base}>Tason pääsivu</Link>
      {levelSkills.map(skill => <Link key={skill.slug} href={`${base}/${skill.slug}`}><strong>{skill.label}</strong><span>{skill.description}</span></Link>)}
    </nav>
    <div className="level-side-tools">
      <Link href="/contacts"><Contact size={16}/> Yhteystiedot</Link>
    </div>
    <Link href="/learn" className="level-change">Vaihda tasoa</Link>
  </aside>
}

