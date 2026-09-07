'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { GuestLearningState } from '@/types/learning'
import { emptyGuestState, loadGuestState, saveGuestState } from '@/services/guest-progress'

const GUEST_EVENT = 'opiope:guest-progress-changed'
let cachedSerialized: string | null = null
let cachedState: GuestLearningState = emptyGuestState()

function getSnapshot(): GuestLearningState {
  if (typeof window === 'undefined') return cachedState
  const state = loadGuestState()
  const serialized = JSON.stringify(state)
  if (serialized !== cachedSerialized) {
    cachedSerialized = serialized
    cachedState = state
  }
  return cachedState
}

function getServerSnapshot(): GuestLearningState {
  return cachedState
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => undefined
  const handleChange = () => onStoreChange()
  window.addEventListener(GUEST_EVENT, handleChange)
  window.addEventListener('storage', handleChange)
  return () => {
    window.removeEventListener(GUEST_EVENT, handleChange)
    window.removeEventListener('storage', handleChange)
  }
}

export function useGuestProgress() {
  const guestState = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const updateGuestState = useCallback((updater: (current: GuestLearningState) => GuestLearningState) => {
    const current = loadGuestState()
    const next = updater(current)
    saveGuestState(next)
    cachedSerialized = JSON.stringify(next)
    cachedState = next
    window.dispatchEvent(new Event(GUEST_EVENT))
  }, [])

  return { guestState, updateGuestState, hydrated: typeof window !== 'undefined' }
}
