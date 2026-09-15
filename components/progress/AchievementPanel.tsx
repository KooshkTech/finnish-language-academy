import { requireRole } from '@/lib/security/roles'

const levelOrder=['A0','A1','A2','B1','B2','C1','C2']
export default async function AchievementPanel(){
  const {admin,user,profile}=await requireRole(['student']);const fi=profile.course_language!=='sv'
  const [{data:state},{count:completed}]=await Promise.all([admin.from('user_accountability').select('cefr_level,current_streak,xp_total').eq('user_id',user.id).maybeSingle(),admin.from('lesson_progress').select('id',{count:'exact',head:true}).eq('user_id',user.id).not('completed_at','is',null)])
  const xp=state?.xp_total??0,streak=state?.current_streak??0,lessons=completed??0,level=state?.cefr_level??profile.current_level??'A0',levelIndex=Math.max(0,levelOrder.indexOf(level))
  const badges=[{icon:'🌱',fi:'Ensimmäinen oppitunti',sv:'Första lektionen',earned:lessons>=1,progress:`${Math.min(lessons,1)}/1`},{icon:'📚',fi:'10 oppituntia',sv:'10 lektioner',earned:lessons>=10,progress:`${Math.min(lessons,10)}/10`},{icon:'⚡',fi:'100 XP',sv:'100 XP',earned:xp>=100,progress:`${Math.min(xp,100)}/100`},{icon:'🏆',fi:'500 XP',sv:'500 XP',earned:xp>=500,progress:`${Math.min(xp,500)}/500`},{icon:'🔥',fi:'3 päivän putki',sv:'3 dagars serie',earned:streak>=3,progress:`${Math.min(streak,3)}/3`},{icon:'⭐',fi:'7 päivän putki',sv:'7 dagars serie',earned:streak>=7,progress:`${Math.min(streak,7)}/7`},{icon:'🎓',fi:'Saavuta B1',sv:'Nå B1',earned:levelIndex>=3,progress:level}]
  return <section id="achievements" style={{marginTop:36}}><div className="student-progress-heading"><div><p className="eyebrow">{fi?'SAAVUTUKSET':'PRESTATIONER'}</p><h2>{fi?'Ansaitut merkit':'Intjänade märken'}</h2></div><strong>{badges.filter(b=>b.earned).length}/{badges.length}</strong></div><div className="teacher-dashboard-grid">{badges.map(b=><article key={b.fi} className="teacher-dashboard-card" style={{opacity:b.earned?1:.55}}><span style={{fontSize:30}}>{b.earned?b.icon:'🔒'}</span><h3>{fi?b.fi:b.sv}</h3><p>{b.earned?(fi?'Ansaittu':'Intjänad'):`${fi?'Edistyminen':'Framsteg'}: ${b.progress}`}</p></article>)}</div></section>
}

