export type Skill = 'reading' | 'listening' | 'grammar' | 'practice' | 'speaking' | 'writing'
export type ExerciseType = 'multiple-choice' | 'fill-blank' | 'translation' | 'ordering' | 'speaking'

export type Exercise = {
  id: string
  type: ExerciseType
  prompt: string
  options?: string[]
  answer?: string
  explanation: string
  skill: Skill
}

export type CurriculumLesson = {
  slug: string
  book: string
  level: string
  number: number
  title: string
  topic: string
  estimatedMinutes: number
  objectives: string[]
  vocabulary: { word: string; meaning: string; example: string }[]
  reading: { title: string; text: string; translation?: string; questions: Exercise[] }
  listening: { transcript: string; questions: Exercise[] }
  grammar: { title: string; explanation: string; examples: string[]; exercises: Exercise[] }
  practice: Exercise[]
  speaking: { prompt: string; guidance: string }
  masteryTest: Exercise[]
}

export const curriculumBooks = [
  { slug: 'opiope-1', title: 'OPIOPE 1', range: 'A0 → A1.1', focus: 'Suomen kielen perusta', lessons: 20 },
  { slug: 'opiope-2', title: 'OPIOPE 2', range: 'A1.2 → A2.1', focus: 'Sujuva arki', lessons: 20 },
  { slug: 'opiope-3', title: 'OPIOPE 3', range: 'A2.2 → B1.1', focus: 'YKI-perusta', lessons: 20 },
  { slug: 'opiope-4', title: 'OPIOPE 4', range: 'B1.2 → B2.1', focus: 'Työelämän suomi', lessons: 20 },
  { slug: 'opiope-5', title: 'OPIOPE 5', range: 'B2.2 → C1', focus: 'Media ja kulttuuri', lessons: 20 },
  { slug: 'opiope-6', title: 'OPIOPE 6', range: 'C1 → C2', focus: 'Kielitaidon mestaruus', lessons: 20 },
  { slug: 'opiope-yki', title: 'OPIOPE YKI', range: 'B1 → C2', focus: 'YKI-harjoittelu', lessons: 20 },
] as const

export const representativeLessons: CurriculumLesson[] = [
  {
    slug: 'opiope-1-lesson-01', book: 'OPIOPE 1', level: 'A0–A1.1', number: 1, title: 'Minä olen...', topic: 'Esittäytyminen', estimatedMinutes: 20,
    objectives: ['Esittelet itsesi', 'Kysyt toisen nimeä', 'Käytät olla-verbiä preesensissä'],
    vocabulary: [{ word: 'nimi', meaning: 'name', example: 'Minun nimeni on Amina.' }, { word: 'olla', meaning: 'to be', example: 'Minä olen opiskelija.' }],
    reading: { title: 'Hei, minä olen Amina', text: 'Hei! Minä olen Amina. Mikä sinun nimesi on? Hauska tutustua!', questions: [{ id: 'r1', type: 'multiple-choice', prompt: 'Mikä hänen nimensä on?', options: ['Amina', 'Anna', 'Alex'], answer: 'Amina', explanation: 'Tekstissä sanotaan: Minä olen Amina.', skill: 'reading' }] },
    listening: { transcript: 'Hei! Minä olen Amina.', questions: [{ id: 'l1', type: 'multiple-choice', prompt: 'Kuka puhuu?', options: ['Amina', 'opettaja', 'lääkäri'], answer: 'Amina', explanation: 'Puhuja kertoo nimensä.', skill: 'listening' }] },
    grammar: { title: 'Olla-verbi', explanation: 'Olla-verbi kertoo, kuka tai millainen joku on. Minä olen, sinä olet, hän on.', examples: ['Minä olen Amina.', 'Sinä olet opiskelija.', 'Hän on suomalainen.'], exercises: [{ id: 'g1', type: 'fill-blank', prompt: 'Minä ___ opiskelija.', answer: 'olen', explanation: 'Minä-pronominin kanssa käytetään muotoa olen.', skill: 'grammar' }] },
    practice: [{ id: 'p1', type: 'translation', prompt: 'Kerro nimesi kokonaisella lauseella: Amina.', answer: 'Minä olen Amina.', explanation: 'Minä olen kertoo puhujan henkilöllisyyden.', skill: 'practice' }],
    speaking: { prompt: 'Kerro nimesi ja yksi asia itsestäsi suomeksi.', guidance: 'Aloita: Hei! Minä olen...' },
    masteryTest: [{ id: 'm1', type: 'multiple-choice', prompt: 'Valitse oikea lause.', options: ['Minä on Amina.', 'Minä olen Amina.', 'Minä olet Amina.'], answer: 'Minä olen Amina.', explanation: 'Olen on olla-verbin minä-muoto.', skill: 'grammar' }],
  },
  {
    slug: 'opiope-3-lesson-01', book: 'OPIOPE 3', level: 'A2.2–B1.1', number: 1, title: 'Kokemus ja mielipide', topic: 'Kertominen', estimatedMinutes: 30,
    objectives: ['Kuvaat kokemusta', 'Perustelet mielipiteen', 'Käytät imperfektiä'],
    vocabulary: [{ word: 'kokemus', meaning: 'experience', example: 'Kokemus oli opettavainen.' }, { word: 'mielestäni', meaning: 'in my opinion', example: 'Mielestäni ratkaisu oli hyvä.' }],
    reading: { title: 'Uusi työpaikka', text: 'Aloitin uudessa työpaikassa viime kuussa. Aluksi kaikki tuntui vaikealta, mutta kollegat auttoivat minua.', questions: [{ id: 'r1', type: 'multiple-choice', prompt: 'Milloin hän aloitti?', options: ['viime kuussa', 'eilen', 'ensi vuonna'], answer: 'viime kuussa', explanation: 'Tekstissä kerrotaan: viime kuussa.', skill: 'reading' }] },
    listening: { transcript: 'Aluksi kaikki tuntui vaikealta, mutta kollegat auttoivat minua.', questions: [{ id: 'l1', type: 'multiple-choice', prompt: 'Miten kollegat toimivat?', options: ['He auttoivat.', 'He lähtivät.', 'He myöhästyivät.'], answer: 'He auttoivat.', explanation: 'Auttoivat on auttaa-verbin imperfekti.', skill: 'listening' }] },
    grammar: { title: 'Imperfekti', explanation: 'Imperfekti kertoo päättyneestä menneestä tapahtumasta. Verbivartaloon lisätään usein i.', examples: ['Aloitin työn.', 'Kollegat auttoivat minua.'], exercises: [{ id: 'g1', type: 'fill-blank', prompt: 'Eilen minä ___ uuden kirjan. (lukea)', answer: 'luin', explanation: 'Luin on lukea-verbin imperfekti.', skill: 'grammar' }] },
    practice: [{ id: 'p1', type: 'translation', prompt: 'Käännä: The experience was educational.', answer: 'Kokemus oli opettavainen.', explanation: 'Oli on olla-verbin imperfekti.', skill: 'practice' }],
    speaking: { prompt: 'Kerro lyhyesti yhdestä kokemuksesta ja perustele mielipiteesi.', guidance: 'Käytä ilmauksia: Aluksi..., mutta..., mielestäni...' },
    masteryTest: [{ id: 'm1', type: 'multiple-choice', prompt: 'Valitse imperfekti.', options: ['auttavat', 'auttoivat', 'auttavatko'], answer: 'auttoivat', explanation: 'Auttoivat kertoo menneestä tapahtumasta.', skill: 'grammar' }],
  },
]

export function getCurriculumLesson(slug: string) { return representativeLessons.find(lesson => lesson.slug === slug) }
