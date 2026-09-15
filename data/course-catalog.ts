import type { CourseDefinition, CourseLesson, CourseModule } from '@/types/course'

type VocabPair = readonly [fi: string, en: string]
type LessonBlueprint = {
  slug: string
  title: string
  objective: string
  phrase: string
  meaning: string
  grammar: string
  vocab: readonly VocabPair[]
  minutes?: number
}

type ModuleBlueprint = {
  title: string
  unitTitle: string
  lessons: readonly LessonBlueprint[]
}

const L = (slug: string, title: string, objective: string, phrase: string, meaning: string, grammar: string, vocab: readonly VocabPair[], minutes = 12): LessonBlueprint => ({
  slug, title, objective, phrase, meaning, grammar, vocab, minutes,
})

function makeLesson(level: string, index: number, seed: LessonBlueprint): CourseLesson {
  const id = `${level.toLowerCase()}-l${index}`
  const v1 = seed.vocab[0] ?? ['sana', 'word']
  const v2 = seed.vocab[1] ?? ['lause', 'sentence']
  const v3 = seed.vocab[2] ?? ['harjoitus', 'exercise']
  const grammarDistractors = [
    'Suomen peruslauseessa verbi on aina viimeisenä.',
    'Kaikki sanat taipuvat aina samalla tavalla.',
  ]

  return {
    id,
    slug: seed.slug,
    title: seed.title,
    objective: seed.objective,
    estimatedMinutes: seed.minutes ?? 12,
    activities: [
      {
        id: `${id}-a1`, title: 'Opi', kind: 'learn', required: true, exerciseIds: [],
        content: `${seed.objective} Mallilause: “${seed.phrase}” (${seed.meaning}).`,
      },
      {
        id: `${id}-a2`, title: 'Ymmärrä', kind: 'understand', required: true, exerciseIds: [`${id}-e1`, `${id}-e2`],
        content: `${seed.grammar} Kiinnitä huomiota sekä merkitykseen että tilanteeseen, jossa rakennetta käytetään.`,
      },
      {
        id: `${id}-a3`, title: 'Harjoittele', kind: 'practice', required: true, exerciseIds: [`${id}-e3`, `${id}-e4`],
        content: `Harjoittele oppitunnin ydinsanastoa ja mallilausetta. Älä arvaa nopeasti: perustele itsellesi, miksi valitset vastauksen.`,
      },
      {
        id: `${id}-a4`, title: 'Käytä', kind: 'apply', required: false, exerciseIds: [],
        content: `Sano mallilause ääneen kaksi kertaa ja tee sitten oma samantyyppinen lause. Kirjoita lisäksi yksi oma esimerkki aiheesta “${seed.title}”.`,
      },
      {
        id: `${id}-a5`, title: 'Tarkista', kind: 'check', required: true, exerciseIds: [`${id}-e5`, `${id}-e6`],
        content: `Tarkista, että osaat ydinsanaston, ymmärrät mallilauseen ja pystyt tuottamaan sen ilman vihjettä.`,
      },
    ],
    exercises: [
      {
        id: `${id}-e1`, type: 'multiple-choice',
        prompt: `Mitä mallilause “${seed.phrase}” tarkoittaa?`,
        options: [seed.meaning, v2[1], v3[1]], correctAnswer: seed.meaning,
        explanation: `Mallilauseen merkitys on: ${seed.meaning}.`, skill: 'reading', points: 10,
      },
      {
        id: `${id}-e2`, type: 'multiple-choice',
        prompt: 'Mikä kielioppihuomio kuuluu tähän oppituntiin?',
        options: [seed.grammar, ...grammarDistractors], correctAnswer: seed.grammar,
        explanation: seed.grammar, skill: 'grammar', points: 10,
      },
      {
        id: `${id}-e3`, type: 'multiple-choice',
        prompt: `Mitä sana “${v1[0]}” tarkoittaa?`,
        options: [v1[1], v2[1], v3[1]], correctAnswer: v1[1],
        explanation: `${v1[0]} = ${v1[1]}.`, skill: 'vocabulary', points: 10,
      },
      {
        id: `${id}-e4`, type: 'multiple-choice',
        prompt: `Valitse oppitunnin ydinsana, joka tarkoittaa “${v2[1]}”.`,
        options: [v1[0], v2[0], v3[0]], correctAnswer: v2[0],
        explanation: `${v2[0]} = ${v2[1]}.`, skill: 'vocabulary', points: 10,
      },
      {
        id: `${id}-e5`, type: 'translation',
        prompt: `Kirjoita suomeksi: ${seed.meaning}`,
        correctAnswer: seed.phrase,
        acceptableAnswers: [seed.phrase, seed.phrase.replace(/[.!?]$/, '')],
        explanation: `Mallivastaus: ${seed.phrase}`, hint: `Aihe: ${seed.title}`, skill: 'writing', points: 15,
      },
      {
        id: `${id}-e6`, type: 'multiple-choice',
        prompt: `Mikä sana kuuluu tämän oppitunnin sanastoon ja tarkoittaa “${v3[1]}”?`,
        options: [v2[0], v3[0], v1[0]], correctAnswer: v3[0],
        explanation: `${v3[0]} = ${v3[1]}.`, skill: 'vocabulary', points: 15,
      },
    ],
  }
}

function makeCourse(id: string, level: CourseDefinition['level'], title: string, description: string, status: CourseDefinition['status'], modules: readonly ModuleBlueprint[]): CourseDefinition {
  let lessonIndex = 0
  const builtModules: CourseModule[] = modules.map((seed, moduleIndex) => ({
    id: `${level.toLowerCase()}-m${moduleIndex + 1}`,
    title: seed.title,
    units: [{
      id: `${level.toLowerCase()}-u${moduleIndex + 1}`,
      title: seed.unitTitle,
      lessons: seed.lessons.map(lesson => makeLesson(level, ++lessonIndex, lesson)),
    }],
  }))
  return { id, language: 'fi', level, title, description, status, modules: builtModules }
}

