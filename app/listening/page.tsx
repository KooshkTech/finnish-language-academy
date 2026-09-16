import type { Metadata } from 'next'
import { StandaloneQASkillPage } from '@/components/classroom/StandaloneQASkillPage'
export const metadata:Metadata={title:'Kuunteluharjoittelu | OpiOpe',description:'Harjoittele kuullun ymmärtämistä ja sanelua välittömän oppimispalautteen avulla.'}
export default function Page(){return <StandaloneQASkillPage skill="listening"/>}

