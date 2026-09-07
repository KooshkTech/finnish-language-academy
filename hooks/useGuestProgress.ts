'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { GuestLearningState } from '@/types/learning'
import { emptyGuestState, loadGuestState, saveGuestState } from '@/services/guest-progress'

const EVENT = 'opiope:guest-progress-changed'
let cachedSerialized: string | null = null
let cachedState = emptyGuestState()
function getSnapshot() { if (typeof window === 'undefined') return cachedState; const state = loadGuestState(); const serialized = JSON.stringify(state); if (serialized !== cachedSerialized) { cachedSerialized = serialized; cachedState = state } return cachedState }
function subscribe(onChange: () => void) { if (typeof window === 'undefined') return () => undefined; window.addEventListener(EVENT, onChange); window.addEventListener('storage', onChange); return () => { window.removeEventListener(EVENT, onChange); window.removeEventListener('storage', onChange) } }
export function useGuestProgress() { const guestState = useSyncExternalStore(subscribe, getSnapshot, () => cachedState); const updateGuestState = useCallback((updater: (current: GuestLearningState) => GuestLearningState) => { const next = updater(loadGuestState()); saveGuestState(next); cachedState = next; cachedSerialized = JSON.stringify(next); window.dispatchEvent(new Event(EVENT)) }, []); return { guestState, updateGuestState, hydrated: typeof window !== 'undefined' } }
