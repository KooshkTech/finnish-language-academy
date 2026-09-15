'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarCheck2 } from 'lucide-react'

type DailyItem = { id:string; slug:string; cefr_level:string; skill:string; title:string; objective:string; publish_at:string; audience:string }

export function DailyLessonFeed() {
  const [items,setItems] = useState<DailyItem[]>([])
  useEffect(() => { fetch('/api/lessons/daily').then(response => response.ok ? response.json() : null).then(data => setItems(data?.items ?? [])).catch(() => undefined) }, [])
  if (!items.length) return null
  return <section className="daily-lessons-section" aria-label="Päivän oppitunnit"><div className="daily-lessons-heading"><div><p className="eyebrow">PÄIVÄN OPPITUNNIT</p><h2>Uutta juuri nyt.</h2></div><CalendarCheck2 size={30}/></div><div className="daily-lessons-grid">{items.slice(0,6).map(item=><Link key={item.id} href={`/daily-lessons/${item.slug}`} className="daily-lesson-card"><div><span>{item.cefr_level}</span><span>{item.skill}</span>{item.audience !== 'public' && <span>sinulle</span>}</div><h3>{item.title}</h3><p>{item.objective}</p><small>{new Intl.DateTimeFormat('fi-FI',{day:'2-digit',month:'2-digit'}).format(new Date(item.publish_at))} · Aloita →</small></Link>)}</div></section>
}

