# OpiOpe V19 — Smart Level App

## Added

- Global **Tarkka** smart study assistant on every app route.
- Optional checkbox controls for meaning, grammar, sentence examples, inflection, spoken Finnish, synonyms, Blackboard sync and AI teacher.
- Curated `tarkka` dictionary seed entry plus local dictionary-backed analysis.
- Blackboard receives smart-analysis notes through an app event when Blackboard sync is enabled.
- Level-only quick search in every level sidebar. Results stay inside the selected A0–C2 level and route directly to the matching skill lesson.
- Collapsible level resource panel with icon links for Kahoot!, Microsoft Teams, Yle Selkouutiset, Yle Uutiset, Kielitoimiston sanakirja and Kotus.
- `/teacher/settings` with browser-persisted teacher presentation preferences and a truthful note that server-authoritative teacher roles still require backend role configuration.
- `/contacts` with support, teacher, technical and privacy contact categories. Uses environment-based email addresses and does not fake a live support backend.
- Added collapsible `<details>` UI to search, smart options, resources, teacher settings and contact guidance.

## Smart assistant behavior

When a learner types a known local dictionary word, OpiOpe can show selected sections from dictionary data. The example `tarkka` supports meaning, grammar, inflection, example sentences, spoken form and synonyms. Unknown terms clearly report that the local dictionary does not yet contain the word. AI enhancement is opt-in and only works when the existing server-side AI provider is configured.

## Search behavior

The quick search uses only the currently selected level curriculum and searches lesson title, subtitle, goals, examples, flashcards and learning-tool keywords. It does not send the learner to another CEFR level unless they explicitly change level.

## Verification

- TypeScript/TSX syntax parse: PASS (111 files, 0 parse diagnostics)
- Full `npm install`: NOT COMPLETED in this container due to registry/transport timeout
- Full typecheck/lint/build: NOT CLAIMED as PASS in this container

Run locally:

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run dev
```

