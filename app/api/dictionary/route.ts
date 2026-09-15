import { NextRequest, NextResponse } from 'next/server'
import { lookupDictionary } from '@/services/dictionary'
import { enforceRateLimit } from '@/lib/security/rate-limit'

export async function GET(request:NextRequest){
  const query=request.nextUrl.searchParams.get('q')?.trim()??''
  const lang=request.nextUrl.searchParams.get('lang')
  if(!query)return NextResponse.json({query,entries:[]})
  if(query.length>120)return NextResponse.json({error:'Hakusana on liian pitkä.'},{status:413})
  const allowed=await enforceRateLimit({request,scope:'dictionary',identifier:query.toLowerCase(),maxHits:120,windowSeconds:60})
  if(!allowed)return NextResponse.json({error:'Liian monta hakua. Yritä hetken kuluttua.'},{status:429})
  const language=lang==='sv'?'sv':lang==='fi'?'fi':undefined
  return NextResponse.json(lookupDictionary(query,language))
}

