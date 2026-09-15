import type { Metadata } from 'next'
import { StandaloneQASkillPage } from '@/components/classroom/StandaloneQASkillPage'
export const metadata:Metadata={title:'Kieliopin harjoittelu | OpiOpe',description:'Harjoittele kielioppia ja ymmärtämistä kysymysten, vastausten ja taulupalautteen avulla.'}
export default function Page(){return <StandaloneQASkillPage skill="understanding"/>}

