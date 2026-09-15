# OpiOpe V18 — Level Content + Writable Blackboard

## What changed

- Every level from A0 to C2 now resolves to level-specific content for each core skill:
  - Listening
  - Reading
  - Writing
  - Understanding / Grammar
  - Vocabulary
  - Speaking
  - YKI practice
- Each level/skill page now has:
  - Learn content
  - level-specific examples
  - separate Practice exercises
  - Flashcards
  - a lesson-matched Test
  - a Blackboard generated from the lesson content
- The Blackboard is no longer display-only:
  - handwriting/chalk visual style
  - pointer/mouse/touch/pen drawing canvas
  - chalk / eraser tools
  - white, blue, green and red chalk colors
  - clear-board control
  - per-page local persistence of learner writing
- The Blackboard remains truthful: it is a learner writing surface and does not pretend AI generated content is live when no AI provider is configured.

## Curriculum progression

- A0: first words, greetings, signs, basic `olla`, self-introduction.
- A1: everyday messages, shop/café language, local cases, basic YKI-oriented practice.
- A2: phone calls, past events, imperfect/object basics, work/service vocabulary.
- B1: meetings, work email, perfect/passive/conditional, opinions and intermediate YKI-oriented practice.
- B2: debate, analytical reading, argument writing, participles, negotiation.
- C1: lectures, academic reading/writing, nominalization, expert communication.
- C2: rhetoric, irony, pragmatics, stylistic analysis, idioms and register switching.

## Verification

- New/modified TypeScript and TSX files were parsed successfully with the TypeScript parser.
- Full typecheck/build was not marked PASS in this environment because `npm ci` did not finish and left incomplete type packages.
- Re-run locally:

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run dev
```

