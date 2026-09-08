import type { SupabaseClient } from '@supabase/supabase-js'

export function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY))
}

export async function signIn(supabase: SupabaseClient, email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(supabase: SupabaseClient, email: string, password: string) {
  const emailRedirectTo = process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`
  return supabase.auth.signUp({ email, password, options: { emailRedirectTo } })
}
