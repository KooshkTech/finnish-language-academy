import type { SkillModule } from '@/types/classroom'
import type { QAQuestion, QACefrLevel, QASkillType } from '@/types/qa'

function levelValue(level: string): QACefrLevel {
  const value = level.toUpperCase()
  return (['A0','A1','A2','B1','B2','C1','C2'].includes(value) ? value : 'A1') as QACefrLevel
}

function skillValue(route: SkillModule['route'] | '/voice-lab'): QASkillType {
  const value = route.replace('/', '')
  if (value === 'voice-lab') return 'voice-lab'
  if (['speaking','writing','listening','reading','understanding','vocabulary'].includes(value)) return value as QASkillType
  return 'understanding'
}

function cleanMeaning(value: string) {
  return value.split('/')[0]?.trim() || value.trim()
}

export function buildQAQuestions(level: string, module: SkillModule): QAQuestion[] {
  const cefrLevel = levelValue(level)
  const skillType = skillValue(module.route)
  const example = module.examples[0] ?? { source: 'Minä opiskelen suomea.', target: 'Opiskelen suomen kieltä.' }
  const second = module.examples[1] ?? example
  const cards = module.flashcards.length ? module.flashcards : [{ front: 'suomi', back: 'Suomen kieli.' }]
  const firstCard = cards[0]
  const secondCard = cards[1] ?? firstCard
  const title = module.title

  if (skillType === 'speaking') {
    return [
      {
        id: `${cefrLevel}-speaking-1`, skillType, cefrLevel, inputMode: 'voice',
        prompt: `Vastaa kokonaisella lauseella. Aihe: ${title}. Mitä sanoisit tässä tilanteessa?`,
        expectedKeywords: [firstCard.front, ...example.source.toLowerCase().split(/\s+/).filter(word => word.length > 4).slice(0,2)],
        modelAnswer: { standardForm: example.source, spokenForm: example.note?.includes('Puhek') ? example.target : example.source.replace(/^Minä\b/, 'Mä'), translationEn: example.source },
        dictionaryHeadwords: [firstCard.front, secondCard.front],
        explanationHint: module.learn[0],
      },
      {
        id: `${cefrLevel}-speaking-2`, skillType, cefrLevel, inputMode: 'voice',
        prompt: `Jatkokysymys: kerro yksi lisätieto aiheesta “${title}”. Käytä sanaa “${secondCard.front}”.`,
        expectedKeywords: [secondCard.front],
        modelAnswer: { standardForm: second.source, spokenForm: second.source.replace(/^Minä\b/, 'Mä'), translationEn: second.source },
        dictionaryHeadwords: [secondCard.front],
      },
      {
        id: `${cefrLevel}-speaking-3`, skillType, cefrLevel, inputMode: 'voice',
        prompt: `Selitä omin sanoin, mitä “${firstCard.front}” tarkoittaa ja käytä sitä lauseessa.`,
        expectedKeywords: [firstCard.front],
        modelAnswer: { standardForm: `${firstCard.front}: ${cleanMeaning(firstCard.back)}. ${example.source}`, spokenForm: `${firstCard.front}: ${cleanMeaning(firstCard.back)}. ${example.source.replace(/^Minä\b/, 'Mä')}`, translationEn: `${firstCard.front}: ${cleanMeaning(firstCard.back)}` },
        dictionaryHeadwords: [firstCard.front],
      },
    ]
  }

  if (skillType === 'listening') {
    return [
      {
        id: `${cefrLevel}-listening-1`, skillType, cefrLevel, inputMode: 'text-or-voice',
        prompt: 'Kuuntele lause. Mitä tapahtuu? Vastaa suomeksi.', stimulusText: example.source,
        expectedKeywords: example.source.toLowerCase().split(/\s+/).filter(word => word.length > 3).slice(-2),
        modelAnswer: { standardForm: example.source, spokenForm: example.source.replace(/^Minä\b/, 'Mä'), translationEn: example.source }, dictionaryHeadwords: [firstCard.front],
      },
      {
        id: `${cefrLevel}-listening-2`, skillType, cefrLevel, inputMode: 'text-or-voice',
        prompt: `Sanelu: kirjoita tai sano kuulemasi mahdollisimman tarkasti.`, stimulusText: second.source,
        expectedKeywords: second.source.toLowerCase().split(/\s+/).filter(word => word.length > 2),
        modelAnswer: { standardForm: second.source, spokenForm: second.source.replace(/^Minä\b/, 'Mä'), translationEn: second.source }, dictionaryHeadwords: [secondCard.front],
      },
      {
        id: `${cefrLevel}-listening-3`, skillType, cefrLevel, inputMode: 'text-or-voice',
        prompt: `Kuuntele uudelleen ja nimeä yksi tärkeä sana aiheesta “${title}”.`, stimulusText: example.source,
        expectedKeywords: [firstCard.front, secondCard.front],
        modelAnswer: { standardForm: firstCard.front, spokenForm: firstCard.front, translationEn: firstCard.front }, dictionaryHeadwords: [firstCard.front, secondCard.front],
      },
    ]
  }

  if (skillType === 'reading') {
    const passage = `${example.source} ${second.source}`
    return [
      {
        id: `${cefrLevel}-reading-1`, skillType, cefrLevel, inputMode: 'text-or-voice', passage,
        prompt: 'Mikä on tekstin pääajatus? Vastaa yhdellä tai kahdella lauseella.',
        expectedKeywords: [firstCard.front, secondCard.front],
        modelAnswer: { standardForm: example.source, spokenForm: example.source.replace(/^Minä\b/, 'Mä'), translationEn: example.source }, dictionaryHeadwords: [firstCard.front, secondCard.front],
      },
      {
        id: `${cefrLevel}-reading-2`, skillType, cefrLevel, inputMode: 'text-or-voice', passage,
        prompt: `Mitä sana “${firstCard.front}” tarkoittaa tässä yhteydessä?`, expectedKeywords: cleanMeaning(firstCard.back).toLowerCase().split(/\s+/).filter(Boolean),
        modelAnswer: { standardForm: `${firstCard.front} tarkoittaa: ${cleanMeaning(firstCard.back)}.`, spokenForm: `${firstCard.front} tarkoittaa ${cleanMeaning(firstCard.back)}.`, translationEn: firstCard.front }, dictionaryHeadwords: [firstCard.front],
      },
      {
        id: `${cefrLevel}-reading-3`, skillType, cefrLevel, inputMode: 'text-or-voice', passage,
        prompt: 'Mikä tekstin yksityiskohta tukee vastaustasi?', expectedKeywords: passage.toLowerCase().split(/\s+/).filter(word => word.length > 4).slice(0,3),
        modelAnswer: { standardForm: second.source, spokenForm: second.source.replace(/^Minä\b/, 'Mä'), translationEn: second.source }, dictionaryHeadwords: [secondCard.front],
      },
    ]
  }

  if (skillType === 'writing') {
    return [
      {
        id: `${cefrLevel}-writing-1`, skillType, cefrLevel, inputMode: 'text',
        prompt: `Kirjoita 2–3 lausetta aiheesta “${title}”. Käytä ilmausta “${firstCard.front}”.`, expectedKeywords: [firstCard.front],
        modelAnswer: { standardForm: `${example.source} ${second.source}`, spokenForm: `${example.source.replace(/^Minä\b/, 'Mä')} ${second.source}`, translationEn: `${example.source} ${second.source}` }, dictionaryHeadwords: [firstCard.front, secondCard.front], explanationHint: module.learn[0],
      },
      {
        id: `${cefrLevel}-writing-2`, skillType, cefrLevel, inputMode: 'text',
        prompt: `Kirjoita lyhyt viesti, jossa pyydät tai kerrot jotakin tähän aiheeseen liittyvää. Käytä sanaa “${secondCard.front}”.`, expectedKeywords: [secondCard.front],
        modelAnswer: { standardForm: second.source, spokenForm: second.source.replace(/^Minä\b/, 'Mä'), translationEn: second.source }, dictionaryHeadwords: [secondCard.front],
      },
      {
        id: `${cefrLevel}-writing-3`, skillType, cefrLevel, inputMode: 'text',
        prompt: 'Muokkaa vastauksesi selkeäksi kirjakieleksi ja lisää yksi perustelu tai yksityiskohta.', expectedKeywords: [firstCard.front],
        modelAnswer: { standardForm: `${example.source} ${module.learn[0]}`, spokenForm: example.source.replace(/^Minä\b/, 'Mä'), translationEn: example.source }, dictionaryHeadwords: [firstCard.front],
      },
    ]
  }

  const grammarWord = firstCard.front
  return [
    {
      id: `${cefrLevel}-${skillType}-1`, skillType, cefrLevel, inputMode: 'text-or-voice',
      prompt: `Selitä omin sanoin: ${module.learn[0]}`, expectedKeywords: [grammarWord],
      modelAnswer: { standardForm: example.source, spokenForm: example.source.replace(/^Minä\b/, 'Mä'), translationEn: example.source }, dictionaryHeadwords: [grammarWord], explanationHint: module.learn[1] ?? module.learn[0],
    },
    {
      id: `${cefrLevel}-${skillType}-2`, skillType, cefrLevel, inputMode: 'text-or-voice',
      prompt: `Käytä sanaa tai rakennetta “${grammarWord}” omassa lauseessa.`, expectedKeywords: [grammarWord],
      modelAnswer: { standardForm: example.source, spokenForm: example.source.replace(/^Minä\b/, 'Mä'), translationEn: example.source }, dictionaryHeadwords: [grammarWord],
    },
    {
      id: `${cefrLevel}-${skillType}-3`, skillType, cefrLevel, inputMode: 'text-or-voice',
      prompt: `Miten kirjakieli ja puhekieli voivat erota tässä aiheessa?`, expectedKeywords: ['minä','mä'],
      modelAnswer: { standardForm: example.source, spokenForm: example.source.replace(/^Minä\b/, 'Mä'), translationEn: example.source }, dictionaryHeadwords: [secondCard.front],
    },
  ]
}

