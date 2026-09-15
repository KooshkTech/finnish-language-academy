export interface LiveQuizQuestion {
  id: string
  questionText: string
  options: [string,string,string,string]
  correctOptionIndex: number
  explanation: string
}

export const liveQuizQuestions: LiveQuizQuestion[] = [
  { id:"q1", questionText:"Mikä on puhekielinen vastine: Minä olen väsynyt?", options:["Mä oon väsynyt.","Minä väsyn.","Mä olen väsyt.","Oonko minä?"], correctOptionIndex:0, explanation:"Puhekielessä minä → mä ja olen → oon." },
  { id:"q2", questionText:"Mikä sijamuoto on sanassa talossa?", options:["Elatiivi","Inessiivi","Illatiivi","Allatiivi"], correctOptionIndex:1, explanation:"-ssa/-ssä ilmaisee usein inessiiviä: jossakin." },
  { id:"q3", questionText:"Välj rätt svensk artikel: ___ jobb", options:["en","ett","den","de"], correctOptionIndex:1, explanation:"jobb is an ett-word: ett jobb." },
]

