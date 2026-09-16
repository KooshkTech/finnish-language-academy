import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Blackboard } from '@/components/classroom/Blackboard'
import { LevelNav } from '@/components/classroom/LevelNav'
import { getLearningLevel, levelSkills } from '@/data/levels'
import { LevelResources } from '@/components/classroom/LevelResources'

export async function generateMetadata({ params }: { params: Promise<{ level: string }> }): Promise<Metadata> {
  const { level: levelId } = await params
  const level = getLearningLevel(levelId)
  if (!level) return {}
  return {
    title: `${level.label} ${level.title} – kielikurssi`,
    description: `${level.label}-tason oppimisympäristö: kuuntelu, lukeminen, kirjoittaminen, kielioppi, sanasto, puhuminen ja YKI-harjoittelu. ${level.description}`,
    alternates: { canonical: `/levels/${level.id}` },
  }
}

export default async function LevelPage({ params }: { params: Promise<{ level: string }> }) {
  const { level: levelId } = await params
  const level = getLearningLevel(levelId)
  if (!level) notFound()
  return <div className="level-classroom-shell">
    <LevelNav level={level.id}/>
    <main className="level-classroom-main">
      <header className="level-classroom-header level-overview-header"><div><p className="eyebrow">OPIOPE · TASO {level.label} · {level.range}/100</p><h1>{level.title}</h1><p>{level.description}</p></div></header>
      <section className="level-overview-grid">
        <div className="level-skill-list"><h2>Mitä haluat opiskella tänään?</h2><p>Valitse yksi taito. Jokaisella sivulla on oma oppitunti, Blackboard ja testi.</p>{levelSkills.map((skill,index)=><Link key={skill.slug} href={`/levels/${level.id}/${skill.slug}`} className="level-skill-card"><span>{String(index+1).padStart(2,'0')}</span><div><strong>{skill.label}</strong><small>{skill.description}</small></div><b>→</b></Link>)}</div>
        <Blackboard storageKey={`opiope-board-${level.id}-overview`} blocks={[{type:'note',title:`Taso ${level.label}`,body:`${level.title}. Etene yksi taito kerrallaan ja tee testi oppitunnin lopuksi.`},{type:'table',title:'Tämän tason rakenne',rows:[['Kuuntele','Ymmärrä puhetta'],['Lue','Ymmärrä tekstiä'],['Kirjoita','Tuota kieltä'],['Ymmärrä','Hallitse rakenteet'],['Testaa','Varmista osaaminen']]}]}/>
      </section>
      <LevelResources level={level.id}/>
    </main>
  </div>
}

