'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Notice = { id:string; title:string; body:string; link_path:string|null; read_at:string|null; created_at:string }

export default function NotificationCenter({ items, language }: { items: Notice[]; language: 'fi'|'sv' }) {
  const fi = language === 'fi'
  const router = useRouter()
  const [busy,setBusy] = useState<string|null>(null)
  async function markRead(id:string){
    setBusy(id)
    await fetch('/api/notifications/read',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id})})
    setBusy(null)
    router.refresh()
  }
  if(!items.length) return <p>{fi?'Ei uusia ilmoituksia.':'Inga nya aviseringar.'}</p>
  return <div className="student-progress-list">{items.map(item=><div key={item.id} className="student-progress-row" style={{alignItems:'flex-start'}}><div style={{display:'grid',gap:4}}><strong>{item.title}</strong>{item.body?<span>{item.body}</span>:null}<small>{new Date(item.created_at).toLocaleString(fi?'fi-FI':'sv-SE')}</small><div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:6}}>{item.link_path?<Link href={item.link_path}>{fi?'Avaa':'Öppna'} →</Link>:null}{!item.read_at?<button type="button" className="secondary-button" disabled={busy===item.id} onClick={()=>markRead(item.id)}>{busy===item.id?(fi?'Tallennetaan…':'Sparar…'):(fi?'Merkitse luetuksi':'Markera som läst')}</button>:<small>{fi?'Luettu':'Läst'}</small>}</div></div>{!item.read_at?<b aria-label={fi?'Uusi ilmoitus':'Ny avisering'}>●</b>:null}</div>)}</div>
}

