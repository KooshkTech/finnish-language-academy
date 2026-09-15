import type { SkillModule } from '@/types/classroom'
import type { LearningLevelId } from '@/data/levels'

type SwedishSkill = 'listening' | 'reading' | 'writing' | 'speaking' | 'understanding' | 'vocabulary'

type LevelSeed = {
  theme: string
  grammar: string
  register: string
  words: Array<[string, string]>
  examples: string[]
}

const levels: Record<LearningLevelId, LevelSeed> = {
  a0: {
    theme: 'Hälsningar, namn och de allra första vardagsfraserna',
    grammar: 'jag/du, verbet vara och mycket enkel ordföljd',
    register: 'tydligt standardspråk och vanliga hälsningar',
    words: [['hej','en vanlig hälsning'],['tack','ett artigt ord när någon hjälper dig'],['namn','det som en person heter'],['ja','ett positivt svar'],['nej','ett negativt svar'],['hem','platsen där man bor']],
    examples: ['Hej! Jag heter Sara.','Tack så mycket.','Jag bor i Vanda.'],
  },
  a1: {
    theme: 'Vardagsrutiner, tid, butik och enkla samtal',
    grammar: 'presens, frågor, negation och grundläggande ordföljd',
    register: 'enkelt standardspråk med vanliga vardagsuttryck',
    words: [['morgon','början av dagen'],['busshållplats','plats där bussen stannar'],['inköpslista','lista över saker man ska köpa'],['arbete','det man gör på jobbet'],['butik','plats där man köper varor'],['tid','när något händer']],
    examples: ['Jag går till jobbet på morgonen.','Bussen stannar vid busshållplatsen.','Jag skriver en inköpslista före butiken.'],
  },
  a2: {
    theme: 'Erfarenheter, ärenden, planer och händelser i vardagen',
    grammar: 'preteritum, perfekt, bisatser och vanliga prepositioner',
    register: 'naturligt vardagsspråk i bekanta situationer',
    words: [['besök','när man går till en person eller plats'],['tidbokning','en reserverad tid'],['förra veckan','veckan före den här veckan'],['plan','något man tänker göra'],['problem','något som behöver lösas'],['lösning','ett sätt att lösa ett problem']],
    examples: ['Jag bokade en tid förra veckan.','Vi har redan löst problemet.','I morgon ska jag besöka biblioteket.'],
  },
  b1: {
    theme: 'Arbete, studier, service och självständig kommunikation',
    grammar: 'perfekt, konditionalis, passiv och sambandsord',
    register: 'sakligt vardags- och arbetsspråk',
    words: [['ansökan','en formell begäran eller handling'],['möte','när flera personer träffas för att diskutera'],['erfarenhet','kunskap man får genom att göra något'],['överenskommelse','något parter har kommit överens om'],['orsak','varför något händer'],['resultat','det som blir följden av en aktivitet']],
    examples: ['Jag skickade ansökan i går.','Om jag hade mer tid skulle jag studera mer.','På mötet diskuterades nästa steg.'],
  },
  b2: {
    theme: 'Argumentation, nyheter, möten och mer krävande texter',
    grammar: 'partiklar, varierade bisatser, passiv och nyanserad satsbindning',
    register: 'neutralt, formellt och informellt språk efter situation',
    words: [['ståndpunkt','en åsikt i en fråga'],['konsekvens','det som följer av något'],['förutsättning','något som måste finnas för att något ska vara möjligt'],['bedömning','en värdering av något'],['påstående','något som någon säger är sant'],['källa','varifrån information kommer']],
    examples: ['Min ståndpunkt bygger på två huvudargument.','En möjlig konsekvens är högre kostnader.','Källan bör bedömas innan informationen används.'],
  },
  c1: {
    theme: 'Professionellt, akademiskt och nyanserat språk',
    grammar: 'komplexa bisatser, nominalisering och stilistiska val',
    register: 'precis kontroll av ton, artighet och texttyp',
    words: [['förhållningssätt','sättet man ser på eller hanterar något'],['avvägning','balansering mellan olika behov'],['tillvägagångssätt','metoden man använder'],['förankring','stöd och acceptans i en grupp'],['förtydligande','något som gör ett budskap tydligare'],['resonemang','en sammanhängande tankegång']],
    examples: ['Ett mer nyanserat förhållningssätt kräver en tydlig avvägning.','Resonemanget behöver förankras i tillförlitliga källor.','Jag vill göra ett förtydligande innan vi går vidare.'],
  },
  c2: {
    theme: 'Idiomatisk precision, retorik, stilskiften och subtila nyanser',
    grammar: 'avancerad pragmatik, ellips, idiom och komplex informationsstruktur',
    register: 'säkra och medvetna stilskiften mellan olika sammanhang',
    words: [['underförstådd','något som antyds utan att sägas direkt'],['träffsäker','mycket precis och väl anpassad'],['brasklapp','en reservation eller försiktig begränsning'],['kärnfråga','den viktigaste frågan i ett sammanhang'],['nyansskillnad','en liten men betydelsefull skillnad i ton eller mening'],['retorik','sätt att påverka genom språk']],
    examples: ['Det underförstådda budskapet är minst lika viktigt som det uttalade.','Formuleringen är träffsäker men innehåller en tydlig brasklapp.','Talaren återvänder skickligt till kärnfrågan.'],
  },
}

