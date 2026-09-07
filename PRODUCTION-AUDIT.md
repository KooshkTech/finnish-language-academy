# OpiOpe V9 — Production Audit

Audit date: 2026-09-07

## Implemented

- Next.js 16 / React 19 / TypeScript structure.
- Valid manifest icon purpose (`maskable`).
- Guest-safe Supabase middleware/server behavior when public Supabase env values are missing.
- Guest placement, grammar and vocabulary progress.
- Supabase schema migration with owner-scoped RLS policies.
- Consent-gated optional Vercel Analytics.
- Finnish privacy, cookie and terms pages.
- Account data export/deletion architecture through a server-side Supabase Edge Function.
- SEO metadata, sitemap and robots configuration.
- Homepage first-viewport polish with responsive H1, clear CTAs, useful learning preview and mobile layout.
- V9 code-quality cleanup: React 19 effect/state issues and explicit service-layer `any` usage addressed.

## Quality gates

The V9 cleanup was prepared to pass:

```bash
npm run lint
npm run typecheck
```

Run the complete release gate on the deployment machine:

```bash
npm install
npm run lint
npm run typecheck
npm run build
```

The previous sandbox could not finish the Next production build because the Linux SWC package download failed with an npm network/DNS error. Do not treat that environment limitation as a production build pass.

## Required before launch

- Configure real Supabase public URL/key if accounts/cloud persistence are enabled.
- Apply the SQL migration.
- Deploy and test the `account-data` Edge Function.
- Set the real legal controller name and privacy email.
- Document actual vendors, retention and international transfers.
- Browser-test guest persistence and authenticated logout/login persistence.
- Verify RLS isolation with at least two users.

## Truthful unavailable states

AI tutor, translation, speech scoring, payment and official certification must not be represented as live until real providers and secure server-side integrations exist.

Status: **code-ready for local/release verification; production configuration and live acceptance tests remain required.**
