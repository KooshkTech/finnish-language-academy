# OpiOpe V24.23 — Finnish curriculum expansion

This release adds 70 original Finnish lessons: ten each at A0, A1, A2, B1,
B2, C1 and C2. A0 is a course starter label, not an official CEFR level.
The progression uses themes, language discovery, explanation, practice,
production and review. No Suomen mestari text, exercise, image or recording
has been copied; this is not an official or affiliated textbook edition.

## Where to study

- Homepage and `/learn`: prominent links to the new curriculum.
- `/learn/academy`: seven new level books followed by preserved older modules.
- `/learn/academy/fi-a0` through `/learn/academy/fi-c2`: ten usable lesson links.
- `/course/fi/levels/{level}`: direct access to the same ten lessons.
- Lesson pages support all six existing learning stages and next-lesson navigation.

Each lesson includes an original reading passage with English support, a
different listening transcript, four core vocabulary items, grammar discovery
and explanation, interactive questions, and open speaking/writing tasks.
Each tenth lesson retrieves tasks from lessons 1, 4 and 7 and includes a broader
production task. There are 721 rendered question instances, including repeated
review questions; this is not a claim of 721 different questions.

## Important limitations

- Content is an authored instructional draft. Structural checks are not a
  Finnish teacher's review or an independent CEFR calibration. Ten compact
  lessons do not guarantee proficiency at a level.
- Listening uses a device/browser Finnish synthetic voice, when available.
  There are no new recorded voices or licensed textbook audio. Unavailable
  voices produce an explicit message; transcripts remain usable.
- Writing drafts and “complete” markers last only in the currently open lesson
  view. They are not saved to an account, a learning-path database, or SRS.
  Copy writing before leaving. Speaking/writing require self- or teacher review;
  this release does not automatically score them.
- Suggested prerequisites guide sequencing but do not lock lesson access.
- Older content, Swedish content, classroom scheduling and attendance features
  are preserved. This release adds no database migration and does not deploy
  or verify real-account configuration.

## Install and verify on Windows

Extract to a new folder; do not overwrite your configured working folder.
Use Node.js 24. Keep your existing private environment values private and do
not commit them. The ZIP does not include dependencies or build output.

```bash
npm ci
npm run lint
npm run typecheck
npm run build
npm run audit:class-sessions
npm run audit:community
npm run audit:curriculum
npm test
npm run dev
```

`npm run verify:release` runs all five mandatory checks, regression tests,
curriculum audit and the other integrated feature audits. After building,
`node scripts/smoke-finnish-curriculum.mjs` checks production HTTP rendering,
all 70 lesson routes, 14 level routes, preserved entry points and invalid IDs.
These checks do not cover authenticated users, microphone interaction or
device-specific speech synthesis. Those require manual testing.

This package is a local release candidate; it does not merge a GitHub pull
request or publish the application.

## Validation performed on 2026-09-15

- Lint and typecheck passed.
- Production build passed after moving aside an obsolete generated build cache.
- Both mandatory feature audits (class sessions and community) passed.
- Feed automation, achievements, student hub, teacher hub and attendance
  reports audits passed.
- Curriculum structural audit passed: 7 levels, 70 lessons, 721 question instances.
- All 10 regression tests passed, including case-sensitive choice grading.
- Production HTTP smoke passed for 96 routes, including all 70 new lesson
  pages, and two invalid-ID checks returned 404.
- Production dependency audit reported zero vulnerabilities.

These are development-environment results, not Windows device or real-account
test results. Run the same gate on your machine before replacing a working setup.
