import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.replace(/^Bearer\s+/i, '')
    if (!token) return json({ error: 'Unauthorized' }, 401)

    const url = Deno.env.get('SUPABASE_URL')!
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    if (!url || !anon || !serviceRole) return json({ error: 'Server configuration missing' }, 503)

    const authClient = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } })
    const { data: userData, error: userError } = await authClient.auth.getUser(token)
    if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401)

    const admin = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } })
    const userId = userData.user.id
    const body = await req.json().catch(() => ({}))
    const action = body.action

    const tables: Array<[string, string]> = [
      ['profiles', 'id'],
      ['user_progress', 'user_id'],
      ['placement_results', 'user_id'],
      ['lesson_progress', 'user_id'],
      ['exercise_attempts', 'user_id'],
      ['vocabulary_progress', 'user_id'],
      ['daily_activity', 'user_id'],
    ]

    if (action === 'export') {
      const data: Record<string, unknown> = { account: { id: userId, email: userData.user.email, created_at: userData.user.created_at } }
      for (const [table, column] of tables) {
        const { data: rows, error } = await admin.from(table).select('*').eq(column, userId)
        if (error) throw new Error(`${table}: ${error.message}`)
        data[table] = rows
      }
      return json({ data }, 200)
    }

    if (action === 'delete') {
      // Delete learning rows explicitly before deleting Auth. FK cascades may also apply,
      // but explicit deletion makes the intended scope auditable.
      for (const [table, column] of [...tables].reverse()) {
        const { error } = await admin.from(table).delete().eq(column, userId)
        if (error) throw new Error(`${table}: ${error.message}`)
      }
      const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
      if (deleteError) throw deleteError
      return json({ deleted: true }, 200)
    }

    return json({ error: 'Unsupported action' }, 400)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Unexpected error' }, 500)
  }
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
