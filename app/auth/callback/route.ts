import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeInternalPath } from '@/lib/security/navigation.mjs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = safeInternalPath(url.searchParams.get('next'))
  const supabase = await createClient()

  if (!code || !supabase) {
    return NextResponse.redirect(new URL('/?auth=configuration', request.url))
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL('/?auth=verification-failed', request.url))
  }

  return NextResponse.redirect(new URL(next, request.url))
}
