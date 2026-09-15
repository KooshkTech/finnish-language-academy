'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Enrollment = { id: string; totp: { qr_code: string; secret: string; uri: string } }

export function TeacherMfaClient() {
  const router = useRouter()
  const [enrollment,setEnrollment] = useState<Enrollment | null>(null)
  const [code,setCode] = useState('')
  const [message,setMessage] = useState('Opettajan työtila vaatii toisen tunnistautumistekijän.')
  const [busy,setBusy] = useState(false)

  async function enroll(){
    setBusy(true)
    try {
      const supabase=createClient()
      const { data:list }=await supabase.auth.mfa.listFactors()
      const verified=list?.totp?.find(f=>f.status==='verified')
      if(verified){setMessage('MFA on jo rekisteröity. Syötä nykyisen autentikaattorin 6-numeroinen koodi.');setEnrollment({id:verified.id,totp:{qr_code:'',secret:'',uri:''}});return}
      const {data,error}=await supabase.auth.mfa.enroll({factorType:'totp',friendlyName:'OpiOpe Teacher'})
      if(error){setMessage(error.message);return}
      setEnrollment(data as Enrollment);setMessage('Skannaa QR-koodi autentikaattorisovelluksella ja syötä 6-numeroinen koodi.')
    } finally {setBusy(false)}
  }

  async function verify(){
    if(!enrollment||!/^[0-9]{6}$/.test(code)){setMessage('Syötä 6-numeroinen koodi.');return}
    setBusy(true)
    try{
      const supabase=createClient()
      const {data:challenge,error:challengeError}=await supabase.auth.mfa.challenge({factorId:enrollment.id})
      if(challengeError){setMessage(challengeError.message);return}
      const {error}=await supabase.auth.mfa.verify({factorId:enrollment.id,challengeId:challenge.id,code})
      if(error){setMessage('Koodi ei kelpaa. Tarkista autentikaattori ja yritä uudelleen.');return}
      router.push('/teacher/settings')
    } finally {setBusy(false)}
  }

  return <main className="teacher-settings-page"><section className="role-login-panel"><div><p className="eyebrow">OPETTAJAN TURVALLISUUS</p><h1>MFA vaaditaan</h1><p>{message}</p></div><div>
    {!enrollment && <button type="button" onClick={()=>void enroll()} disabled={busy}>{busy?'Valmistellaan…':'Ota MFA käyttöön / jatka'}</button>}
    {enrollment?.totp.qr_code && <div><Image unoptimized src={enrollment.totp.qr_code} alt="TOTP QR-koodi" width={220} height={220}/><p>Jos QR ei toimi, secret: <code>{enrollment.totp.secret}</code></p></div>}
    {enrollment && <><label>6-numeroinen koodi<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,''))}/></label><button type="button" onClick={()=>void verify()} disabled={busy}>Vahvista MFA</button></>}
  </div></section></main>
}

