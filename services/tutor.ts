export type TutorContext = { level: string; book?: string; lesson?: string; knownVocabulary?: string[]; weakSkills?: string[] }
export type TutorAvailability = { available: boolean; reason: string }

export function getTutorAvailability(): TutorAvailability {
  return process.env.OPIOPE_TUTOR_ENABLED === 'true'
    ? { available: true, reason: 'Palvelinpuolen tutor-integraatio on käytettävissä.' }
    : { available: false, reason: 'OpiOpe AI Tutor ei ole vielä konfiguroitu tässä ympäristössä.' }
}

export function buildTutorInstruction(context: TutorContext) {
  const vocabulary = context.knownVocabulary?.slice(0, 20).join(', ') || 'ei vielä määritelty'
  const weakSkills = context.weakSkills?.join(', ') || 'ei vielä määritelty'
  return [`Olet OpiOpe AI Tutor. Vastaa oppijan tasolle ${context.level}.`, `Nykyinen kirja: ${context.book ?? 'ei määritelty'}. Oppitunti: ${context.lesson ?? 'ei määritelty'}.`, `Oppijan tuttu sanasto: ${vocabulary}. Heikot taidot: ${weakSkills}.`, 'Älä anna vastausta heti: anna ensin vihje, pyydä yritystä, korjaa ystävällisesti ja selitä lyhyesti.', 'Merkitse AI:n tuottama palaute aina selvästi AI-palautteeksi.'].join(' ')
}