const a0Modules: readonly ModuleBlueprint[] = [
  { title: 'Ensimmäiset sanat', unitTitle: 'Tervehdykset ja minä', lessons: [
    L('a0-hei', 'Hei! Minä olen…', 'Osaat tervehtiä ja kertoa nimesi.', 'Hei! Minä olen Sara.', 'Hi! I am Sara.', 'Minä-pronominin kanssa olla-verbin muoto on olen.', [['hei','hello'],['nimi','name'],['olen','am']]),
    L('a0-kiitos', 'Kiitos ja anteeksi', 'Osaat käyttää tärkeimpiä kohteliaisuusilmauksia.', 'Kiitos paljon!', 'Thank you very much!', 'Kiitos ei taivu tässä ilmauksessa.', [['kiitos','thank you'],['anteeksi','sorry / excuse me'],['ole hyvä','you are welcome']]),
    L('a0-mita-kuuluu', 'Mitä kuuluu?', 'Osaat kysyä ja kertoa lyhyesti voinnista.', 'Hyvää kuuluu, kiitos.', 'I am fine, thank you.', 'Kuuluu-rakenne on tavallinen tapa kysyä vointia.', [['hyvä','good'],['kuuluu','is going'],['ihan hyvin','quite well']]),
    L('a0-maat-kielet', 'Maa ja kieli', 'Osaat kertoa mistä olet ja mitä kieltä puhut.', 'Olen Suomesta ja puhun englantia.', 'I am from Finland and I speak English.', 'Mistä? vastaa lähtökohtaan: Suomesta, Virosta, Irakista.', [['Suomi','Finland'],['kieli','language'],['puhua','to speak']]),
  ]},
  { title: 'Arjen perusteet', unitTitle: 'Numerot, aika ja perhe', lessons: [
    L('a0-numerot', 'Numerot 0–20', 'Tunnistat ja sanot tavallisimmat pienet luvut.', 'Minulla on kaksi lasta.', 'I have two children.', 'Lukumäärän jälkeen yksiköllinen sana on usein partitiivissa: kaksi lasta.', [['yksi','one'],['kaksi','two'],['kymmenen','ten']]),
    L('a0-kello', 'Mitä kello on?', 'Osaat kysyä ja sanoa tasatunnin.', 'Kello on kolme.', 'It is three o’clock.', 'Kellonaika ilmaistaan rakenteella kello on + luku.', [['kello','clock / time'],['kolme','three'],['nyt','now']]),
    L('a0-paivat', 'Viikonpäivät', 'Tunnistat viikonpäivät ja osaat kertoa päivän.', 'Tänään on maanantai.', 'Today is Monday.', 'Tänään on + viikonpäivä on perusrakenne.', [['tänään','today'],['maanantai','Monday'],['perjantai','Friday']]),
    L('a0-perhe', 'Minun perheeni', 'Osaat nimetä tavallisia perheenjäseniä.', 'Tämä on minun äitini.', 'This is my mother.', 'Minun + omistusmuoto: minun äitini, minun isäni.', [['äiti','mother'],['isä','father'],['lapsi','child']]),
  ]},
  { title: 'Selviydy arjessa', unitTitle: 'Koti, kauppa ja liikkuminen', lessons: [
    L('a0-koti', 'Kotona', 'Osaat nimetä kodin perusasioita.', 'Keittiö on täällä.', 'The kitchen is here.', 'On-verbi kertoo sijainnin: keittiö on täällä.', [['koti','home'],['keittiö','kitchen'],['ovi','door']]),
    L('a0-ruoka', 'Ruoka ja juoma', 'Osaat pyytää tavallista ruokaa tai juomaa.', 'Haluaisin vettä, kiitos.', 'I would like water, please.', 'Haluaisin on kohtelias pyyntö; aine-sana on usein partitiivissa: vettä.', [['vesi','water'],['kahvi','coffee'],['leipä','bread']]),
    L('a0-kauppa', 'Kaupassa', 'Osaat kysyä yksinkertaisen hinnan.', 'Paljonko tämä maksaa?', 'How much does this cost?', 'Paljonko kysyy määrää tai hintaa.', [['maksaa','to cost'],['euro','euro'],['kauppa','shop']]),
    L('a0-bussi', 'Bussi ja pysäkki', 'Osaat tunnistaa tavalliset joukkoliikenteen sanat.', 'Missä bussipysäkki on?', 'Where is the bus stop?', 'Missä? kysyy sijaintia.', [['bussi','bus'],['pysäkki','stop'],['lippu','ticket']]),
    L('a0-saa', 'Sää tänään', 'Osaat sanoa muutaman tavallisen sääilmauksen.', 'Tänään on kylmä.', 'It is cold today.', 'Säästä käytetään usein rakennetta on + adjektiivi.', [['kylmä','cold'],['lämmin','warm'],['sataa','to rain']]),
    L('a0-apua', 'Tarvitsen apua', 'Osaat pyytää apua turvallisesti.', 'Anteeksi, tarvitsen apua.', 'Excuse me, I need help.', 'Tarvitsen + partitiivi: tarvitsen apua.', [['apu','help'],['tarvitsen','I need'],['anteeksi','excuse me']]),
    L('a0-hyvastit', 'Näkemiin!', 'Osaat lopettaa lyhyen keskustelun.', 'Nähdään huomenna!', 'See you tomorrow!', 'Aikailmaus huomenna kertoo tulevasta päivästä ilman erillistä futuuria.', [['näkemiin','goodbye'],['huomenna','tomorrow'],['nähdään','see you']]),
  ]},
]

