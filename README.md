# OpiOpe — V24.23.2

V24.23.2 adds the public lesson sitemap, localized course metadata and explicit
production indexing controls. See [RELEASE-V24.23.2-SEO.md](RELEASE-V24.23.2-SEO.md).
Indexing is disabled by default; configure your reviewed production origin
before enabling it. The V24.22.1 design remains unchanged.

V24.23.1 restores the V24.22.1 design, removes English support from the 70
new Finnish lessons, and adds separate teacher/student draft downloads.
See [RELEASE-V24.23.1.md](RELEASE-V24.23.1.md) for the current release status.
This is a local-test candidate, not yet a verified public-production release.

V24.23 adds 70 original Finnish lessons, ten per level A0–C2. Start at
`/learn/academy`. See [RELEASE-V24.23.md](RELEASE-V24.23.md) for scope, validation,
installation and the limitations of synthetic audio and instructional level labels.

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
npm run audit:class-sessions
npm run audit:community
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

Run `npm run verify:release` for the current release gate, and repeat validation
on the deployment machine. Account configuration and device audio still require
separate real-environment testing.
