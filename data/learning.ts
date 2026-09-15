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

export const swedishCourses = [
  { level: 'A0–A1', title: 'Svenska från början', text: 'Hälsningar, vardagsord och de första användbara meningarna.', icon: 'å', tone: 'sun' },
  { level: 'A1–A2', title: 'Svenska i vardagen', text: 'Öva service, boende, resor och samtal som du möter i Finland.', icon: 'ö', tone: 'mint' },
  { level: 'A2–B1', title: 'Svenska på jobbet', text: 'Bygg ett praktiskt ordförråd för arbetsplatsen och kundmöten.', icon: 'ä', tone: 'blue' },
]

export const swedishPlacementQuestions = [
  { id: 'sv1', category: 'Ordförråd', prompt: 'Vad betyder “tack”?', options: ['thank you', 'hello', 'sorry'], answer: 'thank you', level: 'A0' },
  { id: 'sv2', category: 'Grammatik', prompt: 'Jag ___ i Finland.', options: ['bor', 'borar', 'bo'], answer: 'bor', level: 'A1' },
  { id: 'sv3', category: 'Vardag', prompt: 'Jag går ___ jobbet klockan åtta.', options: ['till', 'på', 'från'], answer: 'till', level: 'A2' },
  { id: 'sv4', category: 'Läsning', prompt: '“Mötet har flyttats till nästa vecka.” Vad hände?', options: ['Mötet ändrade tid.', 'Mötet började nu.', 'Mötet blev alltid inställt.'], answer: 'Mötet ändrade tid.', level: 'B1' },
] as const

export const swedishRepresentativeLesson = {
  slug: 'sv-a1-vardag-1',
  title: 'Svenska i vardagen: Jag går till jobbet',
  objective: 'Du kan berätta vart du går och använda vanliga uttryck med till.',
  explanation: 'När du berättar om riktning använder svenskan ofta “till”: till jobbet, till butiken, till skolan.',
  examples: ['Jag går till jobbet.', 'Vi åker till butiken.', 'Barnen går till skolan.'],
  exercise: { prompt: 'Välj rätt ord: “På morgonen går jag ___ jobbet.”', options: ['till', 'på', 'med'], answer: 'till', explanation: 'När du uttrycker riktning till en plats passar “till”: till jobbet.' },
}

export const workLifeTracks = [
  { title: 'Sosiaali- ja terveysala', subtitle: 'Hoiva ja terveys', practice: 'Asiakaskohtaamiset, vuoronvaihto, ohjeet ja turvallinen ammattisanasto.' },
  { title: 'Rakennus ja maalaus', subtitle: 'Työmaa', practice: 'Työohjeet, työkalut, materiaalit, turvallisuus ja keskustelu työnjohdon kanssa.' },
  { title: 'IT ja tekninen tuki', subtitle: 'Teknologia', practice: 'Ongelman kuvaaminen, tukipyynnöt, asiakasviestintä ja tiimikeskustelut.' },
  { title: 'Logistiikka ja varasto', subtitle: 'Varasto', practice: 'Keräily, toimitukset, poikkeamat, turvallisuus ja vuoron käytännön viestintä.' },
  { title: 'Siivous ja kiinteistöpalvelut', subtitle: 'Palvelut', practice: 'Kohteet, aineet, työjärjestys, asiakkaat ja vikailmoitukset.' },
  { title: 'Kasvatus ja päiväkoti', subtitle: 'Kasvatus', practice: 'Päivän tilanteet, huoltajaviestintä, ohjeet ja lapsen arjen sanasto.' },
  { title: 'LVI ja huolto', subtitle: 'Tekninen työ', practice: 'Vikojen kuvaus, työmääräykset, osat, turvallisuus ja asiakkaan neuvonta.' },
]
