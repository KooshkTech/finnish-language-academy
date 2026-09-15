'use client'
import { useEffect, useState } from 'react'
import { defaultLearningProfile, type AgeTier, type LearningProfileState } from '@/types/profile'

const KEY = 'opiope_learning_profile_v1'

function readGuestProfile(): LearningProfileState {
  if (typeof window === 'undefined') return defaultLearningProfile
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...defaultLearningProfile, ...JSON.parse(raw) as Partial<LearningProfileState> } : defaultLearningProfile
  } catch { return defaultLearningProfile }
}

export function LearningProfileSwitcher() {
  const [profile, setProfile] = useState<LearningProfileState>(() => readGuestProfile())
  const [syncLabel, setSyncLabel] = useState('guest')
  const [ageConfirmed13Plus, setAgeConfirmed13Plus] = useState(false)

  useEffect(() => { document.documentElement.dataset.ageTier = profile.ageTier }, [profile.ageTier])

  useEffect(() => {
    let cancelled = false
    const guest = readGuestProfile()
    void fetch('/api/profile/learning')
      .then(async response => ({ data: await response.json() as { authenticated?:boolean; profile?:{ age_tier?:AgeTier; learning_language?:'fi'|'sv'; cefr_level?:LearningProfileState['cefrLevel']; intensity?:LearningProfileState['intensity'] } } }))
      .then(({data}) => {
        if (cancelled || !data.authenticated || !data.profile) return
        const next:LearningProfileState={...guest,ageTier:data.profile.age_tier??guest.ageTier,learningLanguage:data.profile.learning_language??guest.learningLanguage,cefrLevel:data.profile.cefr_level??guest.cefrLevel,intensity:data.profile.intensity??guest.intensity}
        setProfile(next); localStorage.setItem(KEY,JSON.stringify(next)); setSyncLabel('account')
      }).catch(()=>undefined)
    return()=>{cancelled=true}
  },[])

  async function select(ageTier:AgeTier){
    const aiVoiceModel=ageTier==='kids'?'friendly-mascot':ageTier==='youth'?'warm-teacher':'academic-pro'
    const next={...profile,ageTier,voicePreferences:{...profile.voicePreferences,aiVoiceModel}} satisfies LearningProfileState
    setProfile(next);localStorage.setItem(KEY,JSON.stringify(next));setSyncLabel(ageTier==='kids'?'local only':'guest')
    try{
      const response=await fetch('/api/profile/learning',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({...next,ageConfirmed13Plus})})
      if(response.ok)setSyncLabel('account')
      else if(ageTier==='kids')setSyncLabel('local · guardian workflow needed')
      else if(ageTier==='youth'&&!ageConfirmed13Plus)setSyncLabel('local · confirm 13+ to sync')
    }catch{setSyncLabel('guest')}
  }

  return <div className="age-tier-switcher">
    <span>Oppijaprofiili</span>
    <div role="group" aria-label="Age-adaptive learning profile">{(['kids','youth','adult'] as const).map(tier=><button key={tier} type="button" aria-pressed={profile.ageTier===tier} onClick={()=>void select(tier)}>{tier==='kids'?'Kids 4–11':tier==='youth'?'Youth 12–17':'Adult / YKI'}</button>)}</div>
    {profile.ageTier==='youth' && <label className="age-confirm"><input type="checkbox" checked={ageConfirmed13Plus} onChange={e=>setAgeConfirmed13Plus(e.target.checked)}/> Olen vähintään 13-vuotias (vain tilisynkronointia varten)</label>}
    <small>{profile.ageTier==='kids'?'Kannustava tila; tilisynkronointi vaatii huoltaja-/organisaatioprosessin.':profile.ageTier==='youth'?'Tasapainoinen tila; alle 13-vuotiaan tilisynkronointi vaatii huoltajaprosessin.':'Täysi CEFR/YKI- ja accountability-näkymä.'} · {syncLabel}</small>
  </div>
}

