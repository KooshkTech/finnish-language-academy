import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/security/roles'
import InvitationAcceptButton from '@/components/communication/InvitationAcceptButton'

export const metadata={title:'Luokkakutsu | OpiOpe',robots:{index:false,follow:false}}
export default async function ClassInvitationPage({params}:{params:Promise<{token:string}>}){
  const {token}=await params;const {admin,user,profile}=await requireRole(['student']);const fi=profile.course_language!=='sv'
  const {data:invite}=await admin.from('class_invitations').select('id,class_id,course_language,target_student_id,status,expires_at,teacher_classes(name)').eq('invite_token',token).maybeSingle()
  if(!invite)notFound()
  const relation=invite.teacher_classes as {name?:string|null}|{name?:string|null}[]|null
  const className=Array.isArray(relation)?relation[0]?.name:relation?.name
  // eslint-disable-next-line react-hooks/purity -- request-time validity must be evaluated on the server.
  const valid=invite.status==='pending'&&new Date(invite.expires_at).getTime()>=Date.now()&&(!invite.target_student_id||invite.target_student_id===user.id)&&invite.course_language===profile.course_language
  return <main className="teacher-dashboard-page"><header className="teacher-settings-header"><Link href="/student">← {fi?'Opiskelijan työpöytä':'Studerandens arbetsyta'}</Link><div><p className="eyebrow">{fi?'LUOKKAKUTSU':'KLASSINBJUDAN'}</p><h1>{className??(fi?'Opettajan luokka':'Lärarklass')}</h1><p>{fi?'Opettaja on kutsunut sinut liittymään tähän luokkaan.':'Läraren har bjudit in dig till den här klassen.'}</p></div></header><section className="teacher-dashboard-card">{valid?<InvitationAcceptButton token={token} language={profile.course_language==='sv'?'sv':'fi'}/>:<p>{fi?'Kutsu ei ole voimassa tai se ei kuulu tälle tilille.':'Inbjudan är inte giltig eller hör inte till detta konto.'}</p>}</section></main>
}

