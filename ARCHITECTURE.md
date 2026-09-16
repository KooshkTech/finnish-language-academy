# OpiOpe Architecture

OpiOpe currently preserves the Next.js 16 + React 19 + TypeScript application rather than rewriting to Vite. The product is being moved from a homepage-centric prototype toward a course-engine-first architecture.

## Layers
- `app/`: public and learner routes.
- `components/course/`: reusable lesson/course UI.
- `data/`: seeded curriculum used to prove the engine end to end.
- `types/`: typed learning and course domain models.
- `services/`: scoring, progression, auth and persistence boundaries.
- `supabase/migrations/`: database/RLS evolution.

## Course hierarchy
Level → Course → Module → Unit → Lesson → Activity → Exercise.

A0 and A1 contain representative published curriculum. A2–C2 remain explicitly `development` until real content exists.

## Current limitation
The new course player evaluates exercises in the browser and enforces completion rules, but its new course-specific progress tables are not yet wired to authenticated persistence. Existing V7 guest/auth lesson, grammar and vocabulary persistence remains intact. Do not call the new course engine fully persisted until the migration is deployed and service integration is completed.