const a1Modules: readonly ModuleBlueprint[] = [
  { title: 'Minä ja arki', unitTitle: 'Päivä, aika ja liikkuminen', lessons: [
    L('a1-paivani', 'Päiväni', 'Osaat kertoa tavallisesta päivästäsi preesensissä.', 'Herään seitsemältä ja menen töihin.', 'I wake up at seven and go to work.', 'Minä-muodossa verbi saa usein -n-lopun: herään, menen.', [['herätä','to wake up'],['mennä','to go'],['työ','work']]),
    L('a1-kellonajat', 'Kellonajat ja tapaamiset', 'Osaat sopia yksinkertaisen ajan.', 'Sopiiko kello kaksi?', 'Does two o’clock work?', 'Kellonaika voidaan ilmaista kello + luku.', [['sopia','to suit'],['tapaaminen','appointment'],['myöhässä','late']]),
    L('a1-missa-mista-mihin', 'Missä, mistä, mihin?', 'Erotat sijainnin, lähtökohdan ja suunnan.', 'Olen kaupassa, tulen kaupasta ja menen kotiin.', 'I am at the shop, come from the shop and go home.', 'Missä = -ssa/-ssä, mistä = -sta/-stä, mihin = usein -Vn/-seen/-hVn.', [['kaupassa','in the shop'],['kaupasta','from the shop'],['kauppaan','into the shop']]),
    L('a1-julkinen-liikenne', 'Julkinen liikenne', 'Osaat kysyä reittiä ja lippua.', 'Meneekö tämä bussi keskustaan?', 'Does this bus go to the city centre?', 'Kysymysliite -ko/-kö tekee kyllä/ei-kysymyksen.', [['keskusta','city centre'],['vaihto','transfer'],['lippu','ticket']]),
  ]},
  { title: 'Palvelutilanteet', unitTitle: 'Kauppa, kahvila ja ravintola', lessons: [
    L('a1-kaupassa', 'Kaupassa asiointi', 'Osaat kysyä hintaa ja tuotteen sijaintia.', 'Missä maito on?', 'Where is the milk?', 'Missä? kysyy paikkaa; tietty tuote on nominatiivissa.', [['hinta','price'],['maito','milk'],['kassa','checkout']]),
    L('a1-kahvilassa', 'Kahvilassa', 'Osaat tilata juoman ja pienen syötävän.', 'Saisinko kahvin ja pullan?', 'Could I have a coffee and a bun?', 'Saisinko on kohtelias konditionaalimuotoinen pyyntö.', [['kahvi','coffee'],['pulla','bun'],['lasku','bill']]),
    L('a1-ravintolassa', 'Ravintolassa', 'Osaat tilata ruoan ja pyytää laskun.', 'Ottaisin tämän keiton, kiitos.', 'I would take this soup, please.', 'Ottaisin on kohtelias tapa ilmaista valinta.', [['keitto','soup'],['ruokalista','menu'],['lasku','bill']]),
    L('a1-apteekissa', 'Apteekissa', 'Osaat kertoa yksinkertaisesta oireesta.', 'Minulla on päänsärkyä.', 'I have a headache.', 'Oireesta voidaan sanoa minulla on + partitiivi/nominatiivi tilanteen mukaan.', [['päänsärky','headache'],['lääke','medicine'],['apteekki','pharmacy']]),
  ]},
  { title: 'Koti ja ihmiset', unitTitle: 'Asuminen ja perhe', lessons: [
    L('a1-asuminen', 'Asuminen', 'Osaat kuvailla asuntoasi lyhyesti.', 'Asun pienessä asunnossa Espoossa.', 'I live in a small apartment in Espoo.', 'Missä? käyttää sisäpaikallissijaa: asunnossa, Espoossa.', [['asunto','apartment'],['huone','room'],['vuokra','rent']]),
    L('a1-kotityot', 'Kotityöt', 'Osaat kertoa tavallisista kotitöistä.', 'Siivoan keittiön lauantaina.', 'I clean the kitchen on Saturday.', 'Objekti voi olla kokonainen, kun tekeminen kohdistuu koko asiaan.', [['siivota','to clean'],['pyykki','laundry'],['roskat','trash']]),
    L('a1-perheystavat', 'Perhe ja ystävät', 'Osaat kertoa läheisistä ihmisistä.', 'Minulla on yksi veli ja kaksi ystävää täällä.', 'I have one brother and two friends here.', 'Lukumäärän jälkeen sana on usein partitiivissa: kaksi ystävää.', [['veli','brother'],['ystävä','friend'],['yhdessä','together']]),
    L('a1-vapaa-aika', 'Vapaa-aika', 'Osaat kertoa harrastuksistasi.', 'Käyn uimassa kerran viikossa.', 'I go swimming once a week.', 'Käydä + -massa/-mässä ilmaisee tekemään menemistä tai harrastusta.', [['harrastus','hobby'],['uida','to swim'],['viikko','week']]),
  ]},
  { title: 'Työ ja asiointi', unitTitle: 'Työpäivä, puhelin ja viestit', lessons: [
    L('a1-tyopaiva', 'Työpäivä', 'Osaat kertoa työn perusrutiineista.', 'Aloitan työt kahdeksalta.', 'I start work at eight.', 'Aloittaa + objekti: aloitan työt.', [['aloittaa','to start'],['tauko','break'],['lopettaa','to finish']]),
    L('a1-puhelin', 'Puhelimessa', 'Osaat aloittaa yksinkertaisen puhelun.', 'Hei, täällä on Maria.', 'Hello, Maria speaking.', 'Puhelimessa “täällä on + nimi” on tavallinen esittäytyminen.', [['puhelu','phone call'],['soittaa','to call'],['hetki','moment']]),
    L('a1-viesti', 'Lyhyt viesti', 'Osaat kirjoittaa lyhyen käytännön viestin.', 'Olen vähän myöhässä. Tulen kello yhdeksän.', 'I am a little late. I will come at nine.', 'Suomessa preesens voi ilmaista tulevaa aikaa, kun aika on selvä.', [['myöhässä','late'],['viesti','message'],['tulla','to come']]),
    L('a1-ajanvaraus', 'Ajanvaraus', 'Osaat varata tai muuttaa yksinkertaisen ajan.', 'Haluaisin varata ajan lääkärille.', 'I would like to book an appointment with a doctor.', 'Haluaisin + perusmuoto on kohtelias pyyntörakenne.', [['varata','to book'],['aika','appointment/time'],['lääkäri','doctor']]),
  ]},
  { title: 'Kieli käytössä', unitTitle: 'Kysymykset, partitiivi ja puhekieli', lessons: [
    L('a1-kysymykset', 'Kysymyssanat', 'Osaat käyttää kuka, mikä, missä, milloin ja miksi.', 'Milloin kauppa sulkeutuu?', 'When does the shop close?', 'Kysymyssana aloittaa usein kysymyslauseen.', [['milloin','when'],['miksi','why'],['kuka','who']]),
    L('a1-partitiivi', 'Partitiivin perusteet', 'Tunnistat tavallisia partitiivin käyttötapoja.', 'Juon kahvia ja syön leipää.', 'I drink coffee and eat bread.', 'Aineet ja jakamattomat määrät ovat usein partitiivissa.', [['kahvia','coffee (partitive)'],['leipää','bread (partitive)'],['vettä','water (partitive)']]),
    L('a1-puhekieli', 'Puhekielen alku', 'Tunnistat tavallisia minä/sinä-puhekielen muotoja.', 'Mä oon töissä ja sä oot kotona.', 'I am at work and you are at home.', 'Puhekielessä minä → mä, sinä → sä, olen → oon, olet → oot.', [['mä','I (spoken)'],['sä','you (spoken)'],['oon','am (spoken)']]),
    L('a1-kertaus', 'A1-kertaus', 'Yhdistät A1-tason tärkeimmät arjen rakenteet.', 'Huomenna menen töihin bussilla.', 'Tomorrow I go to work by bus.', 'Aika + verbi + suunta + kulkutapa muodostaa luontevan peruslauseen.', [['huomenna','tomorrow'],['töihin','to work'],['bussilla','by bus']]),
  ]},
]

