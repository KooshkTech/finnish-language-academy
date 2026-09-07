'use client'

import { useCallback, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { DashboardData } from '@/types/learning'
import { loadDashboardData } from '@/services/progress'

export function useLearnerProgress(supabase: SupabaseClient, userId?: string) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [progressLoading, setProgressLoading] = useState(false)
  const [progressError, setProgressError] = useState('')

  const refreshProgress = useCallback(async () => {
    if (!userId) {
      setDashboardData(null)
      return
    }
    setProgressLoading(true)
    setProgressError('')
    try {
      setDashboardData(await loadDashboardData(supabase, userId))
    } catch {
      setProgressError('Edistymisen lataaminen epäonnistui. Yritä uudelleen.')
    } finally {
      setProgressLoading(false)
    }
  }, [supabase, userId])

  return { dashboardData, progressLoading, progressError, refreshProgress, setDashboardData }
}
