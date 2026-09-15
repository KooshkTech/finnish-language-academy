import { notFound, redirect } from 'next/navigation'
import { getLearningLevel, isLevelSkill } from '@/data/levels'
import { getSwedishLevelSkillModule, isSwedishSkill } from '@/data/swedish-level-curriculum'
import { SwedishLevelSkillClassroom } from '@/components/classroom/SwedishLevelSkillClassroom'

const allowedLanguages = new Set(['fi', 'sv'])
type Props = { params: Promise<{ language: string; level: string; skill: string }> }

export default async function CourseSkillPage({ params }: Props) {
  const { language, level: levelId, skill } = await params
  const level = getLearningLevel(levelId)
  if (!allowedLanguages.has(language) || !level || !isLevelSkill(skill) || skill === 'yki-test') notFound()

  if (language === 'fi') redirect(`/levels/${level.id}/${skill}`)
  if (!isSwedishSkill(skill)) notFound()

  const skillModule = getSwedishLevelSkillModule(level.id, skill)
  return <SwedishLevelSkillClassroom level={level.label} module={skillModule} />
}

