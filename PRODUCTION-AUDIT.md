# Finnish Language Academy — production audit

## Status

- **PASS** — Responsive public homepage with semantic sections, mobile navigation, course filters, FAQ disclosure, placement-test flow, newsletter form state, and reduced-motion support.
- **PASS** — Metadata, Open Graph/Twitter descriptions, Finnish document language, viewport theme color, robots, and sitemap are present.
- **PASS** — Supabase email/password auth plumbing, callback route, session proxy, profiles, learning attempts, and vocabulary review tables are configured.
- **PASS** — Owner-only RLS policies protect profile, attempt, and vocabulary rows.
- **PARTIAL** — Onboarding, adaptive dashboard, vocabulary SRS interaction, course content, and YKI entry point are implemented; full lesson library and real audio are still content work.
- **NOT CONFIGURED** — Payments, AI tutor, speech scoring, transactional email, and production rate limiting require additional provider/server implementation.

## Verification

Run `pnpm build` (or `npm run build`) to validate the Next.js production bundle. Set `NEXT_PUBLIC_SITE_URL` before deployment to override the default canonical URL used by sitemap and metadata.

## Follow-up work for production

1. Expand the Supabase content model for lessons, YKI results, grammar weaknesses, and listening/writing submissions.
2. Add server-side auth route handling and rate limiting for credential flows.
3. Configure Stripe for subscriptions and validate prices server-side.
4. Connect AI Gateway and speech/audio services only behind server routes with quotas and abuse protection.
5. Replace newsletter UI state with a server action and double opt-in email provider.
6. Add automated browser, accessibility, and end-to-end tests for placement flow and responsive navigation.
