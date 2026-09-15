import type { Metadata } from 'next'
import { StandaloneQASkillPage } from '@/components/classroom/StandaloneQASkillPage'
export const metadata:Metadata={title:'Kirjoittamisen harjoittelu | OpiOpe',description:'Harjoittele kirjoittamista ja saat jäsenneltyä palautetta kieliopista, rekisteristä ja sanastosta.'}
export default function Page(){return <StandaloneQASkillPage skill="writing"/>}

