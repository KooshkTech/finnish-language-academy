import type { DictionaryEntry } from "@/types/dictionary"

export const dictionaryEntries: DictionaryEntry[] = [
  {
    id: "fi-tarkka",
    language: "fi",
    headword: "tarkka",
    normalizedHeadword: "tarkka",
    ipaPhonetic: "/ˈtɑrkːɑ/",
    partOfSpeech: "adjective",
    cefrLevel: "A2",
    morphology: { language: "fi", gradationTier: "kk → k in many inflected forms: tarkka → tarkan", vowelHarmony: "back" },
    definitions: [{ senseNumber: 1, definitionEn: "precise, exact, careful, or attentive depending on context", definitionNative: "täsmällinen, huolellinen tai yksityiskohtiin kiinnittävä", register: "standard", cefrLevel: "A2", examples: [
      { kirjakieli: "Tarvitsen tarkan osoitteen.", puhekieli: "Tarviin tarkan osotteen.", translationEn: "I need the exact address.", grammaticalNotes: "Genitive/accusative singular form tarkan modifies osoitteen." },
      { kirjakieli: "Hän on tarkka yksityiskohdista.", puhekieli: "Se on tarkka yksityiskohdista.", translationEn: "They are careful about details.", grammaticalNotes: "Adjective complement uses elative: yksityiskohdista." },
      { kirjakieli: "Ole tarkkana liikenteessä.", puhekieli: "Oo tarkkana liikenteessä.", translationEn: "Be careful in traffic.", grammaticalNotes: "Essive form tarkkana describes the state in which the person should remain." },
    ] }],
    collocations: [{ phrase: "tarkka osoite", translationEn: "exact address" }, { phrase: "olla tarkkana", translationEn: "be alert / careful" }],
    idioms: [], synonyms: ["täsmällinen", "huolellinen", "yksityiskohtainen"], antonyms: ["epätarkka", "huolimaton"],
    sourceNote: "OpiOpe editorial seed entry; verify specialized lexicographic details against trusted Finnish language references when needed.",
  },
  {
    id: "fi-ymmartaa",
    language: "fi",
    headword: "ymmärtää",
    normalizedHeadword: "ymmartaa",
    ipaPhonetic: "/ˈymːærˌtæː/",
    partOfSpeech: "verb",
    cefrLevel: "A2",
    morphology: {
      language: "fi",
      kotusTypeNumber: 53,
      gradationTier: "rt → rr in many finite forms: ymmärtää → ymmärrän",
      infinitiveStem: "ymmärtä-",
      conjugationGroup: "-tA verb",
      vowelHarmony: "front",
    },
    definitions: [
      {
        senseNumber: 1,
        definitionEn: "to understand; to grasp the meaning, reason, or significance of something",
        definitionNative: "käsittää asian merkitys, syy tai sisältö",
        register: "standard",
        cefrLevel: "A2",
        examples: [
          { kirjakieli: "Minä ymmärrän tämän säännön.", puhekieli: "Mä ymmärrän tän säännön.", translationEn: "I understand this rule.", grammaticalNotes: "Present tense, 1st person singular: ymmärrän." },
          { kirjakieli: "Ymmärrätkö, mitä tarkoitan?", puhekieli: "Ymmärräks, mitä mä tarkotan?", translationEn: "Do you understand what I mean?", grammaticalNotes: "Question particle -ko attaches to the finite verb." },
          { kirjakieli: "En ymmärrä kysymystä.", puhekieli: "En mä ymmärrä kysymystä.", translationEn: "I do not understand the question.", grammaticalNotes: "A negated object is commonly in the partitive: kysymystä." },
        ],
      },
      {
        senseNumber: 2,
        definitionEn: "to be sympathetic toward or appreciate another person's situation",
        definitionNative: "suhtautua toisen tilanteeseen myötätuntoisesti tai hyväksyvästi",
        register: "standard",
        cefrLevel: "B1",
        examples: [
          { kirjakieli: "Ymmärrän hyvin, miksi olet huolissasi.", puhekieli: "Mä ymmärrän hyvin, miks sä oot huolissas.", translationEn: "I understand very well why you are worried.", grammaticalNotes: "The verb introduces a why-clause with miksi." },
          { kirjakieli: "Hän ymmärsi ystävänsä vaikeaa tilannetta.", puhekieli: "Se ymmärsi kaverinsa vaikeeta tilannetta.", translationEn: "They understood their friend's difficult situation.", grammaticalNotes: "The object can be partitive when the empathy is viewed as ongoing or unbounded." },
          { kirjakieli: "Opettaja ymmärsi opiskelijan näkökulman.", puhekieli: "Ope tajus opiskelijan näkökulman.", translationEn: "The teacher understood the student's point of view.", grammaticalNotes: "Tajuta is a more colloquial near-synonym in many contexts." },
        ],
      },
    ],
    collocations: [
      { phrase: "ymmärtää oikein", translationEn: "understand correctly" },
      { phrase: "ymmärtää väärin", translationEn: "misunderstand" },
      { phrase: "ymmärtää toisiaan", translationEn: "understand each other" },
    ],
    idioms: [{ phrase: "ymmärtää yskä", translationEn: "get the point / understand the hint" }],
    synonyms: ["käsittää", "tajuta", "oivaltaa"],
    antonyms: ["käsittää väärin", "olla ymmällään"],
    sourceNote: "OpiOpe editorial seed entry. Detailed OpiOpe lexicographic structure; not a third-party dictionary entry.",
  },
  {
    id: "fi-juurtua",
    language: "fi",
    headword: "juurtua",
    normalizedHeadword: "juurtua",
    ipaPhonetic: "/ˈjuːrtuɑ/",
    partOfSpeech: "verb",
    cefrLevel: "B1",
    morphology: { language: "fi", kotusTypeNumber: 52, infinitiveStem: "juurtu-", conjugationGroup: "-ua verb", vowelHarmony: "back" },
    definitions: [{ senseNumber: 1, definitionEn: "to take root; figuratively, to become settled or established", definitionNative: "kasvaa juurilleen tai asettua pysyvämmin johonkin", register: "standard", cefrLevel: "B1", examples: [
      { kirjakieli: "Kasvi juurtuu nopeasti kosteassa mullassa.", puhekieli: "Kasvi juurtuu nopeesti kosteessa mullassa.", translationEn: "The plant takes root quickly in moist soil.", grammaticalNotes: "Intransitive verb; the subject undergoes the change." },
      { kirjakieli: "Perhe on juurtunut Suomeen.", puhekieli: "Perhe on juurtunu Suomeen.", translationEn: "The family has put down roots in Finland.", grammaticalNotes: "Perfect tense: on juurtunut; destination uses the illative Suomeen." },
      { kirjakieli: "Uusi tapa juurtui vähitellen työyhteisöön.", puhekieli: "Uus tapa juurtu pikkuhiljaa työporukkaan.", translationEn: "The new practice gradually became established in the workplace.", grammaticalNotes: "Figurative use with illative destination." },
    ] }],
    collocations: [{ phrase: "juurtua Suomeen", translationEn: "put down roots in Finland" }],
    idioms: [], synonyms: ["asettua", "vakiintua"], antonyms: ["irtautua"],
    sourceNote: "OpiOpe editorial seed entry. Detailed OpiOpe lexicographic structure; not a third-party dictionary entry.",
  },
  {
    id: "fi-parjata",
    language: "fi",
    headword: "pärjätä",
    normalizedHeadword: "parjata",
    ipaPhonetic: "/ˈpærjætæ/",
    partOfSpeech: "verb",
    cefrLevel: "A2",
    morphology: { language: "fi", infinitiveStem: "pärjä-", conjugationGroup: "-tA verb", vowelHarmony: "front" },
    definitions: [{ senseNumber: 1, definitionEn: "to manage, cope, or get by successfully", definitionNative: "selviytyä tai onnistua riittävän hyvin", register: "spoken", cefrLevel: "A2", examples: [
      { kirjakieli: "Pärjään suomeksi kaupassa.", puhekieli: "Mä pärjään suomeks kaupassa.", translationEn: "I can manage in Finnish at the shop.", grammaticalNotes: "Adverbial -ksi form suomeksi means 'in Finnish'." },
      { kirjakieli: "Hän pärjää työssään hyvin.", puhekieli: "Se pärjää duunissa hyvin.", translationEn: "They do well at work.", grammaticalNotes: "Työssään contains the inessive plus possessive suffix." },
      { kirjakieli: "Kyllä sinä pärjäät.", puhekieli: "Kyl sä pärjäät.", translationEn: "You'll manage / You'll be fine.", grammaticalNotes: "Common encouraging expression." },
    ] }],
    collocations: [{ phrase: "pärjätä hyvin", translationEn: "do well" }, { phrase: "pärjätä omillaan", translationEn: "manage on one's own" }],
    idioms: [], synonyms: ["selviytyä", "menestyä"], antonyms: ["epäonnistua"],
    sourceNote: "OpiOpe editorial seed entry. Detailed OpiOpe lexicographic structure; not a third-party dictionary entry.",
  },
  {
    id: "sv-forsta",
    language: "sv",
    headword: "förstå",
    normalizedHeadword: "forsta",
    ipaPhonetic: "/fœˈʂtoː/",
    partOfSpeech: "verb",
    cefrLevel: "A1",
    morphology: { language: "sv", conjugationGroup: "irregular", pitchAccent: "accent-2" },
    definitions: [{ senseNumber: 1, definitionEn: "to understand", definitionNative: "att uppfatta betydelsen eller meningen", register: "standard", cefrLevel: "A1", examples: [
      { kirjakieli: "Jag förstår frågan.", translationEn: "I understand the question.", grammaticalNotes: "Present tense form is förstår." },
      { kirjakieli: "Förstår du vad jag menar?", translationEn: "Do you understand what I mean?", grammaticalNotes: "Yes/no questions use verb-first word order." },
      { kirjakieli: "Jag förstår inte.", translationEn: "I do not understand.", grammaticalNotes: "The negation inte normally follows the finite verb in a main clause." },
    ] }],
    collocations: [{ phrase: "förstå rätt", translationEn: "understand correctly" }, { phrase: "förstå varandra", translationEn: "understand each other" }],
    idioms: [], synonyms: ["begripa", "fatta"], antonyms: ["missförstå"],
    sourceNote: "OpiOpe editorial seed entry. Detailed OpiOpe lexicographic structure; not a third-party dictionary entry.",
  },
  {
    id: "sv-jobb",
    language: "sv",
    headword: "jobb",
    normalizedHeadword: "jobb",
    ipaPhonetic: "/jɔbː/",
    partOfSpeech: "noun",
    cefrLevel: "A1",
    morphology: { language: "sv", gender: "ett", pluralForms: ["jobb", "jobben"], pitchAccent: "accent-1" },
    definitions: [{ senseNumber: 1, definitionEn: "job; work or employment", definitionNative: "arbete eller anställning", register: "standard", cefrLevel: "A1", examples: [
      { kirjakieli: "Jag har ett nytt jobb.", translationEn: "I have a new job.", grammaticalNotes: "Jobb is an ett-noun: ett jobb." },
      { kirjakieli: "Hon söker jobb i Helsingfors.", translationEn: "She is looking for work in Helsinki.", grammaticalNotes: "Söka jobb is a common collocation." },
      { kirjakieli: "Jobbet börjar klockan åtta.", translationEn: "The job starts at eight o'clock.", grammaticalNotes: "Definite singular: jobbet." },
    ] }],
    collocations: [{ phrase: "söka jobb", translationEn: "look for a job" }, { phrase: "få jobb", translationEn: "get a job" }],
    idioms: [], synonyms: ["arbete"], antonyms: [],
    sourceNote: "OpiOpe editorial seed entry. Detailed OpiOpe lexicographic structure; not a third-party dictionary entry.",
  },
]

export function normalizeDictionaryQuery(value: string) {
  return value.trim().toLocaleLowerCase("fi-FI").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

export function searchDictionary(query: string, language?: "fi" | "sv") {
  const normalized = normalizeDictionaryQuery(query)
  if (!normalized) return []
  return dictionaryEntries.filter(entry => {
    if (language && entry.language !== language) return false
    const haystack = [entry.headword, entry.normalizedHeadword, ...entry.synonyms, ...entry.collocations.map(item => item.phrase)]
      .map(normalizeDictionaryQuery)
    return haystack.some(value => value.includes(normalized) || normalized.includes(value))
  })
}

