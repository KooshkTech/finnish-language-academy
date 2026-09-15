import type { Metadata } from "next"
import { ClassroomNav } from "@/components/classroom/ClassroomNav"
import { LiveQuizLobby } from "@/components/arcade/LiveQuizLobby"
export const metadata:Metadata={title:"Reaaliaikainen tietovisa | OpiOpe",description:"Luo tai liity OpiOpen reaaliaikaiseen luokkahuoneen tietovisaan."}
export default function LiveArcadePage(){return <div className="classroom-shell"><ClassroomNav/><main className="classroom-main"><header className="classroom-header"><div><p className="eyebrow">REAALIAIKAINEN LUOKKA</p><h1>Reaaliaikainen tietovisa</h1><p>PIN-koodilla suojattu luokkahuonepeli, jossa vastaukset tarkistetaan palvelimella ja huoneen tila päivittyy reaaliajassa.</p></div></header><LiveQuizLobby/></main></div>}