export function buildVoiceLabQuestions(level: string): QAQuestion[] {
  const cefrLevel = levelValue(level)
  return [
    { id:`${cefrLevel}-voice-1`, skillType:'voice-lab', cefrLevel, inputMode:'voice', prompt:'Mitä sinä söit aamupalaksi?', expectedKeywords:['söin','aamupalaksi'], modelAnswer:{standardForm:'Minä söin aamupalaksi puuroa.',spokenForm:'Mä söin aamupalaks puuroo.',translationEn:'Minä söin aamupalaksi puuroa.'}, dictionaryHeadwords:['aamupala','syödä'] },
    { id:`${cefrLevel}-voice-2`, skillType:'voice-lab', cefrLevel, inputMode:'voice', prompt:'Mitä aiot tehdä tänään?', expectedKeywords:['aion','tänään'], modelAnswer:{standardForm:'Aion opiskella suomea tänään.',spokenForm:'Mä aion opiskella suomee tänään.',translationEn:'Aion opiskella suomea tänään.'}, dictionaryHeadwords:['aikoa','tänään'] },
    { id:`${cefrLevel}-voice-3`, skillType:'voice-lab', cefrLevel, inputMode:'voice', prompt:'Kerro lyhyesti, miksi opiskelet suomea.', expectedKeywords:['koska','suomea'], modelAnswer:{standardForm:'Opiskelen suomea, koska asun Suomessa.',spokenForm:'Mä opiskelen suomee, koska mä asun Suomessa.',translationEn:'Opiskelen suomea, koska asun Suomessa.'}, dictionaryHeadwords:['koska','opiskella'] },
  ]
}

