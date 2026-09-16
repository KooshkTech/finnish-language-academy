import Link from "next/link"
import { navModules } from "@/data/classroom"

export function ClassroomNav() {
  return <aside className="classroom-sidebar" aria-label="Oppimismoduulit">
    <Link href="/" className="classroom-brand"><span>OO</span><strong>OpiOpe</strong></Link>
    <nav>{navModules.map(item => <Link key={item.href} href={item.href}><strong>{item.label}</strong><span>{item.short}</span></Link>)}</nav>
    <Link href="/schedule" className="schedule-link">Viikko-ohjelma</Link>
  </aside>
}

