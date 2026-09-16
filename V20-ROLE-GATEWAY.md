# OpiOpe V20 — Role Gateway

The first application screen now offers three entry modes:

1. Teacher — username + password required; teacher role is verified server-side.
2. Student — username + password required; student role is verified server-side when the service role is available.
3. Free user — no account required; opens the level-first learner experience directly at `/learn`.

The previous level-first homepage has been preserved at `/learn` rather than deleted.

## Username authentication

Supabase Auth still owns password verification. `profiles.username` is only a login alias. The server resolves the alias to the Supabase user and then signs in through Supabase Auth. Teacher authorization is never trusted from client UI state.

Required production configuration for username aliases and teacher verification:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- migration `20260909070000_role_gateway.sql`

Never expose the service-role key to the browser.

