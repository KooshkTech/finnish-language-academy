# Course Engine

## Principles
1. Curriculum is structured data, not one-off hardcoded cards.
2. Completion requires passing required exercises.
3. Every evaluated exercise returns pedagogical feedback.
4. Roadmap levels are never presented as complete curriculum.
5. The engine supports extension to database-driven content without rewriting the lesson UI.

## Implemented exercise types
- multiple choice
- fill blank / typed answer
- translation
- error correction

The type model reserves expansion for additional exercise types in later phases.

## Completion logic
`services/course-engine.ts` derives required exercise IDs from required lesson activities. A lesson is completable only when every required exercise has a correct result. This intentionally prevents fake “complete” state.

## Seed curriculum
- A0: greetings/name; thanks/sorry.
- A1: direction/illative; shopping; daily routine.
- A2–C2: visible roadmap only.

