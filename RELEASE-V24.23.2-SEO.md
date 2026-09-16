# OpiOpe V24.23.2 — SEO release candidate

Design, lessons and teacher tools from V24.23.1 are preserved.

## Fixed

- Sitemap allowlist includes all 70 complete Finnish lessons, seven Academy
  levels, Finnish course-level pages, seven Swedish levels and 42 Swedish skill
  pages (145 public URLs total). Personal progress, review, tutor,
  accounts and older planned modules are excluded. No artificial last-modified
  timestamps are emitted.
- Explicit production indexing opt-in. Local builds, default installations,
  Vercel previews and vercel.app URLs remain noindex with an empty sitemap.
- Private/account routes carry X-Robots-Tag independently of the public setting.
  This is not access control: authentication and database policies remain required.
- Finnish/Swedish course entry and level pages have localized metadata,
  self-referencing canonicals and localized social titles.
- Legacy Academy module overview pages remain available but are noindex.
- Canonical base and homepage WebSite schema use one normalized origin;
  credentials, paths and query strings in the configured origin are rejected.

## Production configuration — only after private account testing

Set NEXT_PUBLIC_SITE_URL to your actual HTTPS production origin (no path).
Set OPIOPE_ALLOW_INDEXING=true on production only. Rebuild and deploy after
changing these values. Leave previews false. The old opiope.fi fallback is not
proof of domain ownership or deployment; an explicit URL is required to index.

Finnish and Swedish lessons teach different target languages, so they are not
declared hreflang translations. Add reciprocal alternates when equivalent
translated marketing pages actually exist. See Google's guidance:
https://developers.google.com/search/docs/specialty/international/localized-versions

After deployment verify rendered canonicals, robots.txt, sitemap.xml and
X-Robots-Tag on the actual host. Verify the domain in Search Console and submit
the sitemap. Search Console is not configured by this ZIP. Mobile Core Web
Vitals, real-account security tests and language/content review remain pending.
No ranking, indexing or production-readiness guarantee is made.

## Local validation

Run npm ci, npm run verify:release, then npm run dev.
The SEO regression tests run as part of npm run test.

Validated for this package: verify:release passed, including all five required
checks and 19 regression tests. HTTP checks passed for all 145 sitemap routes
and self-referencing canonicals, in both default noindex mode and a rebuild
with indexing enabled for the placeholder https://example.org origin. The
96-route curriculum smoke and two invalid-ID 404 checks passed in both modes.
The placeholder was used only as metadata during local testing; no deployment
or external domain change was made. ZIP contains source only, not built output
or private environment credentials.
