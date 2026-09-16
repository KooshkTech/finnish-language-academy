/** Choice labels are exact: case may be the language distinction being taught. */
export function isAcademyAnswerCorrect(question, answer) {
  if (question.options) return question.options.includes(answer) && answer === question.answer
  const normalise = value => value.trim().toLocaleLowerCase('fi-FI')
  return normalise(answer) === normalise(question.answer) ||
    (question.answer.includes('/') && question.answer.split('/').some(part => normalise(part) === normalise(answer)))
}