const skillMeta: Record<SwedishSkill, { label: string; goal: string; instruction: string }> = {
  listening: { label: 'Lyssna', goal: 'Förstå huvudbudskap, nyckelord och viktiga detaljer.', instruction: 'Läs repliken högt eller använd svensk talsyntes och lyssna efter nyckelorden.' },
  reading: { label: 'Läsa', goal: 'Förstå textens innehåll, struktur och syfte.', instruction: 'Läs texten en gång för helheten och en gång för detaljerna.' },
  writing: { label: 'Skriva', goal: 'Formulera tydliga och nivåanpassade meningar och texter.', instruction: 'Skriv en egen version med samma struktur men med dina egna uppgifter.' },
  speaking: { label: 'Tala', goal: 'Uttryck dig muntligt med tydlig struktur och lämpligt ordförråd.', instruction: 'Säg exemplen högt och bygg sedan ett eget svar med samma modell.' },
  understanding: { label: 'Grammatik', goal: 'Förstå hur ord, ordföljd och grammatiska strukturer fungerar.', instruction: 'Jämför exemplen och identifiera den grammatiska formen.' },
  vocabulary: { label: 'Ordförråd', goal: 'Lär dig ord genom svenska definitioner, exempel och sammanhang.', instruction: 'Förklara ordet med egna svenska ord och använd det i en ny mening.' },
}

const routeBySkill: Record<SwedishSkill, SkillModule['route']> = {
  listening: '/listening', reading: '/reading', writing: '/writing', speaking: '/speaking',
  understanding: '/understanding', vocabulary: '/vocabulary',
}

function moduleFor(level: LearningLevelId, skill: SwedishSkill): SkillModule {
  const seed = levels[level]
  const meta = skillMeta[skill]
  const [first, second, third] = seed.words
  const examples = seed.examples.map((source, index) => ({
    source,
    target: index === 0 ? meta.instruction : index === 1 ? seed.grammar : seed.register,
  }))
  const flashcards = seed.words.slice(0, 5).map(([front, back]) => ({ front, back }))
  const questions = [
    {
      question: `Vilket ord hör tydligt till temat “${seed.theme}”?`,
      options: [first[0], 'slumpmässigt', 'orelaterat'],
      answer: first[0],
      explanation: `${first[0]} ingår i nivåns centrala ordförråd: ${first[1]}.`,
    },
    {
      question: `Vilken förklaring passar bäst till ordet “${second[0]}”?`,
      options: [second[1], third[1], 'ingen av förklaringarna'],
      answer: second[1],
      explanation: `${second[0]} betyder här: ${second[1]}.`,
    },
    {
      question: 'Vilken mening är ett exempel från den här lektionen?',
      options: [seed.examples[0], 'Den här meningen hör till ett helt annat tema.', 'Inget exempel används i lektionen.'],
      answer: seed.examples[0],
      explanation: 'Meningen används som modell i den här lektionen.',
    },
  ]
  return {
    route: routeBySkill[skill],
    title: `${meta.label} · ${seed.theme}`,
    subtitle: `${meta.goal} Nivå ${level.toUpperCase()}.`,
    levelRange: level.toUpperCase(),
    learn: [meta.goal, meta.instruction, `Fokus på grammatik: ${seed.grammar}.`],
    examples,
    flashcards,
    practice: questions.slice(0, 2),
    test: questions,
    blackboard: [
      { type: 'note', title: `${level.toUpperCase()} · dagens mål`, body: `${seed.theme}. ${meta.goal}` },
      { type: 'compare', title: 'Modellexempel', leftLabel: 'Svenska', left: seed.examples[0], rightLabel: 'Fokus', right: meta.instruction },
      { type: 'table', title: 'Kom ihåg', rows: [[seed.grammar, 'Grammatik'], [seed.register, 'Register'], [first[0], first[1]]] },
    ],
  }
}

export function getSwedishLevelSkillModule(level: LearningLevelId, skill: SwedishSkill) {
  return moduleFor(level, skill)
}

export function isSwedishSkill(value: string): value is SwedishSkill {
  return value in skillMeta
}

