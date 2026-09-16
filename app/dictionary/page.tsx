import type { Metadata } from "next"
import { DictionaryClassroom } from "@/components/dictionary/DictionaryClassroom"
export const metadata: Metadata={title:"Finnish & Swedish Dictionary | OpiOpe",description:"OpiOpe dictionary with IPA, morphology, Finnish register comparisons and Swedish word forms."}
export default function DictionaryPage(){return <DictionaryClassroom/>}

