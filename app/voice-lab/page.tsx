import type { Metadata } from "next"
import { VoiceLabClassroom } from "@/components/classroom/VoiceLabClassroom"
export const metadata:Metadata={title:"Äänilaboratorio | OpiOpe",description:"Harjoittele suomen tai ruotsin puhumista turvallisella äänityksellä ja käytännön tilanteilla."}
export default function VoiceLabPage(){return <VoiceLabClassroom/>}

