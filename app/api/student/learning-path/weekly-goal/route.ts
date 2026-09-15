import { NextRequest,NextResponse } from 'next/server'
import { requireRole } from '@/lib/security/roles'

function monday(){const now=new Date();const day=now.getUTCDay()||7;now.setUTCDate(now.getUTCDate()-day+1);return now.toISOString().slice(0,10)}
export async function PUT(request:NextRequest){const {admin,user}=await requireRole(['student']);const input=await request.json() as {targetMinutes?:number;targetLessons?:number};const targetMinutes=Math.trunc(Number(input.targetMinutes)),targetLessons=Math.trunc(Number(input.targetLessons));if(targetMinutes<10||targetMinutes>1400||targetLessons<1||targetLessons>50)return NextResponse.json({error:'Tavoite ei ole sallitulla alueella.'},{status:400});const {error}=await admin.from('student_weekly_goals').upsert({student_id:user.id,week_start:monday(),target_minutes:targetMinutes,target_lessons:targetLessons,updated_at:new Date().toISOString()},{onConflict:'student_id,week_start'});return error?NextResponse.json({error:'Tallennus epäonnistui.'},{status:500}):NextResponse.json({ok:true})}


