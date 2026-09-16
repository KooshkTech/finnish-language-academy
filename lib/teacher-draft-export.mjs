/** Student export is an allowlist: no answers, explanations or teacher notes. */
export function studentWorksheet(draft) {
  const sv = draft.language === 'sv'
  const heading = sv ? 'Elevens arbetsblad' : 'Opiskelijan tehtävämoniste'
  const exercises = sv ? 'Övningar' : 'Harjoitukset'
  const test = sv ? 'Repetition' : 'Kertaus'
  const render = items => items.map((item, index) => [
    `${index + 1}. ${item.prompt}`,
    ...(item.options || []).map((option, optionIndex) => `  ${optionIndex + 1}) ${option}`),
    sv ? 'Svar: ____________________' : 'Vastaus: ____________________'
  ].join('\n')).join('\n\n')
  return [heading, draft.title, `${draft.language.toUpperCase()} · ${draft.cefrLevel}`,
    draft.objective, ...draft.lesson.theory, ...draft.lesson.examples.map(item => item.target),
    exercises, render(draft.exercises), test, render(draft.test)].join('\n\n')
}

export function teacherAnswerKey(draft) {
  const sv = draft.language === 'sv'
  const render = items => items.map((item, index) => `${index + 1}. ${item.prompt}\n${sv ? 'Svar' : 'Vastaus'}: ${item.answer}\n${item.explanation}`).join('\n\n')
  return [sv ? 'Lärarens facit — dela inte med eleverna' : 'Opettajan vastausavain — ei opiskelijoille',
    draft.title, sv ? 'Övningar' : 'Harjoitukset', render(draft.exercises), sv ? 'Repetition' : 'Kertaus', render(draft.test)].join('\n\n')
}
