import { NextRequest, NextResponse } from 'next/server'
import { enforceRateLimit } from '@/lib/security/rate-limit'
import { createClient } from '@/lib/supabase/server'

const maxAudioBytes=12*1024*1024
const allowedAudio=new Set(['audio/webm','audio/mpeg','audio/wav','audio/x-wav','audio/mp4','audio/ogg'])

export async function POST(request:NextRequest){
  const supabase=await createClient();const userId=supabase?(await supabase.auth.getUser()).data.user?.id:undefined
  const allowed=await enforceRateLimit({request,scope:'voice-transcribe',identifier:userId,maxHits:userId?40:6,windowSeconds:60*60})
  if(!allowed)return NextResponse.json({error:'Puheentunnistuksen käyttöraja täyttyi. Yritä myöhemmin.'},{status:429})
  const form=await request.formData();const audio=form.get('audio');const language=form.get('language')==='sv'?'sv':'fi'
  if(!(audio instanceof File))return NextResponse.json({error:'Audio puuttuu.'},{status:400})
  if(!allowedAudio.has(audio.type))return NextResponse.json({error:'Audiotyyppiä ei tueta.'},{status:415})
  if(audio.size<1||audio.size>maxAudioBytes)return NextResponse.json({error:'Audio on liian suuri tai tyhjä.'},{status:413})
  const key=process.env.OPENAI_API_KEY
  if(!key)return NextResponse.json({error:'Puheentunnistus ei ole käytettävissä. Provideria ei ole konfiguroitu.'},{status:503})
  const provider=new FormData();provider.append('file',audio,audio.name||'speech.webm');provider.append('model',process.env.OPENAI_TRANSCRIBE_MODEL??'gpt-transcribe');provider.append('language',language)
  const response=await fetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{authorization:`Bearer ${key}`},body:provider,signal:AbortSignal.timeout(45_000)})
  if(!response.ok){console.error('Transcription provider failed',response.status);return NextResponse.json({error:'Puheentunnistus ei vastannut. Yritä myöhemmin.'},{status:502})}
  const data:unknown=await response.json();const text=data&&typeof data==='object'&&typeof(data as Record<string,unknown>).text==='string'?(data as Record<string,string>).text:''
  return NextResponse.json({text,pronunciationStatus:'Transkriptio valmis. OpiOpe ei arvaa fonetiikka- tai pitch-pistettä ilman erillistä arviointiadapteria.'})
}

