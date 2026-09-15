import type { LearningRoute, SkillModule, WeeklyTask } from "@/types/classroom"

export const navModules: Array<{ href: LearningRoute; label: string; short: string }> = [
  { href: "/dictionary", label: "Sanakirja", short: "Sanakirja" },
  { href: "/voice-lab", label: "Äänilaboratorio", short: "Ääni" },
  { href: "/arcade", label: "Pelaa & opi", short: "Pelit" },
  { href: "/listening", label: "Kuuntelu", short: "Kuuntelu" },
  { href: "/reading", label: "Lukeminen", short: "Lukeminen" },
  { href: "/writing", label: "Kirjoittaminen", short: "Kirjoittaminen" },
  { href: "/speaking", label: "Puhuminen", short: "Puhuminen" },
  { href: "/understanding", label: "Ymmärtäminen", short: "Kielioppi" },
  { href: "/vocabulary", label: "Sanasto", short: "Sanasto" },
  { href: "/yki-test", label: "YKI", short: "YKI" },
  { href: "/ai-tutor", label: "AI-opettaja", short: "AI-opettaja" },
]

const sharedTest = (topic: string) => [{
  question: `Mikä vaihtoehto sopii parhaiten aiheeseen: ${topic}?`,
  options: ["Oikea käyttötilanne", "Satunnainen vastaus", "Ei liity aiheeseen"],
  answer: "Oikea käyttötilanne",
  explanation: "Arviointi perustuu siihen, tunnistatko opitun asian oikeassa yhteydessä.",
}]

