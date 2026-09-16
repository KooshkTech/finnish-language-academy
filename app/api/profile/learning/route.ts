import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const levels = new Set(['A0','A1','A2','B1','B2','C1','C2'])
type Payload = { ageTier?: 'kids'|'youth'|'adult'; learningLanguage?: 'fi'|'sv'; cefrLevel?: string; intensity?: 'casual'|'intensive'|'exam-sprint'; ageConfirmed13Plus?: boolean }

export async function GET() {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ configured:false })
  const { data:{ user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ authenticated:false })
  const { data, error } = await supabase.from('learning_profiles').select('age_tier,learning_language,cefr_level,intensity,selected_mascot,speech_rate,auto_listen,ai_voice_model').eq('user_id',user.id).maybeSingle()
  if (error) return NextResponse.json({ error:'Oppimisprofiilia ei voitu lukea.' }, { status:500 })
  return NextResponse.json({ authenticated:true, profile:data })
}

export async function PUT(request:NextRequest){
  let body:Payload
  try { body = await request.json() as Payload } catch { return NextResponse.json({error:'Virheellinen pyyntö.'},{status:400}) }
  const supabase=await createClient()
  if(!supabase)return NextResponse.json({error:'Palvelu ei ole konfiguroitu.'},{status:503})
  const {data:{user}}=await supabase.auth.getUser()
  if(!user)return NextResponse.json({error:'Kirjautuminen vaaditaan.'},{status:401})

  const ageTier = body.ageTier ?? 'adult'
  if (ageTier === 'kids') {
    return NextResponse.json({ error:'Lasten tilin synkronointi vaatii huoltaja-/organisaatiokohtaisen hyväksyntäprosessin. Kids-tila toimii tällä hetkellä paikallisesti tällä laitteella.', requiresGuardianWorkflow:true }, { status:403 })
  }
  if (ageTier === 'youth' && body.ageConfirmed13Plus !== true) {
    return NextResponse.json({ error:'Nuorisoprofiilin tilisynkronointia varten vahvista 13+ tai käytä huoltajan hyväksyntäprosessia.', requiresAgeConfirmation:true }, { status:403 })
  }

  const learningLanguage = body.learningLanguage === 'sv' ? 'sv' : 'fi'
  const cefrLevel = levels.has(String(body.cefrLevel)) ? String(body.cefrLevel) : 'A0'
  const intensity = ['casual','intensive','exam-sprint'].includes(String(body.intensity)) ? body.intensity : 'casual'
  const row={user_id:user.id,age_tier:ageTier,learning_language:learningLanguage,cefr_level:cefrLevel,intensity,updated_at:new Date().toISOString()}
  const {error}=await supabase.from('learning_profiles').upsert(row,{onConflict:'user_id'})
  if(error)return NextResponse.json({error:'Oppimisprofiilia ei voitu tallentaa.'},{status:500})
  return NextResponse.json({ok:true})
}

