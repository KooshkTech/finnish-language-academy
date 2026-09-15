'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpenCheck, ChevronDown, GraduationCap, Settings2, ShieldCheck } from 'lucide-react'
import type { TeacherPreferences } from '@/types/smart'

const KEY = 'opiope_teacher_preferences_v1'
const defaults: TeacherPreferences = { compactMode:false, showAnswerImmediately:true, requireBlackboardWork:false, strictAssessment:false, showExternalResources:true, showSmartAssistant:true }
function readPreferences(): TeacherPreferences { if (typeof window === 'undefined') return defaults; try { const raw=window.localStorage.getItem(KEY); return raw ? {...defaults,...(JSON.parse(raw) as Partial<TeacherPreferences>)} : defaults } catch { return defaults } }

export function TeacherSettingsClient() {
  const [settings,setSettings] = useState<TeacherPreferences>(readPreferences)
  function toggle(key:keyof TeacherPreferences,checked:boolean){const next={...settings,[key]:checked};setSettings(next);window.localStorage.setItem(KEY,JSON.stringify(next))}
  return <main className="teacher-settings-page">
    <header className="teacher-settings-header"><Link href="/teacher">← Opettajan työtila</Link><div><p className="eyebrow">OPETTAJAN TYÖKALUT</p><h1>Opettajan asetukset</h1><p>Opettajan työtila on palvelinpuolella suojattu ja MFA vaaditaan. Näkymäasetukset tallentuvat tällä hetkellä tähän selaimeen.</p></div></header>
    <section className="teacher-settings-stack">
      <details open><summary><GraduationCap size={18}/> Opetustapa <ChevronDown size={17}/></summary><div className="teacher-toggle-grid">
        <Toggle label="Tiivis luokkanäkymä" text="Näytä vähemmän selittävää tekstiä kerralla." checked={settings.compactMode} onChange={v=>toggle('compactMode',v)}/>
        <Toggle label="Näytä palaute heti" text="Harjoitus näyttää palautteen vastauksen jälkeen." checked={settings.showAnswerImmediately} onChange={v=>toggle('showAnswerImmediately',v)}/>
        <Toggle label="Blackboard-työ vaaditaan" text="Pedagoginen valinta ennen etenemistä." checked={settings.requireBlackboardWork} onChange={v=>toggle('requireBlackboardWork',v)}/>
        <Toggle label="Tiukka arviointitila" text="Korostaa hyväksymisrajoja ilman virallista YKI-väitettä." checked={settings.strictAssessment} onChange={v=>toggle('strictAssessment',v)}/>
      </div></details>
      <details><summary><BookOpenCheck size={18}/> Oppimisen työkalut <ChevronDown size={17}/></summary><div className="teacher-toggle-grid">
        <Toggle label="Ulkoiset resurssit" text="Näytä Kahoot, Teams, Yle ja muut tukilinkit." checked={settings.showExternalResources} onChange={v=>toggle('showExternalResources',v)}/>
        <Toggle label="Tarkka älyapu" text="Näytä opiskelijalle sana- ja lauseanalyysin pikatyökalu." checked={settings.showSmartAssistant} onChange={v=>toggle('showSmartAssistant',v)}/>
      </div></details>
      <details><summary><ShieldCheck size={18}/> Turvallisuus <ChevronDown size={17}/></summary><div className="teacher-info-card"><Settings2 size={18}/><div><strong>Invitation-only + MFA</strong><p>Opettajaoikeus tulee vain hyväksytystä teacher_access-tietueesta. Selain ei voi korottaa roolia. MFA tarkistetaan palvelimella ennen tätä sivua.</p></div></div></details>
    </section>
    <p className="teacher-settings-studio-link"><Link href="/teacher/content-studio">Avaa sisältöstudio →</Link></p>
  </main>
}
function Toggle({label,text,checked,onChange}:{label:string;text:string;checked:boolean;onChange:(v:boolean)=>void}){return <label className="teacher-toggle"><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/><span><strong>{label}</strong><small>{text}</small></span></label>}

