'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export default function SignOutButton({ language = 'fi' }: { language?: 'fi' | 'sv' }) {
  const fi = language === 'fi'
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function signOut() {
    if (!isSupabaseConfigured()) {
      router.replace('/')
      return
    }
    setBusy(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } finally {
      router.replace('/')
      router.refresh()
    }
  }

  return <button type="button" onClick={() => void signOut()} disabled={busy} className="secondary-button">
    {busy ? (fi ? 'Kirjaudutaan ulos…' : 'Loggar ut…') : (fi ? 'Kirjaudu ulos' : 'Logga ut')}
  </button>
}

