export type YkiSkill = 'reading' | 'listening' | 'writing' | 'speaking'
export type YkiTrack = 'intermediate' | 'advanced'

export type YkiModule = { slug: string; title: string; track: YkiTrack; skill: YkiSkill; durationMinutes: number; objective: string; tasks: string[]; officialScore: false }

export const ykiModules: YkiModule[] = [
  { slug: 'yki-intermediate-reading', title: 'YKI: Lukeminen', track: 'intermediate', skill: 'reading', durationMinutes: 25, objective: 'Harjoittelet arjen tekstien pääajatuksen ja yksityiskohtien löytämistä.', tasks: ['Pääajatus', 'Yksityiskohdat', 'Kontekstin päätteleminen'], officialScore: false },
  { slug: 'yki-intermediate-listening', title: 'YKI: Kuullun ymmärtäminen', track: 'intermediate', skill: 'listening', durationMinutes: 25, objective: 'Harjoittelet tavallisen puheen ymmärtämistä ja muistiinpanojen tekemistä.', tasks: ['Pääajatus', 'Avainsanat', 'Puhujan tarkoitus'], officialScore: false },
  { slug: 'yki-advanced-writing', title: 'YKI: Kirjoittaminen', track: 'advanced', skill: 'writing', durationMinutes: 45, objective: 'Rakennat perustellun tekstin sopivalla rekisterillä.', tasks: ['Tehtävän ymmärtäminen', 'Rakenne', 'Rekisteri'], officialScore: false },
  { slug: 'yki-advanced-speaking', title: 'YKI: Puhuminen', track: 'advanced', skill: 'speaking', durationMinutes: 20, objective: 'Harjoittelet perusteltua ja johdonmukaista puheenvuoroa.', tasks: ['Aloitus', 'Perustelut', 'Yhteenveto'], officialScore: false },
]

export function getYkiModule(slug: string) { return ykiModules.find(module => module.slug === slug) }
