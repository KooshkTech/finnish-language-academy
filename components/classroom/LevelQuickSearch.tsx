'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpenCheck, Search } from 'lucide-react'
import { levelSkills, type LearningLevelId, type LevelSkillSlug } from '@/data/levels'
import { getLevelSkillModule } from '@/data/level-curriculum'

function normalize(value: string) {
  return value.toLocaleLowerCase('fi-FI').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
}

export function LevelQuickSearch({ level }: { level: LearningLevelId }) {
  const [query,setQuery] = useState('')
  const items = useMemo(()=>levelSkills.map(skill=>{
    const lessonModule = getLevelSkillModule(level, skill.slug as LevelSkillSlug)
    return {
      skill: skill.slug,
      label: skill.label,
      title: lessonModule.title,
      subtitle: lessonModule.subtitle,
      terms: [lessonModule.title,lessonModule.subtitle,skill.label,skill.description,'oppitunti lesson harjoitus exercise testi test flashcards',...lessonModule.learn,...lessonModule.examples.flatMap(item=>[item.source,item.target]),...lessonModule.flashcards.flatMap(item=>[item.front,item.back])].join(' '),
    }
  }),[level])
  const normalized = normalize(query.trim())
  const results = normalized ? items.filter(item=>normalize(`${item.label} ${item.terms}`).includes(normalized)).slice(0,6) : []

  return <details className="level-quick-search" open>
    <summary><Search size={15}/> Hae vain tasolta {level.toUpperCase()}</summary>
    <div className="level-search-input"><Search size={16}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="esim. partitiivi, kuuntelu, työ, testi…"/></div>
    {query && <div className="level-search-results">{results.length ? results.map(item=><Link key={item.skill} href={`/levels/${level}/${item.skill}`}><BookOpenCheck size={16}/><span><strong>{item.title}</strong><small>{item.subtitle}</small></span><b>→</b></Link>) : <p>Ei osumaa tällä tasolla. Kokeile toista sanaa.</p>}</div>}
  </details>
}

