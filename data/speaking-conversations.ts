import type { LearningLevelId } from '@/data/levels'

export type ConversationTurn = {
  speaker: 'A' | 'B'
  fi: string
  en: string
}

export type SpeakingConversation = {
  id: string
  title: string
  situation: string
  goal: string
  turns: ConversationTurn[]
  learnerPrompts: string[]
  usefulPhrases: string[]
}

export const speakingConversations: Record<LearningLevelId, SpeakingConversation[]> = {
  a0: [
    {
      id: 'a0-greeting', title: 'Ensitapaaminen', situation: 'Tapaat uuden ihmisen ensimmäistä kertaa.', goal: 'Tervehdi, kerro nimesi ja kysy toisen nimi.',
      turns: [
        { speaker: 'A', fi: 'Hei!', en: 'Hi!' },
        { speaker: 'B', fi: 'Moi!', en: 'Hi!' },
        { speaker: 'A', fi: 'Minä olen Amina. Mikä sinun nimesi on?', en: 'I am Amina. What is your name?' },
        { speaker: 'B', fi: 'Minä olen Leo.', en: 'I am Leo.' },
        { speaker: 'A', fi: 'Hauska tavata.', en: 'Nice to meet you.' },
        { speaker: 'B', fi: 'Samoin!', en: 'Likewise!' },
      ],
      learnerPrompts: ['Sano: Hei, minä olen ___.', 'Kysy: Mikä sinun nimesi on?', 'Sano: Hauska tavata.'],
      usefulPhrases: ['Hei!', 'Minä olen…', 'Mikä sinun nimesi on?', 'Hauska tavata.'],
    },
    {
      id: 'a0-cafe', title: 'Kahvilassa', situation: 'Tilaat yhden juoman kahvilassa.', goal: 'Pyydä juoma ja kiitä.',
      turns: [
        { speaker: 'A', fi: 'Hei. Mitä saisi olla?', en: 'Hello. What would you like?' },
        { speaker: 'B', fi: 'Kahvi, kiitos.', en: 'Coffee, please.' },
        { speaker: 'A', fi: 'Maito vai ilman maitoa?', en: 'Milk or without milk?' },
        { speaker: 'B', fi: 'Maidolla, kiitos.', en: 'With milk, please.' },
        { speaker: 'A', fi: 'Ole hyvä.', en: 'Here you are.' },
        { speaker: 'B', fi: 'Kiitos!', en: 'Thank you!' },
      ],
      learnerPrompts: ['Tilaa kahvi tai tee.', 'Valitse maidolla tai ilman maitoa.', 'Kiitä lopuksi.'],
      usefulPhrases: ['Kahvi, kiitos.', 'Maidolla.', 'Ilman maitoa.', 'Kiitos!'],
    },
    {
      id: 'a0-help', title: 'Missä on…?', situation: 'Kysyt, missä wc on.', goal: 'Kysy paikka ja ymmärrä lyhyt vastaus.',
      turns: [
        { speaker: 'A', fi: 'Anteeksi. Missä on wc?', en: 'Excuse me. Where is the toilet?' },
        { speaker: 'B', fi: 'Tuolla.', en: 'Over there.' },
        { speaker: 'A', fi: 'Vasemmalla?', en: 'On the left?' },
        { speaker: 'B', fi: 'Kyllä, vasemmalla.', en: 'Yes, on the left.' },
        { speaker: 'A', fi: 'Kiitos.', en: 'Thank you.' },
        { speaker: 'B', fi: 'Ole hyvä.', en: 'You’re welcome.' },
      ],
      learnerPrompts: ['Kysy: Missä on wc?', 'Varmista: Vasemmalla?', 'Kiitä.'],
      usefulPhrases: ['Anteeksi.', 'Missä on…?', 'Vasemmalla?', 'Kiitos.'],
    },
  ],
  a1: [
    {
      id: 'a1-shop', title: 'Kaupassa', situation: 'Etsit tuotetta ja kysyt hintaa.', goal: 'Kysy missä tuote on, sen hinta ja maksa.',
      turns: [
        { speaker: 'A', fi: 'Hei, voinko auttaa?', en: 'Hi, can I help?' },
        { speaker: 'B', fi: 'Joo, missä maito on?', en: 'Yes, where is the milk?' },
        { speaker: 'A', fi: 'Se on tuolla kylmähyllyssä.', en: 'It is over there in the refrigerated section.' },
        { speaker: 'B', fi: 'Kiitos. Paljonko tämä maksaa?', en: 'Thanks. How much does this cost?' },
        { speaker: 'A', fi: 'Kaksi euroa kaksikymmentä senttiä.', en: 'Two euros and twenty cents.' },
        { speaker: 'B', fi: 'Selvä. Otan tämän.', en: 'Okay. I’ll take this.' },
      ],
      learnerPrompts: ['Kysy missä jokin tuote on.', 'Kysy tuotteen hintaa.', 'Sano, että otat tuotteen.'],
      usefulPhrases: ['Missä ___ on?', 'Paljonko tämä maksaa?', 'Otan tämän.', 'Voinko maksaa kortilla?'],
    },
    {
      id: 'a1-appointment', title: 'Ajan varaaminen', situation: 'Soitat ja varaat ajan.', goal: 'Kerro asia, kysy aikaa ja vahvista päivä.',
      turns: [
        { speaker: 'A', fi: 'Terveyskeskus, hyvää päivää.', en: 'Health centre, good day.' },
        { speaker: 'B', fi: 'Hei. Haluaisin varata ajan.', en: 'Hi. I would like to book an appointment.' },
        { speaker: 'A', fi: 'Sopiiko torstai kello kymmenen?', en: 'Would Thursday at ten suit you?' },
        { speaker: 'B', fi: 'Kyllä, se sopii.', en: 'Yes, that works.' },
        { speaker: 'A', fi: 'Selvä. Torstaina kello kymmenen.', en: 'Okay. Thursday at ten.' },
        { speaker: 'B', fi: 'Kiitos, hei.', en: 'Thank you, bye.' },
      ],
      learnerPrompts: ['Sano, että haluat varata ajan.', 'Hyväksy tai ehdota toinen aika.', 'Vahvista päivä ja kellonaika.'],
      usefulPhrases: ['Haluaisin varata ajan.', 'Sopiiko…?', 'Se sopii.', 'Voisiko olla myöhemmin?'],
    },
    {
      id: 'a1-neighbor', title: 'Naapurin kanssa', situation: 'Tapaat naapurin rappukäytävässä.', goal: 'Käy lyhyt arkinen keskustelu.',
      turns: [
        { speaker: 'A', fi: 'Moi! Oletko uusi täällä?', en: 'Hi! Are you new here?' },
        { speaker: 'B', fi: 'Joo, muutin tänne viime viikolla.', en: 'Yes, I moved here last week.' },
        { speaker: 'A', fi: 'Tervetuloa! Missä asunnossa asut?', en: 'Welcome! Which apartment do you live in?' },
        { speaker: 'B', fi: 'Asun asunnossa kaksitoista.', en: 'I live in apartment twelve.' },
        { speaker: 'A', fi: 'Hyvä. Nähdään!', en: 'Great. See you!' },
        { speaker: 'B', fi: 'Nähdään!', en: 'See you!' },
      ],
      learnerPrompts: ['Kerro, milloin muutit.', 'Kerro asuntosi numero.', 'Lopeta keskustelu luontevasti.'],
      usefulPhrases: ['Muutin tänne…', 'Asun asunnossa…', 'Tervetuloa!', 'Nähdään!'],
    },
  ],
  a2: [
    {
      id: 'a2-work-call', title: 'Puhelu työpaikalle', situation: 'Soitat työpaikalle, koska myöhästyt.', goal: 'Selitä syy, arvioi saapumisaika ja pahoittele.',
      turns: [
        { speaker: 'A', fi: 'Hei, täällä Laura.', en: 'Hi, Laura speaking.' },
        { speaker: 'B', fi: 'Hei, täällä Amir. Soitan, koska bussi on myöhässä.', en: 'Hi, Amir here. I’m calling because the bus is late.' },
        { speaker: 'A', fi: 'Okei. Milloin pääset töihin?', en: 'Okay. When will you get to work?' },
        { speaker: 'B', fi: 'Luulen, että olen siellä noin kahdenkymmenen minuutin päästä.', en: 'I think I’ll be there in about twenty minutes.' },
        { speaker: 'A', fi: 'Selvä, kiitos kun ilmoitit.', en: 'Okay, thanks for letting me know.' },
        { speaker: 'B', fi: 'Pahoittelen myöhästymistä.', en: 'I’m sorry for being late.' },
      ],
      learnerPrompts: ['Kerro miksi olet myöhässä.', 'Arvioi, milloin saavut.', 'Pahoittele tilannetta.'],
      usefulPhrases: ['Soitan, koska…', 'Olen siellä noin…', 'Kiitos kun ilmoitit.', 'Pahoittelen myöhästymistä.'],
    },
    {
      id: 'a2-housing', title: 'Ongelma asunnossa', situation: 'Ilmoitat vuokranantajalle viasta.', goal: 'Kuvaa ongelma ja sovi korjauksesta.',
      turns: [
        { speaker: 'A', fi: 'Hei, miten voin auttaa?', en: 'Hi, how can I help?' },
        { speaker: 'B', fi: 'Keittiön hana vuotaa ja lattialle tulee vettä.', en: 'The kitchen tap is leaking and water is getting onto the floor.' },
        { speaker: 'A', fi: 'Milloin huomasit ongelman?', en: 'When did you notice the problem?' },
        { speaker: 'B', fi: 'Eilen illalla. Se on tänään pahempi.', en: 'Yesterday evening. It is worse today.' },
        { speaker: 'A', fi: 'Huoltomies voi tulla iltapäivällä.', en: 'A maintenance worker can come in the afternoon.' },
        { speaker: 'B', fi: 'Hyvä, olen kotona neljän jälkeen.', en: 'Good, I’ll be at home after four.' },
      ],
      learnerPrompts: ['Kuvaa vika.', 'Kerro milloin se alkoi.', 'Sovi sopiva aika korjaukselle.'],
      usefulPhrases: ['___ ei toimi.', 'Se alkoi eilen.', 'Voisiko joku tulla katsomaan?', 'Olen kotona…'],
    },
    {
      id: 'a2-weekend', title: 'Viikonlopusta kertominen', situation: 'Keskustelet ystävän kanssa viikonlopusta.', goal: 'Kerro menneestä tapahtumasta ja kysy jatkokysymys.',
      turns: [
        { speaker: 'A', fi: 'Mitä teit viikonloppuna?', en: 'What did you do at the weekend?' },
        { speaker: 'B', fi: 'Kävin ystävän kanssa Porvoossa.', en: 'I went to Porvoo with a friend.' },
        { speaker: 'A', fi: 'Oliko siellä mukavaa?', en: 'Was it nice there?' },
        { speaker: 'B', fi: 'Oli. Kävelimme vanhassa kaupungissa ja söimme ravintolassa.', en: 'Yes. We walked in the old town and ate at a restaurant.' },
        { speaker: 'A', fi: 'Kuulostaa hyvältä.', en: 'Sounds good.' },
        { speaker: 'B', fi: 'Entä sinun viikonloppusi?', en: 'How about your weekend?' },
      ],
      learnerPrompts: ['Kerro yksi asia, jonka teit viikonloppuna.', 'Kerro missä olit ja kenen kanssa.', 'Kysy lopuksi toiselta samaa.'],
      usefulPhrases: ['Kävin…', 'Oli mukavaa.', 'Sitten me…', 'Entä sinä?'],
    },
  ],
  b1: [
    {
      id: 'b1-job-interview', title: 'Työhaastattelu', situation: 'Vastaat tavallisiin työhaastattelukysymyksiin.', goal: 'Kuvaa kokemusta, vahvuuksia ja motivaatiota selkeästi.',
      turns: [
        { speaker: 'A', fi: 'Kertoisitko lyhyesti itsestäsi ja työkokemuksestasi?', en: 'Could you briefly tell me about yourself and your work experience?' },
        { speaker: 'B', fi: 'Olen työskennellyt rakennusalalla kolme vuotta ja olen erityisesti tehnyt maalaus- ja viimeistelytöitä.', en: 'I have worked in construction for three years, especially in painting and finishing work.' },
        { speaker: 'A', fi: 'Mitkä ovat vahvuutesi työntekijänä?', en: 'What are your strengths as an employee?' },
        { speaker: 'B', fi: 'Olen täsmällinen, opin nopeasti ja pidän kiinni sovituista asioista.', en: 'I am punctual, learn quickly and keep to agreements.' },
        { speaker: 'A', fi: 'Miksi haluat tämän työn?', en: 'Why do you want this job?' },
        { speaker: 'B', fi: 'Haluan kehittää osaamistani ja uskon, että kokemuksestani olisi hyötyä tiimille.', en: 'I want to develop my skills and believe my experience would benefit the team.' },
      ],
      learnerPrompts: ['Esittele työkokemuksesi noin 30 sekunnissa.', 'Kerro kaksi vahvuuttasi ja perustele toinen.', 'Vastaa kysymykseen: Miksi haluat tämän työn?'],
      usefulPhrases: ['Olen työskennellyt…', 'Vahvuuteni on…', 'Olen oppinut, että…', 'Uskon, että voisin…'],
    },
    {
      id: 'b1-complaint', title: 'Reklamaatio palvelusta', situation: 'Palvelu ei vastannut sovittua.', goal: 'Kuvaa ongelma asiallisesti ja ehdota ratkaisua.',
      turns: [
        { speaker: 'A', fi: 'Asiakaspalvelu, miten voin auttaa?', en: 'Customer service, how can I help?' },
        { speaker: 'B', fi: 'Tilaukseni piti saapua maanantaina, mutta en ole saanut sitä vieläkään.', en: 'My order was supposed to arrive on Monday, but I still haven’t received it.' },
        { speaker: 'A', fi: 'Pahoittelen. Tarkistan tilanteen. Näyttää siltä, että toimitus on viivästynyt.', en: 'I’m sorry. I’ll check the situation. It looks like the delivery has been delayed.' },
        { speaker: 'B', fi: 'Tarvitsen tuotteen viimeistään huomenna. Voisitteko järjestää pikatoimituksen?', en: 'I need the product by tomorrow at the latest. Could you arrange express delivery?' },
        { speaker: 'A', fi: 'Selvitän, onnistuuko se ilman lisämaksua.', en: 'I’ll find out whether that is possible without an extra charge.' },
        { speaker: 'B', fi: 'Kiitos. Toivoisin vahvistuksen sähköpostilla.', en: 'Thank you. I would like confirmation by email.' },
      ],
      learnerPrompts: ['Kerro, mitä piti tapahtua ja mitä tapahtui.', 'Sano, mitä tarvitset nyt.', 'Pyydä vahvistus tai jatkotoimenpide.'],
      usefulPhrases: ['Piti…, mutta…', 'Voisitteko…?', 'Tarvitsen tämän viimeistään…', 'Toivoisin vahvistuksen…'],
    },
    {
      id: 'b1-opinion', title: 'Mielipide ja perustelu', situation: 'Keskustelet työmatkaliikenteestä.', goal: 'Esitä mielipide, perustele ja reagoi eri näkemykseen.',
      turns: [
        { speaker: 'A', fi: 'Pitäisikö keskustassa olla vähemmän autoja?', en: 'Should there be fewer cars in the city centre?' },
        { speaker: 'B', fi: 'Minusta kyllä, koska joukkoliikenne toimisi silloin paremmin ja ilma olisi puhtaampaa.', en: 'I think so, because public transport would work better and the air would be cleaner.' },
        { speaker: 'A', fi: 'Mutta kaikille joukkoliikenne ei ole käytännöllinen.', en: 'But public transport is not practical for everyone.' },
        { speaker: 'B', fi: 'Se on totta. Siksi rajoitusten pitäisi olla joustavia eikä samoja kaikkialla.', en: 'That is true. That is why restrictions should be flexible rather than the same everywhere.' },
        { speaker: 'A', fi: 'Mikä olisi mielestäsi hyvä kompromissi?', en: 'What would be a good compromise in your opinion?' },
        { speaker: 'B', fi: 'Parantaisin ensin joukkoliikennettä ja vähentäisin autoilua asteittain.', en: 'I would first improve public transport and reduce driving gradually.' },
      ],
      learnerPrompts: ['Esitä oma mielipiteesi.', 'Anna vähintään kaksi perustelua.', 'Myönnä yksi hyvä kohta vastakkaisesta näkemyksestä ja vastaa siihen.'],
      usefulPhrases: ['Minusta… koska…', 'Toisaalta…', 'Se on totta, mutta…', 'Hyvä kompromissi olisi…'],
    },
  ],
  b2: [
    {
      id: 'b2-negotiation', title: 'Työtehtävistä neuvotteleminen', situation: 'Työmääräsi on kasvanut ja neuvottelet prioriteeteista esihenkilön kanssa.', goal: 'Perustele, ehdota vaihtoehtoja ja sovi konkreettisesta ratkaisusta.',
      turns: [
        { speaker: 'A', fi: 'Miltä tämän viikon työtilanne näyttää?', en: 'How is your workload looking this week?' },
        { speaker: 'B', fi: 'Nykyisellä työmäärällä en pysty tekemään kaikkia tehtäviä laadukkaasti määräaikaan mennessä.', en: 'With the current workload, I cannot complete all tasks to a good standard by the deadline.' },
        { speaker: 'A', fi: 'Mikä tehtävistä vie eniten aikaa?', en: 'Which task takes the most time?' },
        { speaker: 'B', fi: 'Asiakasraportti. Ehdottaisin, että siirrämme sisäisen dokumentoinnin ensi viikolle.', en: 'The client report. I would suggest moving the internal documentation to next week.' },
        { speaker: 'A', fi: 'Se voisi onnistua, jos raportti valmistuu torstaihin mennessä.', en: 'That could work if the report is completed by Thursday.' },
        { speaker: 'B', fi: 'Sopii. Lähetän torstaina raportin ja teen dokumentoinnin maanantaina.', en: 'Agreed. I’ll send the report on Thursday and do the documentation on Monday.' },
      ],
      learnerPrompts: ['Kuvaa ongelma ilman syyttelyä.', 'Ehdota vähintään kahta ratkaisua.', 'Tee lopuksi selkeä yhteenveto sovitusta.'],
      usefulPhrases: ['Nykyisellä työmäärällä…', 'Ehdottaisin, että…', 'Vaihtoehtoisesti voisimme…', 'Sovitaan siis, että…'],
    },
    {
      id: 'b2-meeting', title: 'Kokouksessa eri mieltä', situation: 'Olet eri mieltä ehdotetusta toimintatavasta.', goal: 'Ilmaise eriävä näkemys diplomaattisesti ja rakenna kompromissi.',
      turns: [
        { speaker: 'A', fi: 'Ehdotan, että otamme uuden järjestelmän käyttöön heti ensi kuussa.', en: 'I suggest we introduce the new system immediately next month.' },
        { speaker: 'B', fi: 'Ymmärrän tavoitteen, mutta pidän aikataulua melko riskialttiina.', en: 'I understand the goal, but I find the schedule rather risky.' },
        { speaker: 'A', fi: 'Mikä siinä huolestuttaa sinua eniten?', en: 'What concerns you most about it?' },
        { speaker: 'B', fi: 'Henkilöstö ei ehdi saada riittävää koulutusta. Voisimmeko aloittaa pilotilla yhdessä tiimissä?', en: 'Staff will not have enough time for adequate training. Could we start with a pilot in one team?' },
        { speaker: 'A', fi: 'Pilotti voisi vähentää riskiä.', en: 'A pilot could reduce the risk.' },
        { speaker: 'B', fi: 'Juuri niin. Sen tulosten perusteella voisimme päättää laajemmasta käyttöönotosta.', en: 'Exactly. Based on the results, we could decide on a wider rollout.' },
      ],
      learnerPrompts: ['Ilmaise eriävä mielipide kohteliaasti.', 'Kerro konkreettinen riski.', 'Ehdota kompromissia.'],
      usefulPhrases: ['Ymmärrän näkökulman, mutta…', 'Pidän riskinä sitä, että…', 'Voisimmeko harkita…?', 'Sen perusteella voisimme…'],
    },
    {
      id: 'b2-service', title: 'Vaativa asiakastilanne', situation: 'Asiakas on tyytymätön ja sinun pitää ratkaista tilanne.', goal: 'Rauhoita tilanne, tarkenna ongelma ja neuvottele ratkaisu.',
      turns: [
        { speaker: 'A', fi: 'Tämä on jo kolmas kerta, kun sama ongelma toistuu.', en: 'This is already the third time the same problem has happened.' },
        { speaker: 'B', fi: 'Ymmärrän hyvin, että tilanne on turhauttava. Käydään läpi, mitä tällä kertaa tapahtui.', en: 'I fully understand that the situation is frustrating. Let’s go through what happened this time.' },
        { speaker: 'A', fi: 'Palvelu katkesi kesken tärkeän kokouksen.', en: 'The service was interrupted during an important meeting.' },
        { speaker: 'B', fi: 'Selvä. Tarkistan ensin teknisen syyn ja sen jälkeen voimme sopia hyvityksestä.', en: 'Understood. I’ll first check the technical cause, and then we can agree on compensation.' },
        { speaker: 'A', fi: 'Tarvitsen myös varmistuksen, ettei tämä toistu.', en: 'I also need assurance that this will not happen again.' },
        { speaker: 'B', fi: 'Voin luvata, että tapaus tutkitaan ja saat kirjallisen yhteenvedon korjaavista toimista.', en: 'I can promise that the case will be investigated and you will receive a written summary of the corrective actions.' },
      ],
      learnerPrompts: ['Tunnista asiakkaan tunne ilman liiallista anteeksipyyntöä.', 'Tarkenna ongelma yhdellä kysymyksellä.', 'Ehdota konkreettinen jatkotoimi.'],
      usefulPhrases: ['Ymmärrän, että tilanne on…', 'Käydään läpi…', 'Tarkistan ensin…', 'Saat kirjallisen yhteenvedon…'],
    },
  ],
  c1: [
    {
      id: 'c1-expert', title: 'Asiantuntijakeskustelu', situation: 'Perustelet ammatillisen suosituksen kollegoille.', goal: 'Rakenna argumentoitu kanta, huomioi epävarmuus ja vastaa kriittiseen kysymykseen.',
      turns: [
        { speaker: 'A', fi: 'Miksi suosittelet vaiheittaista käyttöönottoa yhden suuren muutoksen sijaan?', en: 'Why do you recommend a phased rollout instead of one major change?' },
        { speaker: 'B', fi: 'Vaiheistus pienentää operatiivista riskiä ja antaa meille mahdollisuuden korjata oletuksia todellisen käyttäjäpalautteen perusteella.', en: 'A phased approach reduces operational risk and allows us to correct assumptions based on real user feedback.' },
        { speaker: 'A', fi: 'Eikö se kuitenkin hidasta hyötyjen saamista?', en: 'Doesn’t that nevertheless delay the benefits?' },
        { speaker: 'B', fi: 'Lyhyellä aikavälillä kyllä, mutta kokonaisuutena se voi nopeuttaa onnistunutta käyttöönottoa, koska virheiden kustannus jää pienemmäksi.', en: 'In the short term, yes, but overall it can accelerate a successful rollout because the cost of errors remains lower.' },
        { speaker: 'A', fi: 'Millä mittareilla arvioisit pilotin onnistumista?', en: 'Which metrics would you use to assess the success of the pilot?' },
        { speaker: 'B', fi: 'Yhdistäisin käyttäjäkokemuksen, prosessiajan ja virheiden määrän, jotta emme optimoi vain yhtä näkökulmaa.', en: 'I would combine user experience, process time and error rate so that we do not optimize only one perspective.' },
      ],
      learnerPrompts: ['Esitä suositus ja kaksi perustetta.', 'Nimeä yksi epävarmuus tai rajaus.', 'Vastaa kriittiseen vastakysymykseen ilman puolustelua.'],
      usefulPhrases: ['Suosittelisin tätä ennen kaikkea siksi, että…', 'On kuitenkin syytä huomioida…', 'Lyhyellä aikavälillä…, mutta…', 'Arvioisin onnistumista…'],
    },
    {
      id: 'c1-public', title: 'Julkinen keskustelu', situation: 'Osallistut paneeliin, jossa aiheesta on eriäviä näkemyksiä.', goal: 'Rajaa väite, osoita nyanssia ja reagoi toisen argumenttiin rakentavasti.',
      turns: [
        { speaker: 'A', fi: 'On väitetty, että etätyö heikentää väistämättä yhteisöllisyyttä. Oletko samaa mieltä?', en: 'It has been claimed that remote work inevitably weakens community. Do you agree?' },
        { speaker: 'B', fi: 'En käyttäisi sanaa väistämättä. Vaikutus riippuu paljon siitä, miten yhteistyö ja epämuodollinen vuorovaikutus järjestetään.', en: 'I would not use the word inevitably. The effect depends greatly on how collaboration and informal interaction are organized.' },
        { speaker: 'A', fi: 'Mutta spontaanit kohtaamiset jäävät silti vähemmälle.', en: 'But spontaneous encounters are still reduced.' },
        { speaker: 'B', fi: 'Se on mielestäni vahva argumentti. Toisaalta fyysinen läsnäolo ei yksin takaa yhteisöllisyyttä, jos toimintakulttuuri ei tue sitä.', en: 'I think that is a strong argument. On the other hand, physical presence alone does not guarantee community if the culture does not support it.' },
        { speaker: 'A', fi: 'Miten siis toimisit käytännössä?', en: 'So what would you do in practice?' },
        { speaker: 'B', fi: 'Rakentaisin hybridimallin, jossa lähitapaamisilla on selkeä tarkoitus eikä niitä järjestetä vain tavan vuoksi.', en: 'I would build a hybrid model in which in-person meetings have a clear purpose and are not held merely out of habit.' },
      ],
      learnerPrompts: ['Vältä liian absoluuttista väitettä.', 'Tunnusta vastapuolen yksi vahva argumentti.', 'Esitä oma käytännön ratkaisu.'],
      usefulPhrases: ['En muotoilisi asiaa aivan noin jyrkästi.', 'Tämä riippuu pitkälti siitä, miten…', 'Se on vahva argumentti; toisaalta…', 'Käytännössä lähtisin siitä, että…'],
    },
    {
      id: 'c1-feedback', title: 'Rakentava palaute', situation: 'Annat kollegalle kriittistä mutta rakentavaa palautetta.', goal: 'Erota havainto, vaikutus ja kehitysehdotus toisistaan.',
      turns: [
        { speaker: 'A', fi: 'Mitä mieltä olit esityksestäni?', en: 'What did you think of my presentation?' },
        { speaker: 'B', fi: 'Rakenne oli selkeä ja esimerkit toimivat hyvin. Yksi kohta jäi kuitenkin hieman epäselväksi.', en: 'The structure was clear and the examples worked well. One part, however, remained slightly unclear.' },
        { speaker: 'A', fi: 'Mikä kohta?', en: 'Which part?' },
        { speaker: 'B', fi: 'Kun siirryit tuloksista suositukseen, perusteluketju jäi melko lyhyeksi. Voisit ehkä tehdä oletukset näkyvämmiksi.', en: 'When you moved from the results to the recommendation, the chain of reasoning was quite brief. You could perhaps make the assumptions more explicit.' },
        { speaker: 'A', fi: 'Hyvä huomio. Olisiko yksi lisäkalvo mielestäsi riittävä?', en: 'Good point. Do you think one additional slide would be enough?' },
        { speaker: 'B', fi: 'Todennäköisesti, jos siinä yhdistät havainnot suoraan suositukseen.', en: 'Probably, if you link the findings directly to the recommendation.' },
      ],
      learnerPrompts: ['Aloita vahvuudesta.', 'Kuvaa yksi tarkka havainto.', 'Ehdota parannusta mahdollisimman konkreettisesti.'],
      usefulPhrases: ['Erityisen hyvin toimi…', 'Yksi kohta jäi kuitenkin…', 'Voisit ehkä…', 'Tämä voisi selkeyttää…'],
    },
  ],
  c2: [
    {
      id: 'c2-nuance', title: 'Sävy ja implisiittinen merkitys', situation: 'Keskustelet tilanteesta, jossa suora ilmaisu olisi liian karkea.', goal: 'Tulkkaa vihjeitä, käytä hienovaraista erimielisyyttä ja säädä sävyä.',
      turns: [
        { speaker: 'A', fi: 'No, tämä ehdotus on ainakin… kunnianhimoinen.', en: 'Well, this proposal is at least… ambitious.' },
        { speaker: 'B', fi: 'Kuulostaa siltä, että sinulla on joitakin varauksia sen toteuttamiskelpoisuudesta.', en: 'It sounds as though you have some reservations about its feasibility.' },
        { speaker: 'A', fi: 'Sanotaan vaikka niin, että aikataulu herättää kysymyksiä.', en: 'Let’s say that the schedule raises some questions.' },
        { speaker: 'B', fi: 'Ymmärrän. Ehkä meidän kannattaa erottaa tavoitetaso siitä, mikä on realistisesti saavutettavissa tässä ajassa.', en: 'I understand. Perhaps we should distinguish the target level from what is realistically achievable in this timeframe.' },
        { speaker: 'A', fi: 'Niin muotoiltuna voisin allekirjoittaa ajatuksen.', en: 'Framed that way, I could agree with the idea.' },
        { speaker: 'B', fi: 'Hyvä. Muokataan siis ehdotusta niin, että kunnianhimo säilyy mutta toimeenpano on uskottava.', en: 'Good. Let’s revise the proposal so that the ambition remains but the implementation is credible.' },
      ],
      learnerPrompts: ['Tunnista yksi epäsuora kriittinen viesti.', 'Muotoile eriävä näkemys ilman suoraa torjuntaa.', 'Tee sovitteleva uudelleenmuotoilu.'],
      usefulPhrases: ['Kuulostaa siltä, että…', 'Sanotaan vaikka niin, että…', 'Ehkä kannattaisi erottaa…', 'Niin muotoiltuna…'],
    },
    {
      id: 'c2-rhetoric', title: 'Retorinen väittely', situation: 'Puolustat kantaa, mutta haluat välttää mustavalkoisen vastakkainasettelun.', goal: 'Käsittele oletuksia, implikaatioita ja vastaväitettä retorisesti taitavasti.',
      turns: [
        { speaker: 'A', fi: 'Jos sääntelyä lisätään, eikö innovaatio väistämättä kärsi?', en: 'If regulation is increased, won’t innovation inevitably suffer?' },
        { speaker: 'B', fi: 'Kysymys sisältää oletuksen, että sääntely ja innovaatio olisivat automaattisesti vastakkaisia voimia. En pitäisi sitä itsestään selvänä.', en: 'The question contains an assumption that regulation and innovation are automatically opposing forces. I would not take that for granted.' },
        { speaker: 'A', fi: 'Mutta lisävelvoitteet lisäävät kustannuksia.', en: 'But additional obligations increase costs.' },
        { speaker: 'B', fi: 'Se on totta, mutta ratkaisevaa on, millaisia kustannuksia verrataan ja millä aikajänteellä. Ennakoitava sääntely voi myös vähentää epävarmuutta.', en: 'That is true, but what matters is which costs are compared and over what timeframe. Predictable regulation can also reduce uncertainty.' },
        { speaker: 'A', fi: 'Eli et vastusta sääntelyä periaatteessa?', en: 'So you do not oppose regulation in principle?' },
        { speaker: 'B', fi: 'En tarkastelisi asiaa puolesta–vastaan-akselilla, vaan kysyisin, millainen sääntely ohjaa tehokkaasti ilman tarpeetonta kitkaa.', en: 'I would not view it on a for-or-against axis, but ask what kind of regulation guides effectively without unnecessary friction.' },
      ],
      learnerPrompts: ['Tunnista kysymyksen piilevä oletus.', 'Hyväksy osa vastaväitteestä, mutta muuta tarkastelukulmaa.', 'Vältä keinotekoista joko–tai-asetelmaa.'],
      usefulPhrases: ['Kysymys sisältää oletuksen, että…', 'En pitäisi sitä itsestään selvänä.', 'Ratkaisevaa on…', 'En tarkastelisi asiaa… vaan…'],
    },
    {
      id: 'c2-register', title: 'Rekisterin vaihto', situation: 'Selität saman asian ensin asiantuntijalle ja sitten tavalliselle asiakkaalle.', goal: 'Vaihda sanastoa, rakennetta ja sävyä tarkoituksenmukaisesti.',
      turns: [
        { speaker: 'A', fi: 'Miten kuvaisit tämän teknisen ongelman asiantuntijalle?', en: 'How would you describe this technical problem to a specialist?' },
        { speaker: 'B', fi: 'Järjestelmän vasteaika kasvaa kuormituksen myötä epälineaarisesti, mikä viittaa resurssipullonkaulaan.', en: 'The system response time increases non-linearly with load, which suggests a resource bottleneck.' },
        { speaker: 'A', fi: 'Entä asiakkaalle, joka ei tunne tekniikkaa?', en: 'And to a customer who is not familiar with the technology?' },
        { speaker: 'B', fi: 'Palvelu hidastuu silloin, kun käyttäjiä on paljon yhtä aikaa. Selvitämme parhaillaan, mikä osa järjestelmästä aiheuttaa viiveen.', en: 'The service slows down when many users are using it at the same time. We are currently investigating which part of the system is causing the delay.' },
        { speaker: 'A', fi: 'Miksi jälkimmäinen toimii paremmin asiakkaalle?', en: 'Why does the latter work better for the customer?' },
        { speaker: 'B', fi: 'Se säilyttää olennaisen tiedon mutta poistaa terminologian, joka ei auta asiakasta tekemään päätöksiä.', en: 'It preserves the essential information but removes terminology that does not help the customer make decisions.' },
      ],
      learnerPrompts: ['Selitä yksi tekninen asia asiantuntijarekisterillä.', 'Selitä sama asia arkikielellä.', 'Kerro, mitä tietoa jätit pois ja miksi.'],
      usefulPhrases: ['Teknisesti kyse on…', 'Käytännössä tämä tarkoittaa…', 'Olennaista käyttäjän kannalta on…', 'Jättäisin termin pois, koska…'],
    },
  ],
}

export function getSpeakingConversations(level: LearningLevelId) {
  return speakingConversations[level]
}

