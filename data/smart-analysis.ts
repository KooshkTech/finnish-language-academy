import { searchDictionary } from '@/data/dictionary'
import type { LearningLevelId } from '@/data/levels'
import type { SmartSection, SmartStudySettings } from '@/types/smart'

const tarkka = {
  meaning: 'Tarkka tarkoittaa tilanteen mukaan täsmällistä, huolellista tai yksityiskohtiin keskittyvää.',
  grammar: 'Tarkka on adjektiivi. Se taipuu substantiivin luvussa ja sijassa: tarkka vastaus, tarkat vastaukset, tarkassa vastauksessa. Komparatiivi on tarkempi ja superlatiivi tarkin.',
  inflection: 'Tavallisia muotoja: tarkka → tarkan → tarkkaa → tarkassa → tarkasta → tarkkaan. Monikko: tarkat → tarkkojen. Tarkista tarvittaessa yksityiskohdat luotettavasta suomen sanakirjasta.',
  spoken: 'Puhekielessä sana “tarkka” pysyy yleensä samana, mutta ympäröivä lause lyhenee: “Ole tarkkana.” → “Oo tarkkana.”',
  synonyms: 'läheisiä sanoja: täsmällinen, huolellinen, yksityiskohtainen. Vastakohtia tilanteesta riippuen: epätarkka, huolimaton, summittainen.',
  sentences: [
    'Kirjakieli: Hän on tarkka yksityiskohdista.',
    'Kirjakieli: Tarvitsen tarkan osoitteen.',
    'Puhekieli: Oo tarkkana liikenteessä.',
  ],
}

function fromDictionary(query: string, settings: SmartStudySettings): SmartSection[] {
  const entry = searchDictionary(query)[0]
  if (!entry) return []
  const sections: SmartSection[] = []
  const sense = entry.definitions[0]
  if (settings.meaning) sections.push({ key: 'meaning', title: 'Merkitys', body: `${entry.headword}: ${sense?.definitionNative ?? 'Suomenkielistä määritelmää ei ole vielä saatavilla.'}` })
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
  if (settings.sentences) sections.push({ key: 'sentences', title: 'Esimerkkilauseet', body: 'Käyttö esimerkeissä:', examples: sense?.examples.slice(0,3).flatMap(item => [item.kirjakieli, item.puhekieli ?? ''].filter(Boolean)) ?? [] })
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
