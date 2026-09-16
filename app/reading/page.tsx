import type { Metadata } from 'next'
import { StandaloneQASkillPage } from '@/components/classroom/StandaloneQASkillPage'
export const metadata:Metadata={title:'Interactive Reading Q&A | OpiOpe',description:'Level-based Finnish reading comprehension with contextual questions and Blackboard feedback.'}
export default function Page(){return <StandaloneQASkillPage skill="reading"/>}

