# OpiOpe V10.2 — Full Project Audit

## Kept because it is useful and working
- OpiOpe visual identity, colors, header, bilingual selector and editorial accent style.
- Guest-first placement and local progress persistence.
- Supabase auth/persistence boundaries and guest-to-account migration.
- Finnish placement, representative lesson, grammar practice and vocabulary SRS.
- Swedish starter placement and representative starter lesson.
- Dashboard based on real stored progress rather than fake percentages.
- GDPR consent gate, privacy/cookie/terms routes and account data-rights architecture.
- Robots, sitemap, manifest and SEO metadata.
- Truthful unavailable states for AI and translation.

## Changed because it was weak or misleading
- Hero H1 typography: lighter, cleaner and less compressed.
- Header CTA: now starts guest placement instead of forcing signup.
- Navigation: section buttons now work even when the user is inside an app view.
- Method section: removed listening/weekly-goal claims because real audio and weekly goal engines are not implemented.
- A0–C2 wording: now presented as the product target rather than claiming a complete curriculum.
- Course cards: only the representative working lesson is presented as immediately available; other paths are clearly marked as expanding.
- Work-life tracks: kept as product direction but no longer route to unrelated generic vocabulary and pretend field content exists.
- Swedish flow: avoids routing users into Finnish-only grammar/vocabulary from Swedish course/dashboard actions.
- Free tools: shown only on the homepage and made language-aware.
- FAQ/YKI wording: adjusted to match what currently works.

## Removed because it was unnecessary
- Dead onboarding UI/state that had no navigation entry.
- Unused Base UI/shadcn button helper and utility files.
- Unused dependencies tied only to those files.
- Duplicate pnpm lock/workspace files; npm remains the documented package manager.
- TypeScript build cache.
- Placeholder images/logos not referenced by the app.
- Internal V10 master prompt from the production bundle.
- Several stale CSS rules for removed pricing/newsletter/onboarding/listening-era UI.

## Intentionally not removed
- AI and translation pages: they clearly state that configuration is required and provide safe fallbacks.
- Work-life track descriptions: they are valuable roadmap/product positioning, but are now labeled honestly.
- GDPR/legal documentation: it remains important before launch.

## Must still be done before production
1. Run `npm install`.
2. Run `npm run lint`.
3. Run `npm run typecheck`.
4. Run `npm run build`.
5. Test Finnish: language choice → placement → lesson → grammar/vocabulary → refresh.
6. Test Swedish: language choice → placement → starter lesson → refresh.
7. Test signup/login and guest-progress migration with a real Supabase project.
8. Fill real GDPR controller name and privacy email.
9. Deploy and test the account-data Edge Function before claiming live export/delete.