export const skillModules: Record<string, SkillModule> = {
  listening: { route: "/listening", title: "Kuuntelu", subtitle: "Ymmärrä oikeaa suomea eri nopeuksilla ja tilanteissa.", levelRange: "A0–C2", learn: ["Kuuntele ydinsanoja ennen yksityiskohtia.", "Vertaa kirjakieltä ja puhekieltä.", "Toista kohta hitaammin vain tarvittaessa."], examples: [{source:"Minä menen kauppaan.",target:"Mä meen kauppaan.",note:"Puhekielessä minä → mä ja menen → meen."}], blackboard:[{type:"compare",title:"Rekisteri",leftLabel:"Kirjakieli",left:"Minä menen kauppaan.",rightLabel:"Puhekieli",right:"Mä meen kauppaan."}], flashcards:[{front:"mä meen",back:"minä menen"},{front:"ootko?",back:"oletko?"}], test: sharedTest("kuullunymmärtäminen") },
  reading: { route: "/reading", title: "Lukeminen", subtitle: "Lue viestejä, uutistyylisiä tekstejä ja työelämän kieltä.", levelRange: "A0–C2", learn:["Etsi tekstin pääajatus.","Päättele merkitys kontekstista.","Tunnista sidossanat ja viittaukset."], examples:[{source:"Bussi on myöhässä.",target:"Bussi on myöhässä."}], blackboard:[{type:"note",title:"Lukustrategia",body:"Otsikko → pääajatus → avainsanat → yksityiskohdat."}], flashcards:[{front:"myöhässä",back:"myöhässä"},{front:"aikataulu",back:"aikataulu"}], test: sharedTest("lukeminen") },
  writing: { route: "/writing", title: "Kirjoittaminen", subtitle: "Kirjoita viestejä, hakemuksia ja tekstejä selkeällä rakenteella.", levelRange:"A0–C2", learn:["Aloita tarkoituksesta.","Jäsennä teksti kappaleisiin.","Tarkista verbimuodot ja sijamuodot."], examples:[{source:"Hei, haluaisin siirtää ajan.",target:"Hei, haluaisin siirtää ajan."}], blackboard:[{type:"table",title:"Hyvä viesti",rows:[["1","Tervehdys"],["2","Asia"],["3","Toivottu ratkaisu"],["4","Lopetus"]]}], flashcards:[{front:"haluaisin",back:"haluaisin"},{front:"ystävällisin terveisin",back:"ystävällisin terveisin"}], test: sharedTest("kirjoittaminen") },
  speaking: { route: "/speaking", title: "Puhuminen", subtitle: "Harjoittele ääntämistä, rytmiä ja keskustelutilanteita.", levelRange:"A0–C2", learn:["Puhu ensin hitaasti ja selkeästi.","Kiinnitä huomiota vokaalien ja konsonanttien pituuteen.","Toista sama lause luonnollisemmalla rytmillä."], examples:[{source:"tuli / tuuli",target:"tuli / tuuli",note:"Vokaalin pituus muuttaa merkityksen."}], blackboard:[{type:"compare",title:"Pituusero",leftLabel:"Lyhyt",left:"tuli",rightLabel:"Pitkä",right:"tuuli"}], flashcards:[{front:"tuli",back:"tuli"},{front:"tuuli",back:"tuuli"}], test: sharedTest("puhuminen") },
  understanding: { route: "/understanding", title: "Ymmärtäminen", subtitle: "Kielioppi, rakenteet, sijamuodot ja puhekielen logiikka.", levelRange:"A0–C2", learn:["Muoto kertoo sanan tehtävän.","Suomessa sijamuoto korvaa usein preposition.","Konteksti ratkaisee objektin ja partitiivin."], examples:[{source:"Juon kahvia.",target:"Juon kahvia.",note:"Partitiivi: ainetta tai keskeneräinen toiminta."}], blackboard:[{type:"table",title:"Sijamuoto",rows:[["Nominatiivi","talo"],["Genetiivi","talon"],["Partitiivi","taloa"],["Inessiivi","talossa"],["Elatiivi","talosta"],["Illatiivi","taloon"]]}], flashcards:[{front:"talossa",back:"talossa"},{front:"talosta",back:"talosta"}], test: sharedTest("kielioppi") },
  vocabulary: { route: "/vocabulary", title: "Sanasto", subtitle: "Muista sanat pitkäkestoisesti ja käytä niitä oikeissa yhteyksissä.", levelRange:"A0–C2", learn:["Muista sana lauseessa.","Kertaa ennen unohtamista.","Vaihtele tunnistamista ja tuottamista."], examples:[{source:"juurtua",target:"juurtua",note:"Täällä on hyvä juurtua."}], blackboard:[{type:"note",title:"SRS",body:"Uusi → oppiminen → kertaus → hallittu. Seuraava kertaus riippuu muistamisen laadusta."}], flashcards:[{front:"juurtua",back:"juurtua"},{front:"pärjätä",back:"pärjätä"}], test: sharedTest("sanasto") },
  "yki-test": { route: "/yki-test", title: "YKI-harjoittelu", subtitle: "Harjoittele koemuotoisia tehtäviä ilman väitettä virallisesta pistemäärästä.", levelRange:"A1–C2", learn:["Harjoittele ajankäyttöä.","Vastaa tehtävän tarkoitukseen.","Arvioi ymmärrettävyyttä ja tehtävän täyttymistä."], examples:[{source:"Kirjoita viesti vuokranantajalle.",target:"Kirjoita viesti vuokranantajalle."}], blackboard:[{type:"note",title:"Huomio",body:"OpiOpe ei ole virallinen YKI-järjestäjä eikä harjoitustulos ole virallinen YKI-arvio."}], flashcards:[{front:"perustele",back:"perustele"},{front:"kuvaile",back:"kuvaile"}], test: sharedTest("YKI-harjoittelu") },
  "ai-tutor": { route: "/ai-tutor", title: "AI-opettaja", subtitle: "Kysy miksi, pyydä esimerkkejä ja harjoittele keskustelua omalla tasollasi.", levelRange:"A0–C2", learn:["Kysy tarkka kysymys.","Pyydä opettajaa vertaamaan kirjakieltä ja puhekieltä.","Pyydä lisäharjoitus vasta selityksen jälkeen."], examples:[{source:"Miksi tässä käytetään partitiivia?",target:"Selitä kieliopillinen syy, älä vain vastausta."}], blackboard:[{type:"compare",title:"Esimerkki",leftLabel:"Kirjakieli",left:"Minä olen väsynyt.",rightLabel:"Puhekieli",right:"Mä oon väsynyt."}], flashcards:[{front:"miksi?",back:"miksi?"},{front:"selitä",back:"selitä"}], test: sharedTest("AI-ohjattu oppiminen") },
}

export const weeklyTemplate: WeeklyTask[] = [
  { day:"MON", assignedModule:"/reading", title:"Lukeminen + sanastokertaus", minutes:25, requiredScore:80 },
  { day:"TUE", assignedModule:"/listening", title:"Kuuntelu + ääntämisharjoitus", minutes:25, requiredScore:80 },
  { day:"WED", assignedModule:"/understanding", title:"Kielioppi + Blackboard-syventäminen", minutes:30, requiredScore:80 },
  { day:"THU", assignedModule:"/writing", title:"Kirjoitustehtävä + palaute", minutes:30 },
  { day:"FRI", assignedModule:"/yki-test", title:"YKI / sekaharjoitus", minutes:35, requiredScore:80 },
  { day:"SAT", assignedModule:"/vocabulary", title:"Viikkokertaus ja kotitehtävä", minutes:30, requiredScore:80 },
  { day:"SUN", assignedModule:"/ai-tutor", title:"Lepo tai vapaaehtoinen kertaus", minutes:15 },
]

