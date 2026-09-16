import type { Metadata } from 'next'
import { StandaloneQASkillPage } from '@/components/classroom/StandaloneQASkillPage'
export const metadata:Metadata={title:'Puhumisen kysymys–vastaus | OpiOpe',description:'Harjoittele suomen puhumista tasokohtaisilla kysymyksillä, mikrofonivastauksilla, palautteella ja Blackboard-muistiinpanoilla.'}
export default function Page(){return <StandaloneQASkillPage skill="speaking"/>}

