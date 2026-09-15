import type { Metadata } from "next"
import { ArcadeClassroom } from "@/components/arcade/ArcadeClassroom"
export const metadata:Metadata={title:"Pelaa & opi | OpiOpe Arcade",description:"Finnish and Swedish learning games for vocabulary, compounds and grammar."}
export default function ArcadePage(){return <ArcadeClassroom/>}

