import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enforceRateLimit } from '@/lib/security/rate-limit'

const allowed = new Set(['application/pdf','image/png','image/jpeg','image/webp','audio/mpeg','audio/wav','audio/x-wav'])
const maxBytes = 15 * 1024 * 1024

function extensionFor(type:string){return ({'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg','image/webp':'webp','audio/mpeg':'mp3','audio/wav':'wav','audio/x-wav':'wav'} as Record<string,string>)[type] ?? 'bin'}
function bytesStart(bytes:Uint8Array, values:number[]){return values.every((v,i)=>bytes[i]===v)}
function ascii(bytes:Uint8Array,start:number,length:number){return String.fromCharCode(...bytes.slice(start,start+length))}
function signatureMatches(type:string,bytes:Uint8Array){
  if(type==='application/pdf') return ascii(bytes,0,5)==='%PDF-'
  if(type==='image/png') return bytesStart(bytes,[0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a])
  if(type==='image/jpeg') return bytesStart(bytes,[0xff,0xd8,0xff])
  if(type==='image/webp') return ascii(bytes,0,4)==='RIFF' && ascii(bytes,8,4)==='WEBP'
  if(type==='audio/wav'||type==='audio/x-wav') return ascii(bytes,0,4)==='RIFF' && ascii(bytes,8,4)==='WAVE'
  if(type==='audio/mpeg') return ascii(bytes,0,3)==='ID3' || (bytes[0]===0xff && (bytes[1]&0xe0)===0xe0)
  return false
}

export async function POST(request:NextRequest){
  const supabase=await createClient()
  if(!supabase)return NextResponse.json({error:'Tallennus ei ole konfiguroitu.'},{status:503})
  const {data:{user}}=await supabase.auth.getUser()
  if(!user)return NextResponse.json({error:'Kirjaudu sisään ennen pilvitallennusta.'},{status:401})
  const allowedRequest=await enforceRateLimit({request,scope:'upload',identifier:user.id,maxHits:12,windowSeconds:60*60})
  if(!allowedRequest)return NextResponse.json({error:'Latausraja täyttyi. Yritä myöhemmin.'},{status:429})

  const form=await request.formData();const file=form.get('file')
  if(!(file instanceof File))return NextResponse.json({error:'Tiedosto puuttuu.'},{status:400})
  if(!allowed.has(file.type))return NextResponse.json({error:'Tiedostotyyppiä ei tueta.'},{status:415})
  if(file.size<1||file.size>maxBytes)return NextResponse.json({error:'Tiedoston koko ei ole sallittu.'},{status:413})
  const bytes=new Uint8Array(await file.arrayBuffer())
  if(!signatureMatches(file.type,bytes))return NextResponse.json({error:'Tiedoston sisältö ei vastaa ilmoitettua tiedostotyyppiä.'},{status:415})

  const bucket=process.env.OPIOPE_UPLOAD_BUCKET??'learner-uploads'
  const path=`${user.id}/${randomUUID()}.${extensionFor(file.type)}`
  const {error}=await supabase.storage.from(bucket).upload(path,bytes,{contentType:file.type,upsert:false,cacheControl:'private, max-age=0'})
  if(error)return NextResponse.json({error:'Tallennus epäonnistui.'},{status:500})
  const processorConfigured=Boolean(process.env.OPENAI_API_KEY||process.env.OPIOPE_DOCUMENT_PROCESSOR_URL)
  const context=typeof form.get('context')==='string'?String(form.get('context')).slice(0,200):null
  const processingStatus=processorConfigured?'stored':'processor-not-configured'
  const {error:metadataError}=await supabase.from('learner_uploads').insert({user_id:user.id,storage_path:path,original_name:file.name.slice(0,180),mime_type:file.type,byte_size:file.size,learning_context:context,processing_status:processingStatus})
  if(metadataError){await supabase.storage.from(bucket).remove([path]);return NextResponse.json({error:'Metatietojen tallennus epäonnistui.'},{status:500})}
  return NextResponse.json({message:processorConfigured?'Tiedosto tallennettu turvallisesti.':'Tiedosto tallennettu. OCR/Whisper-provideria ei ole vielä konfiguroitu.',processingStatus})
}

