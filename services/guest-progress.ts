import type { GuestLearningState } from '@/types/learning'

export const GUEST_STORAGE_KEY = 'opiope_guest_learning_v1'
export const emptyGuestState = (): GuestLearningState => ({ version: 1, placementResult: null, recommendedLesson: null, lessonProgress: {}, grammarAttempts: [], vocabularyProgress: {} })
export function loadGuestState(): GuestLearningState { if (typeof window === 'undefined') return emptyGuestState(); try { const parsed = JSON.parse(window.localStorage.getItem(GUEST_STORAGE_KEY) ?? '') as GuestLearningState; return parsed?.version === 1 ? parsed : emptyGuestState() } catch { return emptyGuestState() } }
export function saveGuestState(state: GuestLearningState) { if (typeof window !== 'undefined') window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(state)) }
export function clearGuestState() { if (typeof window !== 'undefined') window.localStorage.removeItem(GUEST_STORAGE_KEY) }
export function hasMeaningfulGuestState(state: GuestLearningState) { return Boolean(state.placementResult || state.recommendedLesson || Object.keys(state.lessonProgress).length || state.grammarAttempts.length || Object.keys(state.vocabularyProgress).length) }

export const emptyGuestState = (): GuestLearningState => ({
  version: 1,
  placementResult: null,
  recommendedLesson: null,
  lessonProgress: {},
  grammarAttempts: [],
  vocabularyProgress: {},
})

export function loadGuestState(): GuestLearningState {
  if (typeof window === 'undefined') return emptyGuestState()
  try {
    const raw = window.localStorage.getItem(GUEST_STORAGE_KEY)
    if (!raw) return emptyGuestState()
    const parsed = JSON.parse(raw) as GuestLearningState
    return parsed?.version === 1 ? parsed : emptyGuestState()
  } catch {
    return emptyGuestState()
  }
}

export function saveGuestState(state: GuestLearningState) {
  if (typeof window !== 'undefined') window.localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(state))
}

export function clearGuestState() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(GUEST_STORAGE_KEY)
}

export function hasMeaningfulGuestState(state: GuestLearningState) {
  return Boolean(state.placementResult || Object.keys(state.lessonProgress).length || state.grammarAttempts.length || Object.keys(state.vocabularyProgress).length)
}
