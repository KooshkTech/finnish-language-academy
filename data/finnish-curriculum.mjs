import a0 from './finnish/a0.mjs'
import a1 from './finnish/a1.mjs'
import a2 from './finnish/a2.mjs'
import b1 from './finnish/b1.mjs'
import b2 from './finnish/b2.mjs'
import c1 from './finnish/c1.mjs'
import c2 from './finnish/c2.mjs'

export const finnishLevelOrder = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const seeds = { A0: a0, A1: a1, A2: a2, B1: b1, B2: b2, C1: c1, C2: c2 }
const names = { A0: 'Ensimmäiset askeleet', A1: 'Arjen perustaidot', A2: 'Itsenäinen asiointi', B1: 'Kertominen ja perusteleminen', B2: 'Punnittu viestintä', C1: 'Synteesi ja tyylin hallinta', C2: 'Vivahteet ja moniäänisyys' }
const duration = { A0: 25, A1: 35, A2: 45, B1: 55, B2: 65, C1: 75, C2: 85 }
const wordTarget = { A0: '2–4 lausetta', A1: '6–8 lausetta', A2: '80–120 sanaa', B1: '140–180 sanaa', B2: '180–220 sanaa', C1: '250–300 sanaa', C2: '300–350 sanaa' }
const id = (level, number) => `fi-${level.toLowerCase()}-${String(number).padStart(2, '0')}`

function question(lessonId, suffix, tuple, skill, flip = false) {
  const [prompt, answer, other, explanation] = tuple
  return { id: `${lessonId}-${suffix}`, type: 'multiple-choice', prompt, answer,
    options: flip ? [other, answer] : [answer, other],
    explanation: explanation || `Oikea vastaus on ”${answer}”. Tarkista tekstin kohta, joka tukee vastausta.`, skill }
}

