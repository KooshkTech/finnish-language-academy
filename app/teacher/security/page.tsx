import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { TeacherMfaClient } from '@/components/teacher/TeacherMfaClient'
import { checkTeacherAccess } from '@/lib/security/teacher'

export const metadata: Metadata = { title: 'Opettajan turvallisuus', robots: { index: false, follow: false } }

export default async function TeacherSecurityPage(){
  const access=await checkTeacherAccess(false)
  if(!access.ok) redirect('/')
  if(access.mfaLevel==='aal2') redirect('/teacher')
  return <TeacherMfaClient/>
}

