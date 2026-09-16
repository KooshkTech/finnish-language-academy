export const learningLevels = [
  { id: 'a0', label: 'A0', title: 'Aloita nollasta', range: '0–10', description: 'Kirjaimet, äänteet, tervehdykset ja ensimmäiset arjen sanat.' },
  { id: 'a1', label: 'A1', title: 'Perusteet', range: '11–25', description: 'Selviydy tavallisissa arjen tilanteissa lyhyillä lauseilla.' },
  { id: 'a2', label: 'A2', title: 'Arjen kieli', range: '26–40', description: 'Keskustele tutuista aiheista ja ymmärrä tavallisia viestejä.' },
  { id: 'b1', label: 'B1', title: 'Itsenäinen käyttäjä', range: '41–55', description: 'Työ, opiskelu, asiointi ja pidemmät keskustelut.' },
  { id: 'b2', label: 'B2', title: 'Sujuva kieli', range: '56–70', description: 'Perustele, keskustele ja ymmärrä vaativampaa kieltä.' },
  { id: 'c1', label: 'C1', title: 'Edistynyt', range: '71–85', description: 'Tarkka, joustava ja ammatillinen kielenkäyttö.' },
  { id: 'c2', label: 'C2', title: 'Lähes äidinkielinen', range: '86–100', description: 'Vivahteet, tyyli, idiomit ja vaativa akateeminen kieli.' },
] as const

export type LearningLevelId = typeof learningLevels[number]['id']

export const levelSkills = [
  { slug: 'listening', label: 'Kuuntelu', description: 'Kuuntele ja ymmärrä' },
  { slug: 'reading', label: 'Lukeminen', description: 'Lue ja analysoi' },
  { slug: 'writing', label: 'Kirjoittaminen', description: 'Kirjoita selkeästi' },
  { slug: 'understanding', label: 'Ymmärtäminen', description: 'Kielioppi ja rakenteet' },
  { slug: 'vocabulary', label: 'Sanasto', description: 'Sanat ja SRS-kertaus' },
  { slug: 'speaking', label: 'Puhuminen', description: 'Ääntäminen ja puhe' },
  { slug: 'yki-test', label: 'YKI-testi', description: 'Koemuotoinen harjoittelu' },
] as const

export type LevelSkillSlug = typeof levelSkills[number]['slug']

export function getLearningLevel(id: string) {
  return learningLevels.find(level => level.id === id.toLowerCase())
}

export function isLevelSkill(value: string): value is LevelSkillSlug {
  return levelSkills.some(skill => skill.slug === value)
}

