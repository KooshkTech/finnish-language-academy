import Link from 'next/link'

export default function StudentAppHub({language,classId,unread}:{language:'fi'|'sv';classId:string|null;unread:number}){
  const fi=language==='fi',classHref=classId?`/student/classes/${classId}`:'/join-class'
  const apps=[
    {icon:'📚',title:fi?'Kurssit':'Kurser',text:fi?'Tasot A0–C2 ja oppitunnit':'Nivåer A0–C2 och lektioner',href:`/course/${language}/levels`},
    {icon:'📰',title:fi?'Luokan syöte':'Klassflöde',text:classId?(fi?'Julkaisut ja ilmoitukset':'Inlägg och meddelanden'):(fi?'Liity ensin luokkaan':'Gå först med i en klass'),href:classHref},
    {icon:'🎥',title:fi?'Live-tunnit':'Livelektioner',text:fi?'Kalenteri, paikka ja liittymislinkki':'Kalender, plats och anslutningslänk',href:classHref},
    {icon:'🏆',title:'Level Up',text:fi?'XP, putket ja saavutukset':'XP, serier och prestationer',href:'/student#achievements'},
    {icon:'💬',title:fi?'Viestit':'Meddelanden',text:unread?`${unread} ${fi?'uutta ilmoitusta':'nya aviseringar'}`:(fi?'Ei uusia ilmoituksia':'Inga nya aviseringar'),href:classHref},
  ]
  return <section style={{marginTop:28}} aria-labelledby="student-apps-title"><div className="student-progress-heading"><div><p className="eyebrow">OPIOPE APPS</p><h2 id="student-apps-title">{fi?'Oppimiskeskus':'Lärcenter'}</h2></div></div><div className="teacher-dashboard-grid">{apps.map(app=><Link className="teacher-dashboard-card" href={app.href} key={app.title} style={{display:'block'}}><span aria-hidden="true" style={{fontSize:28}}>{app.icon}</span><h3>{app.title}</h3><p>{app.text}</p><strong>{fi?'Avaa':'Öppna'} →</strong></Link>)}</div></section>
}

