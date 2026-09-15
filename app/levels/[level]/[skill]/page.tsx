import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LevelSkillClassroom } from '@/components/classroom/LevelSkillClassroom'
import { getLevelSkillModule } from '@/data/level-curriculum'
import { getLearningLevel, isLevelSkill, levelSkills } from '@/data/levels'

export async function generateMetadata({ params }: { params: Promise<{ level: string; skill: string }> }): Promise<Metadata> {
  const { level: levelId, skill } = await params
  const level = getLearningLevel(levelId)
  if (!level || !isLevelSkill(skill)) return {}
  const skillMeta = levelSkills.find(item => item.slug === skill)
  return {
    title: `${level.label} ${skillMeta?.label ?? skill} – harjoittelu`,
    description: `${level.label}-tason ${skillMeta?.label.toLowerCase() ?? skill} OpiOpessa: oppitunti, interaktiivinen Blackboard, harjoitukset, flashcards ja testi samassa selkeässä polussa.`,
    alternates: { canonical: `/levels/${level.id}/${skill}` },
  }
}

export default async function LevelSkillPage({ params }: { params: Promise<{ level: string; skill: string }> }) {
  const { level: levelId, skill } = await params
  const level = getLearningLevel(levelId)
  if (!level || !isLevelSkill(skill)) notFound()
  const lessonModule = getLevelSkillModule(level.id, skill)
  return <LevelSkillClassroom level={level.label} module={lessonModule}/>
}