function build(level, seed, index) {
  const number = index + 1
  const lessonId = id(level, number)
  const reviewLesson = number === 10
  const previousLevel = finnishLevelOrder[finnishLevelOrder.indexOf(level) - 1]
  const prerequisites = index > 0 ? [id(level, number - 1)] : previousLevel ? [id(previousLevel, 10)] : []
  const readingQuestion = question(lessonId, 'reading', seed.read, 'reading', index % 2 === 0)
  const listeningQuestion = question(lessonId, 'listening', seed.hear, 'listening', index % 2 !== 0)
  const grammarQuestion = question(lessonId, 'grammar', seed.gap, 'grammar', index % 2 === 0)
  grammarQuestion.type = 'fill-blank'
  delete grammarQuestion.options
  const applicationQuestion = question(lessonId, 'application', seed.use, 'practice', index % 2 !== 0)
  const vocabulary = seed.words.map(([fi, definitionFi]) => {
    const sentences = `${seed.text} ${seed.audio}`.match(/[^.!?]+[.!?]+/g) || [seed.text]
    const stem = fi.split(' ')[0].slice(0, Math.max(3, fi.split(' ')[0].length - 2)).toLocaleLowerCase('fi')
    const example = sentences.find(sentence => sentence.toLocaleLowerCase('fi').includes(stem))?.trim()
    return { fi, en: '', definitionFi, partOfSpeech: 'ilmaus', cefr: level,
      example: example || `Harjoittele teemaan liittyvää sanaa tai ilmausta: ”${fi}”.`,
      note: 'Merkitys tässä oppitunnissa; sanalla voi olla muitakin merkityksiä.' }
  })
  const vocabularyQuestions = seed.words.map(([fi, meaning], wordIndex) => question(lessonId, `vocab-${wordIndex + 1}`,
    [`Mitä ”${fi}” tarkoittaa tämän oppitunnin yhteydessä?`, meaning, seed.words[(wordIndex + 1) % seed.words.length][1],
      `Tässä yhteydessä ”${fi}” tarkoittaa: ${meaning}.`], 'practice', (index + wordIndex) % 2 === 0))
  const assessment = [grammarQuestion, applicationQuestion]
  // Retrieval practice, deliberately reusing earlier tasks, not an unseen official exam.
  if (reviewLesson) for (const earlier of [0, 3, 6]) {
    assessment.push(question(lessonId, `review-${earlier + 1}`, seeds[level][earlier].use, 'mastery', earlier % 2 === 0))
  }
  return {
    id: lessonId, bookId: `fi-${level.toLowerCase()}`, level, number, title: seed.title, topic: seed.title,
    estimatedMinutes: duration[level] + (reviewLesson ? 15 : 0),
    difficulty: level === 'A0' ? 'starter' : level === 'A1' ? 'easy' : ['A2', 'B1'].includes(level) ? 'medium' : level === 'B2' ? 'advanced' : 'mastery',
    objectives: [seed.speak, seed.write, `Ymmärrä ja sovella rakennetta: ${seed.example}`], prerequisites,
    vocabulary, grammarTargets: [seed.rule], skills: ['reading', 'listening', 'grammar', 'practice', 'speaking', 'writing', 'mastery'],
    contentVersion: 1, published: true, updatedAt: '2026-09-15', warmup: `Mitä tiedät aiheesta ”${seed.title}”? Sano tai kirjoita kaksi ajatusta.`,
    reading: { title: seed.title, text: seed.text, translationEn: '', questions: [readingQuestion] },
    listening: { title: `Kuunteluharjoitus: ${seed.title}`, transcript: seed.audio,
      speedGuidance: 'Selaimen koneääni, ei äänitettyä puhetta. Kuuntele ensin ilman tekstiä; tarkista sitten transkriptio. Äänen saatavuus riippuu selaimesta.', questions: [listeningQuestion] },
    grammar: { discover: [seed.example], explain: seed.rule, deconstruct: [seed.example],
      compare: [`Vertaa vaihtoehtoja: ”${seed.gap[1]}” ja ”${seed.gap[2]}”. ${seed.gap[3]}`], questions: [grammarQuestion] },
    practice: [applicationQuestion, ...vocabularyQuestions],
    speaking: { prompt: seed.speak, model: `Mallin aloitus tai keskustelun lähtökohta: ${seed.audio}`,
      roleplay: ['A: Esitä teemaan sopiva kysymys tai väite.', 'B: Vastaa ja pyydä yhtä täsmennystä.', 'A: Täsmennä ja kysy B:n näkemystä.', 'Vaihda roolit. Älä käytä oikeita henkilötietoja.'] },
    writing: { prompt: `${seed.write} Suuntaa antava laajuus: ${wordTarget[level]}.`,
      checklist: ['Vastasinko tehtävän kaikkiin osiin?', 'Käytinkö oppitunnin rakennetta ja sanastoa?', 'Onko aikajärjestys tai perusteluketju selkeä?', 'Sopiiko sävy vastaanottajalle?', 'Tarkistinko oikeinkirjoituksen?'],
      model: seed.text },
    differentiatedTasks: {
      easier: `Lue mallilause ääneen: ”${seed.example}”. Etsi tekstistä siihen liittyvä kohta. Vastaa puhetehtävään mallin avulla: ${seed.speak}`,
      harder: `Vastaa ilman mallitekstiä: ${seed.speak} Esitä sitten toinen teemaan sopiva tilanne ja pyydä keskustelukumppanilta täsmennys.`,
    },
    masteryTest: assessment.map((item, itemIndex) => ({ ...item, id: `${lessonId}-assessment-${itemIndex + 1}`, skill: 'mastery' })),
    review: [`Kertaa: ${seed.example}`, `Selitä omin sanoin: ${seed.use[3]}`, 'Vertaa omaa kirjoitusta mallitekstiin. Pyydä opettajalta palautetta.',
      ...(reviewLesson ? ['Palaa tason oppitunneille 1, 4 ja 7. Tee niiden puhe- ja kirjoitustehtävä uudelleen.'] : [])]
  }
}

export const finnishLessons = finnishLevelOrder.flatMap(level => seeds[level].map((seed, index) => build(level, seed, index)))
export const finnishLevelBooks = finnishLevelOrder.map(level => ({
  id: `fi-${level.toLowerCase()}`, title: `Suomi ${level}`, subtitle: names[level], levelRange: level,
  description: '10 alkuperäistä oppituntia: lukeminen, transkriptioon perustuva koneäänikuuntelu, kielioppi, harjoittelu, puhuminen ja kirjoittaminen. Viimeinen tunti kertaa tason sisältöä. Tasomerkinnät ovat tavoitteita, eivät virallisia tasotodistuksia.',
  focus: ['lukeminen', 'kuuntelu', 'kielioppi', 'puhuminen', 'kirjoittaminen', 'kertaus'],
  lessonTitles: seeds[level].map(seed => seed.title), publishedLessonIds: seeds[level].map((_, index) => id(level, index + 1))
}))