const a2Modules: readonly ModuleBlueprint[] = [
  { title: 'Menneisyys ja kokemukset', unitTitle: 'Imperfekti ja tapahtumat', lessons: [
    L('a2-imperfekti', 'Mitä tapahtui eilen?', 'Osaat kertoa tavallisesta menneestä tapahtumasta.', 'Eilen kävin kaupassa ja ostin ruokaa.', 'Yesterday I went to the shop and bought food.', 'Imperfekti kertoo päättyneestä menneestä tapahtumasta.', [['eilen','yesterday'],['kävin','I went/visited'],['ostin','I bought']]),
    L('a2-viikonloppu', 'Viikonloppuni', 'Osaat kertoa useamman asian menneestä viikonlopusta.', 'Lauantaina tapasin ystäviä ja sunnuntaina lepäsin.', 'On Saturday I met friends and on Sunday I rested.', 'Aikailmaukset auttavat järjestämään kertomuksen.', [['tapasin','I met'],['lepäsin','I rested'],['viikonloppu','weekend']]),
    L('a2-kokemus', 'Oletko koskaan…?', 'Osaat kysyä ja kertoa kokemuksesta.', 'Olen käynyt Lapissa kaksi kertaa.', 'I have been to Lapland twice.', 'Perfekti: olen + partisiippi, kun mennyt kokemus liittyy nykyhetkeen.', [['koskaan','ever'],['käynyt','been/visited'],['kerta','time/occasion']]),
    L('a2-matka', 'Matkasta kertominen', 'Osaat kuvata matkan pääkohdat.', 'Matka meni hyvin, mutta juna oli myöhässä.', 'The trip went well, but the train was late.', 'Mutta yhdistää kaksi vastakkaista tai poikkeavaa asiaa.', [['matka','trip'],['juna','train'],['myöhässä','late']]),
  ]},
  { title: 'Työ ja opiskelu', unitTitle: 'Keskustelut ja viestit', lessons: [
    L('a2-tyokeskustelu', 'Keskustelu työpaikalla', 'Osaat kysyä neuvoa ja selventää tehtävää.', 'Voisitko näyttää, miten tämä tehdään?', 'Could you show me how this is done?', 'Voisitko on kohtelias konditionaalikysymys.', [['näyttää','to show'],['tehtävä','task'],['ohje','instruction']]),
    L('a2-tyovuoro', 'Työvuoro ja aikataulu', 'Osaat puhua vuoroista ja muutoksista.', 'Voinko vaihtaa huomisen vuoron?', 'Can I change tomorrow’s shift?', 'Voinko + perusmuoto kysyy mahdollisuutta tai lupaa.', [['vuoro','shift'],['vaihtaa','to change'],['aikataulu','schedule']]),
    L('a2-sahkoposti', 'Työsähköposti', 'Osaat kirjoittaa lyhyen asiallisen sähköpostin.', 'Hei, liitteenä on pyytämäsi tiedosto.', 'Hello, attached is the file you requested.', 'Asiallisessa viestissä käytetään selkeää tervehdystä, asiaa ja lopetusta.', [['liite','attachment'],['tiedosto','file'],['ystävällisin terveisin','kind regards']]),
    L('a2-opiskelu', 'Opiskelu ja tehtävät', 'Osaat kertoa opiskelusta ja pyytää lisäaikaa.', 'Tarvitsisin yhden päivän lisää aikaa.', 'I would need one more day.', 'Tarvitsisin pehmentää pyyntöä konditionaalilla.', [['tehtävä','assignment'],['määräaika','deadline'],['lisäaika','extra time']]),
  ]},
  { title: 'Asuminen ja palvelut', unitTitle: 'Ongelmatilanteet', lessons: [
    L('a2-asunto-ongelma', 'Asunnossa on ongelma', 'Osaat ilmoittaa tavallisesta asunnon viasta.', 'Keittiön hana vuotaa.', 'The kitchen tap is leaking.', 'Genetiivi ilmaisee omistusta tai osaa: keittiön hana.', [['hana','tap'],['vuotaa','to leak'],['huolto','maintenance']]),
    L('a2-vuokranantaja', 'Viesti vuokranantajalle', 'Osaat kirjoittaa asiallisen vikailmoituksen.', 'Voisitteko lähettää huoltomiehen mahdollisimman pian?', 'Could you send a maintenance worker as soon as possible?', 'Teitittely ja konditionaali tekevät pyynnöstä kohteliaan.', [['vuokranantaja','landlord'],['huoltomies','maintenance worker'],['mahdollisimman pian','as soon as possible']]),
    L('a2-pankki', 'Pankissa', 'Osaat selittää yksinkertaisen pankkiasian.', 'Korttini ei toimi.', 'My card does not work.', 'Omistusliite -ni tarkoittaa minun: korttini.', [['kortti','card'],['tili','account'],['maksu','payment']]),
    L('a2-posti', 'Postissa', 'Osaat lähettää paketin ja kysyä toimituksesta.', 'Haluaisin lähettää tämän paketin Ruotsiin.', 'I would like to send this parcel to Sweden.', 'Lähettää + objekti + suunta kertoo mitä ja minne.', [['paketti','parcel'],['lähettää','to send'],['toimitus','delivery']]),
    L('a2-virasto', 'Viranomaisasiointi', 'Osaat kertoa, mitä asiaa olet hoitamassa.', 'Tulin kysymään oleskeluluvasta.', 'I came to ask about the residence permit.', 'Tulla + -maan/-mään ilmaisee tekemään tulemista.', [['viranomainen','authority'],['hakemus','application'],['oleskelulupa','residence permit']]),
  ]},
  { title: 'Terveys ja puhelut', unitTitle: 'Oireet, ajanvaraus ja neuvonta', lessons: [
    L('a2-laakarissa', 'Lääkärissä', 'Osaat kuvata oireen ja sen keston.', 'Minulla on ollut kuumetta kolme päivää.', 'I have had a fever for three days.', 'Perfekti kertoo tilanteesta, joka alkoi aiemmin ja jatkuu tai vaikuttaa nyt.', [['kuume','fever'],['oire','symptom'],['kolme päivää','three days']]),
    L('a2-puhelu-terveys', 'Puhelu terveysasemalle', 'Osaat varata ajan puhelimessa.', 'Haluaisin varata ajan mahdollisimman pian.', 'I would like to book an appointment as soon as possible.', 'Haluaisin on kohtelias tapa aloittaa pyyntö.', [['terveysasema','health centre'],['ajanvaraus','appointment booking'],['kiireellinen','urgent']]),
    L('a2-neuvo', 'Neuvon pyytäminen', 'Osaat pyytää ja varmistaa ohjeen.', 'Voisitko sanoa sen vielä uudelleen?', 'Could you say that again?', 'Uudelleen tarkoittaa toistamista; vielä pehmentää pyyntöä.', [['uudelleen','again'],['selittää','to explain'],['ymmärtää','to understand']]),
    L('a2-puhelinviesti', 'Puhelinviesti', 'Osaat jättää lyhyen viestin toiselle henkilölle.', 'Voisitko pyytää häntä soittamaan minulle?', 'Could you ask him/her to call me?', 'Pyytää + henkilö + -maan/-mään: pyytää soittamaan.', [['soittaa','to call'],['jättää viesti','leave a message'],['palata asiaan','get back to the matter']]),
  ]},
  { title: 'Kieli laajenee', unitTitle: 'Objekti, rektiot ja sidossanat', lessons: [
    L('a2-objekti', 'Objektin perusteet', 'Tunnistat kokonaisen ja osittaisen tekemisen eron.', 'Luin kirjan, mutta luin myös lehteä.', 'I read the book, but I also read a newspaper.', 'Kokonainen tulos suosii totaalista objektia; keskeneräinen/osittainen usein partitiivia.', [['kirjan','the book (object)'],['lehteä','newspaper (partitive)'],['lukea','to read']]),
    L('a2-rektiot', 'Verbien rektiot', 'Opit muutaman tavallisen verbin vaatiman sijamuodon.', 'Pidän suomalaisesta kahvista.', 'I like Finnish coffee.', 'Pitää + -sta/-stä: pidän kahvista.', [['pitää jostakin','to like something'],['odottaa jotakin','to wait for something'],['auttaa jotakuta','to help someone']]),
    L('a2-koska-siksi', 'Koska, joten ja siksi', 'Osaat perustella ja yhdistää lauseita.', 'Bussi oli myöhässä, joten myöhästyin töistä.', 'The bus was late, so I was late for work.', 'Joten ilmaisee seurauksen; koska ilmaisee syyn.', [['koska','because'],['joten','so / therefore'],['siksi','therefore']]),
    L('a2-vertailu', 'Vertailu', 'Osaat verrata kahta asiaa.', 'Tämä asunto on halvempi kuin edellinen.', 'This apartment is cheaper than the previous one.', 'Komparatiivi muodostuu usein -mpi: halpa → halvempi.', [['halvempi','cheaper'],['parempi','better'],['kuin','than']]),
    L('a2-puhekieli', 'Puhekieli arjessa', 'Tunnistat tavallisia lyhentyneitä puhemuotoja.', 'Mä meen nyt himaan, tuutsä mukaan?', 'I’m going home now, are you coming along?', 'Puheessa menen → meen, tuletko sinä → tuutsä, kotiin → himaan (slangia).', [['meen','I go (spoken)'],['tuutsä','are you coming (spoken)'],['hima','home (slang)']]),
  ]},
]

