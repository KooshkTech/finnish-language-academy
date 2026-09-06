# Finnish Language Academy — production audit

## Status

- **PASS** — Responsive public homepage with semantic sections, mobile navigation, course filters, FAQ disclosure, placement-test flow, newsletter form state, and reduced-motion support.
- **PASS** — Metadata, Open Graph/Twitter descriptions, Finnish document language, viewport theme color, robots, and sitemap are present.
- **PASS** — No fake AI, database, auth, speech, audio, or payment success states are shown.
- **PARTIAL** — Course content is typed in-memory content for the public prototype; it is not connected to a CMS or database.
- **NOT CONFIGURED** — Authentication, subscriptions, AI tutor, speech scoring, persistent progress, transactional email, and real audio require providers and server-side implementation.

## Verification

Run `pnpm build` (or `npm run build`) to validate the Next.js production bundle. Set `NEXT_PUBLIC_SITE_URL` before deployment to override the default canonical URL used by sitemap and metadata.

## Follow-up work for production

1. Connect a database/CMS for course content, users, lesson progress, and YKI results.
2. Add email/password authentication and server-side authorization.
3. Configure a payment provider for the Academy subscription and validate prices server-side.
4. Connect AI Gateway and speech/audio services only behind server routes with quotas and abuse protection.
5. Replace newsletter UI state with a server action and double opt-in email provider.
6. Add automated browser, accessibility, and end-to-end tests for placement flow and responsive navigation.
