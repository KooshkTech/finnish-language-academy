# OpiOpe V24.4.3 — Supabase account setup

The application contains real Supabase Auth integration. It intentionally refuses to pretend that registration works when Supabase is not configured.

## 1. Create/configure the Supabase project

Copy `.env.example` to `.env.local` and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

The service-role key is server-only. Never expose it in a `NEXT_PUBLIC_*` variable and never commit `.env.local`.

## 2. Apply migrations

Using Supabase CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Or apply the SQL files in `supabase/migrations/` in timestamp order through the Supabase SQL editor.

## 3. Configure Auth redirect URLs

In Supabase Authentication > URL Configuration set the production Site URL to the real HTTPS domain, and add development redirects such as:

```text
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
```

For LAN testing, add the exact current LAN callback URL only if needed. Do not use a LAN HTTP address as the production Site URL.

## 4. Teacher approval model

A teacher signup creates:

- an Auth user
- `profiles.role = student`
- `profiles.account_mode = teacher_pending`
- a `teacher_applications` row with `status = pending`

The user confirms email and lands on `/teacher/application`.

An existing admin opens `/admin/teachers` and approves the application. Approval changes:

- `profiles.role` -> `teacher`
- `profiles.account_mode` -> `teacher`
- `teacher_access.status` -> `active`
- `teacher_access.mfa_required` -> `true`
- `teacher_applications.status` -> `approved`

The teacher must then satisfy the existing MFA flow before entering the full teacher workspace.

## 5. Bootstrap the first admin

Do not add a public "make me admin" UI. Create the first admin only from the trusted Supabase SQL editor after you know the exact user UUID:

```sql
update public.profiles
set role = 'admin', updated_at = now()
where id = 'EXACT_AUTH_USER_UUID';
```

Verify the UUID carefully before executing it.

## 6. Test sequence

1. Register a student -> verify email -> sign in -> `/student`.
2. Register a free user -> verify email -> sign in -> selected FI/SV level hub.
3. Register a teacher -> verify email -> `/teacher/application` shows pending.
4. Sign in as admin -> `/admin/teachers` -> approve teacher.
5. Teacher signs in -> MFA setup/check -> `/teacher`.
6. Verify an unapproved teacher cannot enter `/teacher`.
7. Verify a student cannot access another student's private progress.