const b1Modules: readonly ModuleBlueprint[] = [
  { title: 'Itsenäinen arki', unitTitle: 'Asiointi ja ongelmanratkaisu', lessons: [
    L('b1-reklamaatio', 'Reklamaatio', 'Osaat tehdä asiallisen reklamaation ja ehdottaa ratkaisua.', 'Tuote oli viallinen, joten pyydän vaihtoa tai hyvitystä.', 'The product was defective, so I request an exchange or refund.', 'Reklamaatiossa syy ja toivottu ratkaisu kannattaa ilmaista selkeästi.', [['viallinen','defective'],['hyvitys','refund/compensation'],['vaihto','exchange']]),
    L('b1-palvelutilanne', 'Haastava palvelutilanne', 'Osaat selittää ongelman rauhallisesti ja tarkentaa pyyntöä.', 'Ymmärrän tilanteen, mutta tarvitsen ratkaisun tänään.', 'I understand the situation, but I need a solution today.', 'Mutta rakentaa kohteliaan vastakohdan, kun ensin osoitat ymmärrystä.', [['ratkaisu','solution'],['tilanne','situation'],['tarvita','to need']]),
    L('b1-asunto', 'Vuokra-asunnon ongelma', 'Osaat perustella kiireellisen huollon tarpeen.', 'Vuoto on pahentunut, ja pelkään sen aiheuttavan lisävahinkoa.', 'The leak has worsened, and I fear it may cause further damage.', 'Perfekti kuvaa muutosta, jolla on vaikutus nykyhetkeen.', [['vuoto','leak'],['vahinko','damage'],['pahentua','to worsen']]),
    L('b1-viranomainen', 'Viranomaiselle kirjoittaminen', 'Osaat kirjoittaa selkeän asiallisen selvityksen.', 'Liitän mukaan pyydetyt asiakirjat ja lisätiedot.', 'I am attaching the requested documents and additional information.', 'Muodollisessa tekstissä täsmälliset verbit ja substantiivit parantavat selkeyttä.', [['asiakirja','document'],['lisätieto','additional information'],['liittää','to attach']]),
    L('b1-puhelinneuvottelu', 'Puhelimessa selvittäminen', 'Osaat tarkistaa tiedon ja varmistaa yhteisymmärryksen.', 'Ymmärsinkö oikein, että päätös tulee ensi viikolla?', 'Did I understand correctly that the decision will come next week?', 'Epäsuora että-lause auttaa varmistamaan toisen sanoman.', [['päätös','decision'],['varmistaa','to verify'],['ensi viikolla','next week']]),
  ]},
  { title: 'Työelämä', unitTitle: 'Kokoukset, tehtävät ja palaute', lessons: [
    L('b1-kokous', 'Kokouksessa', 'Osaat esittää mielipiteen ja pyytää puheenvuoron.', 'Haluaisin kommentoida tätä ehdotusta lyhyesti.', 'I would like to comment on this proposal briefly.', 'Konditionaali pehmentää puheenvuoron ottamista.', [['ehdotus','proposal'],['kommentoida','to comment'],['puheenvuoro','turn to speak']]),
    L('b1-tyotehtava', 'Työtehtävän tarkennus', 'Osaat tarkentaa tavoitetta, vastuuta ja määräaikaa.', 'Varmistaisin vielä, mikä tämän tehtävän määräaika on.', 'I would just confirm what the deadline for this task is.', 'Konditionaali voi tehdä tarkentavasta kysymyksestä kohteliaan.', [['määräaika','deadline'],['vastuu','responsibility'],['tavoite','goal']]),
    L('b1-palaute', 'Palautteen antaminen', 'Osaat antaa rakentavaa palautetta.', 'Työ on selkeä, mutta perustelua voisi vielä vahvistaa.', 'The work is clear, but the reasoning could still be strengthened.', 'Voisi + perusmuoto ilmaisee pehmeän kehitysehdotuksen.', [['palaute','feedback'],['perustelu','reasoning'],['vahvistaa','to strengthen']]),
    L('b1-tyohaastattelu', 'Työhaastattelu', 'Osaat kertoa osaamisestasi esimerkin avulla.', 'Edellisessä työssäni vastasin asiakaspalvelusta.', 'In my previous job I was responsible for customer service.', 'Vastata + elatiivi: vastata asiakaspalvelusta.', [['osaaminen','competence'],['kokemus','experience'],['vastata jostakin','be responsible for']]),
    L('b1-tyosopimus', 'Työsopimus ja ehdot', 'Osaat kysyä työehdoista ja varmistaa yksityiskohdan.', 'Haluaisin tarkistaa, miten koeaika on määritelty sopimuksessa.', 'I would like to check how the probation period is defined in the contract.', 'Miten-lause voi toimia epäsuorana kysymyksenä.', [['koeaika','probation period'],['ehto','term/condition'],['sopimus','contract']]),
    L('b1-poissaolo', 'Poissaolosta ilmoittaminen', 'Osaat ilmoittaa poissaolosta asiallisesti.', 'Olen sairaana enkä pysty tulemaan töihin tänään.', 'I am ill and cannot come to work today.', 'Enkä yhdistää kielteisen verbin ja toisen lauseen.', [['poissaolo','absence'],['sairas','ill'],['pystyä','to be able']]),
  ]},
  { title: 'Mielipiteet ja keskustelu', unitTitle: 'Perustelu ja reagointi', lessons: [
    L('b1-mielipide', 'Mielipiteen perustelu', 'Osaat esittää mielipiteen ja kaksi perustetta.', 'Mielestäni etätyö on hyödyllistä, koska se säästää aikaa.', 'In my opinion remote work is useful because it saves time.', 'Mielestäni + väite + koska + peruste on selkeä argumenttirakenne.', [['mielestäni','in my opinion'],['etätyö','remote work'],['säästää','to save']]),
    L('b1-samaa-eri-mielta', 'Samaa ja eri mieltä', 'Osaat olla kohteliaasti samaa tai eri mieltä.', 'Ymmärrän näkökulmasi, mutta olen tästä osittain eri mieltä.', 'I understand your point of view, but I partly disagree.', 'Osittain pehmentää vastakkaista kantaa.', [['näkökulma','point of view'],['osittain','partly'],['eri mieltä','disagree']]),
    L('b1-vertailu', 'Vaihtoehtojen vertailu', 'Osaat vertailla etuja ja haittoja.', 'Ensimmäinen vaihtoehto on halvempi, kun taas toinen on joustavampi.', 'The first option is cheaper, whereas the second is more flexible.', 'Kun taas ilmaisee selkeää kontrastia.', [['vaihtoehto','option'],['etu','advantage'],['haitta','disadvantage']]),
    L('b1-neuvottelu', 'Pieni neuvottelu', 'Osaat ehdottaa kompromissia.', 'Voisimmeko sopia ratkaisusta, joka toimii molemmille?', 'Could we agree on a solution that works for both?', 'Voisimmeko on yhteistoimintaan kutsuva konditionaalikysymys.', [['kompromissi','compromise'],['sopia','to agree'],['molemmille','for both']]),
  ]},
  { title: 'Tekstit ja viestintä', unitTitle: 'Sähköposti, uutinen ja yhteenveto', lessons: [
    L('b1-sahkoposti', 'Asiallinen sähköposti', 'Osaat kirjoittaa rakenteisen työ- tai opiskelusähköpostin.', 'Kirjoitan kysyäkseni lisätietoja ensi viikon koulutuksesta.', 'I am writing to ask for more information about next week’s training.', 'Tarkoitusta voi ilmaista rakenteella kysyäkseni, vaikka se on B1+:ssa jo edistyvä.', [['koulutus','training'],['lisätieto','additional information'],['aihe','subject/topic']]),
    L('b1-uutinen', 'Uutisen pääasia', 'Osaat tunnistaa uutistekstin pääasian ja keskeiset faktat.', 'Uutisen mukaan muutos tulee voimaan ensi kuussa.', 'According to the news, the change will take effect next month.', 'Mukaan-rakenne ilmaisee lähteen: uutisen mukaan.', [['muutos','change'],['tulla voimaan','take effect'],['lähde','source']]),
    L('b1-yhteenveto', 'Lyhyt yhteenveto', 'Osaat tiivistää tekstin pääkohdat omin sanoin.', 'Tekstin pääajatus on, että palvelua halutaan parantaa.', 'The main idea of the text is that the service is intended to be improved.', 'Että-lause täydentää pääajatusta.', [['pääajatus','main idea'],['tiivistää','summarize'],['parantaa','improve']]),
    L('b1-ohje', 'Ohjeen ymmärtäminen', 'Osaat seurata monivaiheista käytännön ohjetta.', 'Täytä lomake ensin ja lähetä se sitten sähköisesti.', 'Fill in the form first and then send it electronically.', 'Ensin... sitten jäsentää toimintajärjestystä.', [['lomake','form'],['täyttää','fill in'],['sähköisesti','electronically']]),
    L('b1-lahde', 'Lähteen ja mielipiteen ero', 'Osaat erottaa faktan, arvion ja mielipiteen.', 'Raportin mukaan määrä kasvoi, mutta kirjoittaja pitää muutosta huolestuttavana.', 'According to the report the amount increased, but the writer considers the change worrying.', 'Mukaan merkitsee lähdettä; pitää + essiivi/adjektiivi ilmaisee arviota.', [['raportti','report'],['määrä','amount'],['huolestuttava','worrying']]),
  ]},
  { title: 'B1-kielioppi käytössä', unitTitle: 'Perfekti, passiivi ja konditionaali', lessons: [
    L('b1-perfekti', 'Perfekti käytössä', 'Osaat yhdistää aiemman tapahtuman nykyhetkeen.', 'Olen työskennellyt Suomessa kolme vuotta.', 'I have worked in Finland for three years.', 'Perfekti: olla + nut/nyt-partisiippi.', [['työskennellyt','worked'],['vuosi','year'],['kokemus','experience']]),
    L('b1-passiivi', 'Passiivi arjen ja työn kielessä', 'Osaat ymmärtää ja käyttää tavallista passiivia.', 'Kokous pidetään maanantaina.', 'The meeting will be held on Monday.', 'Passiivi korostaa tekemistä, kun tekijää ei nimetä.', [['pidetään','is held'],['sovitaan','is agreed'],['tehdään','is done']]),
    L('b1-konditionaali', 'Konditionaali', 'Osaat esittää kohteliaita pyyntöjä ja ehtoja.', 'Voisitko lähettää tiedoston tänään?', 'Could you send the file today?', 'Konditionaalin tunnus on usein -isi-.', [['voisitko','could you'],['lähettää','send'],['tiedosto','file']]),
    L('b1-jos', 'Jos-lauseet', 'Osaat ilmaista tavallisen ehdon.', 'Jos ehdin, tulen kokoukseen.', 'If I have time, I will come to the meeting.', 'Jos-lause ilmaisee ehdon; päälausetta ei tarvitse merkitä futuurilla.', [['jos','if'],['ehtiä','have time'],['kokous','meeting']]),
    L('b1-sidossanat', 'Sidossanat', 'Osaat rakentaa pidemmän tekstin loogisesti.', 'Ensinnäkin ratkaisu on halpa, lisäksi se on helppo toteuttaa.', 'Firstly the solution is cheap; in addition it is easy to implement.', 'Sidossanat näyttävät tekstin suhteet: lisäksi, kuitenkin, siksi, toisaalta.', [['ensinnäkin','firstly'],['lisäksi','in addition'],['kuitenkin','however']]),
  ]},
  { title: 'YKI-keskitaso', unitTitle: 'Harjoittelustrategiat', lessons: [
    L('b1-yki-lukeminen', 'YKI: lukemisen strategia', 'Harjoittelet löytämään pääasian ja yksityiskohdat aikarajassa.', 'Lue kysymykset ensin ja etsi sitten tekstistä avainsanat.', 'Read the questions first and then look for keywords in the text.', 'Tehtävästrategia ei korvaa kielitaitoa, mutta auttaa ajankäytössä.', [['avainsana','keyword'],['pääasia','main point'],['yksityiskohta','detail']]),
    L('b1-yki-kuuntelu', 'YKI: kuuntelun strategia', 'Harjoittelet ennakoimaan aihetta ja poimimaan keskeisen tiedon.', 'Ensimmäisellä kuuntelulla keskity pääasiaan.', 'On the first listening, focus on the main point.', 'Kuuntelussa kaikkea ei tarvitse ymmärtää sanasta sanaan.', [['kuuntelu','listening'],['ennakoida','anticipate'],['keskittyä','focus']]),
    L('b1-yki-kirjoitus', 'YKI: kirjoittamisen rakenne', 'Harjoittelet vastaamaan tehtävänannon jokaiseen kohtaan.', 'Vastaa kaikkiin kysymyksiin ja perustele mielipiteesi.', 'Answer all questions and justify your opinion.', 'Tehtävänannon kattaminen on tärkeämpää kuin turha vaikeiden sanojen käyttö.', [['tehtävänanto','task prompt'],['perustella','justify'],['rakenne','structure']]),
    L('b1-yki-puhe', 'YKI: puhumisen rakenne', 'Harjoittelet reagoimaan tilanteeseen ja pitämään puheen käynnissä.', 'Kerro ensin mielipiteesi ja anna sitten esimerkki.', 'State your opinion first and then give an example.', 'Selkeä rakenne auttaa sujuvuutta myös silloin, kun sanasto ei ole täydellinen.', [['mielipide','opinion'],['esimerkki','example'],['sujuvuus','fluency']]),
    L('b1-yki-kertaus', 'YKI: oma tarkistuslista', 'Osaat arvioida harjoitusvastauksen sisältöä ja selkeyttä.', 'Tarkistan lopuksi, vastasinko tehtävään ja onko viestini ymmärrettävä.', 'At the end I check whether I answered the task and whether my message is understandable.', 'OpiOpe-harjoitus ei ole virallinen YKI-arvio tai sertifikaatti.', [['tarkistuslista','checklist'],['ymmärrettävä','understandable'],['harjoitus','practice']]),
  ]},
]

