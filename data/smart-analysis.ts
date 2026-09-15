import { searchDictionary } from '@/data/dictionary'
import type { LearningLevelId } from '@/data/levels'
import type { SmartSection, SmartStudySettings } from '@/types/smart'

const tarkka = {
  meaning: 'tarkka = precise, exact, careful or attentive depending on context. As an adjective it describes accuracy, strictness or close attention.',
  grammar: '“Tarkka” is an adjective. It agrees with the noun in number and case: tarkka vastaus, tarkat vastaukset, tarkassa vastauksessa. Comparative: tarkempi. Superlative: tarkin.',
  inflection: 'Common forms: tarkka → tarkan → tarkkaa → tarkassa → tarkasta → tarkkaan. Plural: tarkat → tarkkojen. Check specialized inflection details in a trusted Finnish dictionary when needed.',
  spoken: 'Puhekielessä sana “tarkka” pysyy yleensä samana, mutta ympäröivä lause lyhenee: “Ole tarkkana.” → “Oo tarkkana.”',
  synonyms: 'läheisiä sanoja: täsmällinen, huolellinen, yksityiskohtainen. Vastakohtia tilanteesta riippuen: epätarkka, huolimaton, summittainen.',
  sentences: [
    'Kirjakieli: Hän on tarkka yksityiskohdista. — He/She is careful about details.',
    'Kirjakieli: Tarvitsen tarkan osoitteen. — I need the exact address.',
    'Puhekieli: Oo tarkkana liikenteessä. — Be careful in traffic.',
  ],
}

function fromDictionary(query: string, settings: SmartStudySettings): SmartSection[] {
  const entry = searchDictionary(query)[0]
  if (!entry) return []
  const sections: SmartSection[] = []
  const sense = entry.definitions[0]
  if (settings.meaning) sections.push({ key: 'meaning', title: 'Merkitys', body: `${entry.headword}: ${sense?.definitionNative ?? sense?.definitionEn ?? 'Ei määritelmää.'}` })
  if (settings.grammar) {
    const extra = entry.morphology.language === 'fi' ? `${entry.morphology.conjugationGroup ?? ''} ${entry.morphology.gradationTier ?? ''}` : `${entry.morphology.conjugationGroup ?? ''} ${entry.morphology.gender ?? ''}`
    sections.push({ key: 'grammar', title: 'Kielioppi', body: `${entry.partOfSpeech}. CEFR ${entry.cefrLevel}. ${extra}`.trim() })
  }
  if (settings.inflection) {
    const detail = entry.morphology.language === 'fi'
      ? `Vartalo: ${entry.morphology.infinitiveStem ?? '—'}. Kotus-tyyppi: ${entry.morphology.kotusTypeNumber ?? '—'}. Vokaaliharmonia: ${entry.morphology.vowelHarmony}.`
      : `Suku: ${entry.morphology.gender ?? '—'}. Monikko: ${entry.morphology.pluralForms?.join(', ') ?? '—'}. Painoaksentti: ${entry.morphology.pitchAccent ?? '—'}.`
    sections.push({ key: 'inflection', title: 'Taivutus / rakenne', body: detail })
  }
  if (settings.sentences) sections.push({ key: 'sentences', title: 'Esimerkkilauseet', body: 'Käyttö esimerkeissä:', examples: sense?.examples.slice(0,3).flatMap(item => [item.kirjakieli, item.puhekieli ?? '', item.translationEn].filter(Boolean)) ?? [] })
  if (settings.spoken && sense?.examples.some(item => item.puhekieli)) sections.push({ key: 'spoken', title: 'Puhekieli', body: sense.examples.find(item => item.puhekieli)?.puhekieli ?? '' })
  if (settings.synonyms) sections.push({ key: 'synonyms', title: 'Synonyymit', body: entry.synonyms.length ? entry.synonyms.join(', ') : 'Ei paikallisia synonyymejä.' })
  return sections
}

export function analyzeSmartQuery(query: string, level: LearningLevelId | null, settings: SmartStudySettings): SmartSection[] {
  const trimmed = query.trim()
  if (!trimmed) return []
  const dictionary = fromDictionary(trimmed, settings)
  if (dictionary.length) return dictionary

  if (trimmed.toLocaleLowerCase('fi-FI') === 'tarkka') {
    const sections: SmartSection[] = []
    if (settings.meaning) sections.push({ key: 'meaning', title: 'Merkitys', body: tarkka.meaning })
    if (settings.grammar) sections.push({ key: 'grammar', title: 'Kielioppi', body: tarkka.grammar })
    if (settings.inflection) sections.push({ key: 'inflection', title: 'Taivutus', body: tarkka.inflection })
    if (settings.sentences) sections.push({ key: 'sentences', title: 'Lauseet', body: 'Esimerkkejä eri tilanteissa:', examples: tarkka.sentences })
    if (settings.spoken) sections.push({ key: 'spoken', title: 'Puhekieli', body: tarkka.spoken })
    if (settings.synonyms) sections.push({ key: 'synonyms', title: 'Synonyymit', body: tarkka.synonyms })
    return sections
  }

  return [{
    key: 'notice',
    title: 'Paikallinen analyysi',
    body: `Hakusanaa “${trimmed}” ei vielä löytynyt OpiOpen paikallisesta sanakirjasta${level ? ` tasolla ${level.toUpperCase()}` : ''}. Voit käyttää AI-opettaja-valintaa, jos palvelin-API on määritetty, tai siirtyä Sanakirjaan.`
  }]
}

