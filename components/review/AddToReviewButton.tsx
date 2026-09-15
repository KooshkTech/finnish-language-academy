'use client'

import { useState } from 'react'
import { addWordToReview } from '@/services/client-review'
import type { LearningLanguage } from '@/types/learning'

export function AddToReviewButton({ language, word, meaning }: { language: LearningLanguage; word: string; meaning: string }) {
  const [state, setState] = useState<'idle'|'saving'|'saved'|'error'>('idle')
  const label = language === 'sv' ? 'Lägg till repetition' : 'Lisää kertaukseen'
  return <button
    type="button"
    className="review-add-button"
    disabled={state === 'saving' || state === 'saved'}
    onClick={async (event) => {
      event.stopPropagation()
      setState('saving')
      try {
        await addWordToReview({ language, word, meaning })
        setState('saved')
      } catch {
        setState('error')
      }
    }}
  >
    {state === 'saving' ? (language === 'sv' ? 'Sparar…' : 'Tallennetaan…') : state === 'saved' ? (language === 'sv' ? 'Tillagd ✓' : 'Lisätty ✓') : state === 'error' ? (language === 'sv' ? 'Försök igen' : 'Yritä uudelleen') : `+ ${label}`}
  </button>
}