const a0 = makeCourse('fi-a0', 'A0', 'Suomi A0 — Ensiaskeleet', '15 käytännön oppituntia: tervehdykset, numerot, aika, koti, kauppa, liikkuminen ja selviytymisfraasit.', 'published', a0Modules)
const a1 = makeCourse('fi-a1', 'A1', 'Suomi A1 — Arjen perusta', '20 oppituntia arjen peruskielestä: koti, palvelut, työ, puhelut, kysymykset, partitiivi ja puhekieli.', 'published', a1Modules)
const a2 = makeCourse('fi-a2', 'A2', 'Suomi A2 — Sujuvampi arki', '22 oppituntia menneisyydestä, työstä, asumisesta, terveysasioista, viranomaisasioinnista ja laajemmasta kieliopista.', 'published', a2Modules)
const b1 = makeCourse('fi-b1', 'B1', 'Suomi B1 — Itsenäinen kielenkäyttäjä', '30 oppituntia itsenäiseen arkeen, työelämään, mielipiteisiin, teksteihin, kielioppiin ja YKI-keskitason harjoitteluun.', 'published', b1Modules)

function roadmap(id: string, level: CourseDefinition['level'], title: string, description: string): CourseDefinition {
  return { id, language: 'fi', level, title, description, status: 'development', modules: [] }
}

