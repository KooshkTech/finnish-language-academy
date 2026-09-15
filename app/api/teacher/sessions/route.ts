import { NextResponse } from 'next/server'
import { checkTeacherAccess } from '@/lib/security/teacher'
import { createAdminClient } from '@/lib/supabase/admin'
export async function GET(){const access=await checkTeacherAccess(true);if(!access.ok)return NextResponse.json({error:'Opettajan käyttöoikeus vaaditaan.'},{status:access.reason==='mfa-required'?403:401});const admin=createAdminClient();if(!admin)return NextResponse.json({error:'Palvelin ei ole konfiguroitu.'},{status:503});const {data,error}=await admin.from('class_sessions').select('id,class_id,title,starts_at,ends_at,status,location_text,meeting_url,teacher_classes(name)').eq('teacher_id',access.userId).eq('course_language',access.courseLanguage).order('starts_at',{ascending:true}).limit(100);if(error)return NextResponse.json({error:'Tuntien lataus epäonnistui.'},{status:500});return NextResponse.json({items:data??[]})}

