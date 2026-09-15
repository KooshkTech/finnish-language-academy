# OpiOpe V16 Build Report

## Scope implemented

- Modular routes: dictionary, voice lab, arcade, live quiz, existing listening/reading/writing/speaking/grammar/vocabulary/YKI/AI routes.
- Oxford-style **data structure** for Finnish and Swedish dictionary entries with original OpiOpe seed content.
- Inline dictionary lookup and authenticated bookmark persistence.
- Browser microphone recording, replay, TTS prompt playback and server transcription adapter.
- Kids / Youth / Adult profile behavior and persistence architecture.
- Single-player language arcade plus authenticated realtime live-room architecture.
- Universal private upload route with MIME/size validation and Supabase Storage path isolation.
- Anki CSV, PDF study-sheet and PDF assessment-report downloads.
- Detailed assessment error rationales and OpiOpe practice-band mapping.
- Rolling weekly plan generation, local 23:59 deadlines, age/intensity adaptation, server reward updates and cron-based missed-assignment processing.
- Blackboard AI answer sync plus dictionary reference rows.

## Truthful limitations

- The dictionary is OpiOpe editorial seed data in an Oxford-style schema; it is not Oxford University Press data and is not marketed as an official Oxford dictionary.
- OCR/document extraction is not fabricated. Uploads are stored when Supabase is configured; document processing requires a configured processor.
- Speech-to-text works only when the configured transcription provider is available. Transcript text alone is not used to invent phonetic or pitch scores.
- Continuous AI voice-to-voice conversation and true phoneme/pitch scoring require a production speech/realtime provider integration and are not marked complete in V16.
- YKI/CEFR results are practice estimates only, not official examination scores or certificates.
- Live quiz code requires the V16 Supabase migration, Realtime publication, authentication, service-role server secret and an actual deployment test.

## Validation performed in this environment

- TypeScript/TSX syntax parse: PASS across 97 source files.
- Search for TODO/FIXME/Lorem ipsum: PASS (none found).
- `npm ci --offline`: NOT COMPLETED because one npm tarball was not available in the local cache.
- `npm install`: NOT COMPLETED because registry access timed out.
- Full TypeScript semantic typecheck: NOT VERIFIED because dependencies/type packages could not be restored.
- ESLint: NOT VERIFIED for the same dependency reason.
- Next.js production build: NOT VERIFIED for the same dependency reason.
- Supabase migrations: NOT RUN against a live project.
- Provider and Realtime end-to-end flows: NOT RUN with production credentials.

Do not mark production QA as PASS until the commands and live flows above are executed successfully.

