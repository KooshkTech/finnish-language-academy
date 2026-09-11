export type IntegrationModule = {
  id: string
  level: 'A0' | 'A1' | 'A2' | 'B1'
  titleFi: string
  titleSv: string
  goalsFi: string[]
  goalsSv: string[]
}

export const integrationCourse = {
  id: 'kotoutumissuomi',
  titleFi: 'Suomi arkeen ja kotoutumiseen',
  titleSv: 'Finska för vardag och integration',
  descriptionFi: 'Käytännön suomea arkeen, työhön, palveluihin ja yhteiskunnassa toimimiseen Suomessa.',
  descriptionSv: 'Praktisk finska för vardag, arbete, service och samhällsliv i Finland.',
  modules: [
    ['01','A0','Ensimmäiset päivät Suomessa','De första dagarna i Finland'],
    ['02','A0','Henkilötiedot ja esittäytyminen','Personuppgifter och presentation'],
    ['03','A1','Asuminen','Boende'],
    ['04','A1','Kauppa ja ruoka','Butik och mat'],
    ['05','A1','Julkinen liikenne','Kollektivtrafik'],
    ['06','A1','Terveysasema','Hälsostation'],
    ['07','A1','Apteekki','Apotek'],
    ['08','A1','Päiväkoti ja koulu','Daghem och skola'],
    ['09','A2','Työ ja työnhaku','Arbete och jobbsökning'],
    ['10','A2','Työllisyyspalvelut','Sysselsättningstjänster'],
    ['11','A2','Kela-asiointi','FPA-ärenden'],
    ['12','A2','Pankki','Bank'],
    ['13','A2','Posti ja digipalvelut','Post och digitala tjänster'],
    ['14','A2','Puhelut ja ajanvaraus','Telefonsamtal och tidsbokning'],
    ['15','B1','Viranomaisasiointi','Myndighetsärenden'],
    ['16','A1','Hätätilanteet','Nödsituationer'],
    ['17','A2','Työturvallisuus','Arbetssäkerhet'],
    ['18','A2','Naapurit ja yhteisö','Grannar och gemenskap'],
    ['19','B1','Suomen yhteiskunta','Det finländska samhället'],
    ['20','B1','Arjen puhekieli','Vardagligt talspråk'],
  ].map(([id, level, titleFi, titleSv]) => ({
    id: `integration-${id}`,
    level: level as IntegrationModule['level'],
    titleFi,
    titleSv,
    goalsFi: ['Ymmärrä keskeinen sanasto', 'Harjoittele oikeaa asiointitilannetta', 'Tuota oma suullinen tai kirjallinen vastaus'],
    goalsSv: ['Förstå det centrala ordförrådet', 'Öva en verklig servicesituation', 'Producera ett eget muntligt eller skriftligt svar'],
  })) satisfies IntegrationModule[],
} as const