export const courseCatalog: CourseDefinition[] = [
  a0,
  a1,
  a2,
  b1,
  roadmap('fi-b2', 'B2', 'Suomi B2 — Vahva työ- ja opiskelukieli', 'B2-kurssia laajennetaan seuraavaksi argumentointiin, neuvotteluun, vaativiin teksteihin ja työelämän rekistereihin.'),
  roadmap('fi-c1', 'C1', 'Suomi C1 — Edistynyt suomi', 'C1-sisältö laajenee ammatilliseen, akateemiseen ja vivahteikkaaseen kielenkäyttöön.'),
  roadmap('fi-c2', 'C2', 'Suomi C2 — Lähes äidinkielinen hallinta', 'C2-sisältö laajenee pragmatiikkaan, idiomeihin, retoriikkaan ja tekstilajikohtaiseen tyylinvaihtoon.'),
]

export function getPublishedCourses() {
  return courseCatalog.filter(course => course.status === 'published')
}

export function findCourse(courseId: string) {
  return courseCatalog.find(course => course.id === courseId) ?? null
}

export function findLesson(slug: string) {
  for (const course of courseCatalog) {
    for (const courseModule of course.modules) {
      for (const unit of courseModule.units) {
        const lesson = unit.lessons.find(item => item.slug === slug)
        if (lesson) return { course, module: courseModule, unit, lesson }
      }
    }
  }
  return null
}

