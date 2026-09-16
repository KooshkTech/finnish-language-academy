import { notFound, redirect } from 'next/navigation'
import { getLearningLevel, isLevelSkill } from '@/data/levels'
import { getSwedishLevelSkillModule, isSwedishSkill } from '@/data/swedish-level-curriculum'
import { SwedishLevelSkillClassroom } from '@/components/classroom/SwedishLevelSkillClassroom'

const allowedLanguages = new Set(['fi', 'sv'])
type Props = { params: Promise<{ language: string; level: string; skill: string }> }

export async function generateMetadata({ params }: Props) {
  const { language, level: levelId, skill } = await params
  const level = getLearningLevel(levelId)
  if (!allowedLanguages.has(language) || !level || !isLevelSkill(skill) || skill === 'yki-test') notFound()
  if (language === 'fi') return {}
  if (!isSwedishSkill(skill)) notFound()
  const skillMetadata = getSwedishLevelSkillModule(level.id, skill)
  return { title: `${skillMetadata.title} – ${level.label}`, description: skillMetadata.subtitle, alternates: { canonical: `/course/sv/levels/${level.id}/${skill}` }, openGraph: { title: skillMetadata.title, description: skillMetadata.subtitle, locale: 'sv_FI', url: `/course/sv/levels/${level.id}/${skill}` }, twitter: { card: 'summary' as const, title: skillMetadata.title, description: skillMetadata.subtitle } }
}

export default async function CourseSkillPage({ params }: Props) {
  const { language, level: levelId, skill } = await params
  const level = getLearningLevel(levelId)
  if (!allowedLanguages.has(language) || !level || !isLevelSkill(skill) || skill === 'yki-test') notFound()

  if (language === 'fi') redirect(`/levels/${level.id}/${skill}`)
  if (!isSwedishSkill(skill)) notFound()

  const skillModule = getSwedishLevelSkillModule(level.id, skill)
  return <SwedishLevelSkillClassroom level={level.label} module={skillModule} />
}
