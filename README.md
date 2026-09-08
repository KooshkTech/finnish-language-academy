# OpiOpe — V9 Code Quality Clean

OpiOpe is a Finnish-first learning platform for practical Finnish, YKI preparation, grammar and vocabulary. The app supports guest-first learning and optional Supabase-backed accounts.

## Included

- Guest placement test and local progress (`opiope_guest_learning_v1`)
- Grammar attempts and vocabulary SRS
- Supabase auth and authenticated progress when configured
- Guest-safe fallback when Supabase environment variables are missing
- GDPR consent-gated analytics
- `/privacy`, `/cookies`, `/terms`, and `/account/privacy`
- Authenticated account data export/deletion architecture via Supabase Edge Function
- SEO metadata, sitemap, robots, and PWA manifest
- V9 React/TypeScript/ESLint cleanup

## Run locally

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and set real values when using cloud accounts:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CONTROLLER_NAME=YOUR_LEGAL_COMPANY_OR_CONTROLLER_NAME
NEXT_PUBLIC_PRIVACY_EMAIL=privacy@example.com
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser/public variables.

## Supabase

Apply:

`supabase/migrations/20260906170000_opiope_v7_learning_core.sql`

Deploy:

`supabase/functions/account-data/index.ts`

The public/guest app must still work when Supabase is not configured; login and cloud-only actions should show truthful unavailable/configuration-required states.

## Production notes

Before launch, set the real legal controller name/privacy email, document subprocessors and retention, test RLS between two users, and verify account export/deletion against the deployed Edge Function.

V9 lint and typecheck were cleaned to pass. A full production build should still be run on the deployment machine because the earlier build environment could not download the Linux Next.js SWC dependency from npm.
