import { ClassroomNav } from "@/components/classroom/ClassroomNav"
import { ScheduleBoard } from "@/components/classroom/ScheduleBoard"
import { LearningProfileSwitcher } from "@/components/classroom/LearningProfileSwitcher"
export default function SchedulePage(){return <div className="classroom-shell"><ClassroomNav/><main className="classroom-main"><header className="classroom-header"><div><p className="eyebrow">VIIKKO-OHJELMA</p><h1>Viikko-ohjelma</h1><p>Palvelin rakentaa kirjautuneelle oppijalle viikko-ohjelman ikäprofiilin, opiskeluintensiteetin ja aikavyöhykkeen mukaan. Määräaika on 23.59 paikallista aikaa.</p></div></header><LearningProfileSwitcher/><ScheduleBoard/><section className="accountability-note"><h2>Seuranta ilman manipulointia</h2><p>Aikuisten ja nuorten profiileissa myöhästynyt tehtävä voi avata lisäkertauksen. Lasten profiilissa myöhästynyt tehtävä ei vähennä pisteitä eikä käytä rankaisevaa toimintoa; tilalle tulee kannustava kertaus.</p></section></main></div>}

