import type { LearningLevelId } from '@/data/levels'

export type LevelResource = {
  id: string
  label: string
  description: string
  href: string
  category: 'game' | 'classroom' | 'news' | 'dictionary' | 'language'
  recommendedFrom: LearningLevelId
}

export const levelResources: LevelResource[] = [
  {
    id: 'kahoot',
    label: 'Kahoot!',
    description: 'Pelaa tai liity kielivisaan. Sopii sanastoon, kielioppiin ja kertaukseen.',
    href: 'https://kahoot.com/',
    category: 'game',
    recommendedFrom: 'a0',
  },
  {
    id: 'teams',
    label: 'Microsoft Teams',
    description: 'Opettajan tapaamiset, ryhmäopetus ja verkkotunnit.',
    href: 'https://teams.microsoft.com/',
    category: 'classroom',
    recommendedFrom: 'a0',
  },
  {
    id: 'yle-selkouutiset',
    label: 'Yle Selkouutiset',
    description: 'Selkeää suomea ajankohtaisista aiheista. Hyvä A1–B1 kuunteluun ja lukemiseen.',
    href: 'https://yle.fi/selkouutiset',
    category: 'news',
    recommendedFrom: 'a1',
  },
  {
    id: 'yle-uutiset',
    label: 'Yle Uutiset',
    description: 'Aitoja suomalaisia uutistekstejä ja videoita B1–C2 harjoitteluun.',
    href: 'https://yle.fi/uutiset',
    category: 'news',
    recommendedFrom: 'b1',
  },
  {
    id: 'kielitoimisto',
    label: 'Kielitoimiston sanakirja',
    description: 'Suomen yleiskielen merkitykset, käyttö, taivutus ja oikeinkirjoitus.',
    href: 'https://www.kielitoimistonsanakirja.fi/',
    category: 'dictionary',
    recommendedFrom: 'a2',
  },
  {
    id: 'kotus',
    label: 'Kotus',
    description: 'Kotimaisten kielten keskuksen kielitietoa, ohjeita ja aineistoja.',
    href: 'https://kotus.fi/',
    category: 'language',
    recommendedFrom: 'b1',
  },
]

const order: LearningLevelId[] = ['a0','a1','a2','b1','b2','c1','c2']

export function isResourceRecommended(level: LearningLevelId, resource: LevelResource) {
  return order.indexOf(level) >= order.indexOf(resource.recommendedFrom)
}

