import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase=await createClient(); const admin=createAdminClient()
  if(!supabase||!admin) return NextResponse.json({error:'Palvelin ei ole konfiguroitu.'},{status:503})
  const {data}=await supabase.auth.getUser(); const user=data.user
  if(!user) return NextResponse.json({error:'Kirjaudu sisään.'},{status:401})
  const body=await request.json() as {id?:string}; const id=String(body.id??'')
  if(!id) return NextResponse.json({error:'Ilmoitus puuttuu.'},{status:400})
  const {error}=await admin.from('user_notifications').update({read_at:new Date().toISOString()}).eq('id',id).eq('user_id',user.id)
  if(error) return NextResponse.json({error:'Ilmoituksen päivitys epäonnistui.'},{status:500})
  return NextResponse.json({ok:true})
}

