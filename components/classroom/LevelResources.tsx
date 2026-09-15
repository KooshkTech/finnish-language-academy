import { BookMarked, ExternalLink, Gamepad2, Languages, Newspaper, Radio, Video } from 'lucide-react'
import { isResourceRecommended, levelResources } from '@/data/smart-resources'
import type { LearningLevelId } from '@/data/levels'

const icons = {
  game: Gamepad2,
  classroom: Video,
  news: Newspaper,
  dictionary: BookMarked,
  language: Languages,
} as const

export function LevelResources({ level }: { level: LearningLevelId }) {
  return <details className="level-resource-panel">
    <summary><Radio size={17}/> Hyödylliset linkit ja sovellukset</summary>
    <div className="level-resource-grid">{levelResources.map(resource=>{
      const Icon = icons[resource.category]
      const recommended = isResourceRecommended(level, resource)
      return <a key={resource.id} href={resource.href} target="_blank" rel="noreferrer" className={recommended ? 'recommended' : ''}>
        <span className="resource-icon"><Icon size={20}/></span>
        <span><strong>{resource.label}</strong><small>{resource.description}</small>{recommended && <em>Suositeltu tasolle {level.toUpperCase()}</em>}</span>
        <ExternalLink size={15}/>
      </a>
    })}</div>
  </details>
}

