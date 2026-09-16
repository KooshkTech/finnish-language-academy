# PRODUCTION QA

Status reflects what was actually verified in this build environment.

- Build: NOT VERIFIED — dependency installation/network availability required.
- TypeScript: NOT VERIFIED by `tsc` in this environment.
- Lint: NOT VERIFIED by ESLint in this environment.
- Routes: STATIC REVIEW PASS for `/courses`, `/courses/fi-a0`, `/courses/fi-a1`, `/lessons/a0-hei`, `/lessons/a1-menen-kauppaan`.
- Authentication: EXISTING IMPLEMENTATION PRESERVED; not live-tested in this pass.
- Database: MIGRATION ADDED; not deployed here.
- RLS: SQL REVIEWED; not live-tested against Supabase.
- Course engine: IMPLEMENTED foundation with A0/A1 seeded curriculum.
- Exercise engine: IMPLEMENTED for multiple-choice, fill, translation and error-correction.
- Progress: NEW lesson completion is derived from real correct attempts in-session; new DB persistence not wired yet.
- Placement: EXISTING IMPLEMENTATION PRESERVED.
- Review: EXISTING SRS preserved; unified mistake review center is roadmap.
- AI Tutor: NOT CONFIGURED.
- YKI: PARTIAL practice only; no official scoring.
- Admin: NOT IMPLEMENTED.
- Subscriptions: NOT CONFIGURED.
- SEO: `/courses` and published course pages added to sitemap; broader SEO routes remain roadmap.
- Accessibility: semantic controls and progress labels added; browser audit still required.
- Mobile: responsive CSS added; device/browser audit still required.
- Security: RLS migration added; deployment test required.

Never convert any NOT VERIFIED item to PASS without running the corresponding command/test.

## V15 Full-Stack Classroom verification
- Dedicated skill routes: IMPLEMENTED (static/code inspection)
- Four-tab module blueprint: IMPLEMENTED
- Blackboard renderer: IMPLEMENTED
- Browser recording: IMPLEMENTED, no pronunciation scoring claim
- Weekly schedule persistence schema: IMPLEMENTED migration; deployment not verified
- Accountability persistence service: IMPLEMENTED; live data requires Supabase migration
- AI Tutor API: CONFIGURATION GATE IMPLEMENTED; live provider call intentionally NOT VERIFIED / NOT ENABLED
- Automated 23:59 deadline worker: NOT IMPLEMENTED
- Server-authoritative penalties/rewards: NOT IMPLEMENTED
- Full SM-2 per-module persistence: NOT IMPLEMENTED
- Full YKI simulator/scoring: NOT IMPLEMENTED; no official scoring claim
- npm install: NOT VERIFIED in this environment (registry timeout)
- lint/typecheck/build: NOT VERIFIED in this environment because dependencies are unavailable

---

## V16 validation delta

- TS/TSX syntax parse: **PASS** (97 source files, 0 parse diagnostics)
- TODO/FIXME/Lorem search: **PASS**
- Dependency install: **NOT VERIFIED** — registry timeout / incomplete offline cache in audit environment
- TypeScript semantic check: **NOT VERIFIED**
- ESLint: **NOT VERIFIED**
- Next production build: **NOT VERIFIED**
- V16 Supabase migration: **NOT RUN**
- Dictionary bookmark persistence: **NOT RUN against live Supabase**
- Private upload/storage policies: **NOT RUN against live Supabase**
- Voice STT provider: **NOT RUN with provider credentials**
- AI Tutor provider: **NOT RUN with provider credentials**
- Live quiz Realtime + scoring: **NOT RUN against live Supabase**
- Cron accountability processor: **NOT RUN in deployment scheduler**

Production must not be declared ready until these NOT VERIFIED / NOT RUN items are executed.

