export const courses = [
  { level: 'A0–A1', title: 'Suomi alusta asti', text: 'Tervehdykset, arjen sanat ja ensimmäiset lauseet.', icon: 'ä', tone: 'sun' },
  { level: 'A2', title: 'Sujuvampi arki', text: 'Puhu luonnollisemmin tilanteissa, joita kohtaat joka päivä.', icon: 'ö', tone: 'mint' },
  { level: 'B1', title: 'Suomi työssä', text: 'Kirjoita ja keskustele työelämän suomea omalla äänelläsi.', icon: 'y', tone: 'blue' },
]

export const words = [
  { word: 'juurtua', translation: 'to put down roots', example: 'Tänne on ollut helppo juurtua.' },
  { word: 'arki', translation: 'everyday life', example: 'Arki tuntuu helpommalta joka viikko.' },
  { word: 'rohkea', translation: 'brave', example: 'Rohkea oppija puhuu ennen kuin kaikki on täydellistä.' },
]

export const grammarQuestions = [
  { topic: 'illatiivi', prompt: 'Minä menen ___.', options: ['kauppa', 'kauppaan', 'kaupassa'], answer: 'kauppaan', explanation: 'Verbi mennä ilmaisee liikettä johonkin paikkaan, joten käytetään illatiivia: kauppaan.' },
  { topic: 'inessiivi', prompt: 'Asun ___.', options: ['Suomi', 'Suomeen', 'Suomessa'], answer: 'Suomessa', explanation: 'Verbi asua kertoo sijainnista, joten käytetään inessiiviä: Suomessa.' },
  { topic: 'partitiivi', prompt: 'Puhun ___.', options: ['suomea', 'suomi', 'suomeen'], answer: 'suomea', explanation: 'Kielen nimen kanssa puhua-verbi käyttää partitiivia: puhun suomea.' },
]

export const placementQuestions = [
  { id: 'p1', category: 'Sanasto', prompt: 'Mitä “kiitos” tarkoittaa?', options: ['hello', 'thank you', 'sorry'], answer: 'thank you', level: 'A0' },
  { id: 'p2', category: 'Kielioppi', prompt: 'Minä ___ Suomessa.', options: ['asun', 'asuu', 'asuvat'], answer: 'asun', level: 'A1' },
  { id: 'p3', category: 'Kielioppi', prompt: 'Menen huomenna ___.', options: ['työ', 'töissä', 'töihin'], answer: 'töihin', level: 'A2' },
  { id: 'p4', category: 'Lukeminen', prompt: '“Kokous siirrettiin ensi viikolle.” Mitä tapahtui?', options: ['Kokous peruttiin.', 'Kokouksen aika muuttui.', 'Kokous alkoi nyt.'], answer: 'Kokouksen aika muuttui.', level: 'B1' },
  { id: 'p5', category: 'Kielioppi', prompt: 'Valitse luontevin: “Jos olisin tiennyt, ___ aiemmin.”', options: ['tulen', 'olisin tullut', 'tulin'], answer: 'olisin tullut', level: 'B2' },
  { id: 'p6', category: 'Lukeminen', prompt: '“Ratkaisu oli perusteltu, joskin hieman ristiriitainen.” Sana “joskin” ilmaisee…', options: ['täydellistä syy-seurausta', 'lievää vastakohtaa tai varausta', 'aikajärjestystä'], answer: 'lievää vastakohtaa tai varausta', level: 'C1' },
  { id: 'p7', category: 'Lukeminen', prompt: '“Hän vihjasi asian olevan toisin kuitenkaan sanomatta sitä suoraan.” Mitä lause korostaa?', options: ['implisiittistä merkitystä', 'epäonnistunutta muistia', 'suoraa käskyä'], answer: 'implisiittistä merkitystä', level: 'C2' },
] as const

export const representativeLesson = {
  slug: 'a1-arki-1',
  title: 'Arjen suomi: Minä menen kauppaan',
  objective: 'Osaat kertoa, minne olet menossa ja käyttää tavallisinta illatiivimuotoa arjen tilanteessa.',
  explanation: 'Kun liikut johonkin paikkaan, suomessa käytetään usein illatiivia. Kauppa → kauppaan, työ → työhön, koulu → kouluun.',
  examples: ['Menen kauppaan.', 'Lähden töihin.', 'Lapset menevät kouluun.'],
  exercise: { prompt: 'Valitse oikea muoto: “Illalla menen ___.”', options: ['kauppa', 'kauppaan', 'kaupassa'], answer: 'kauppaan', explanation: 'Menen kertoo liikkeestä kohti paikkaa, joten käytetään illatiivia: kauppaan.' },
}
