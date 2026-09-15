# OpiOpe V21 — Legal, Security, SEO & Teacher Content Studio Review

## Product simplification
- Keep the first screen to three paths: Teacher, Student, Free User.
- Keep learner navigation level-first (A0–C2), then skill-first inside the selected level.
- Keep Blackboard, Tarkka, practice, flashcards and tests inside the lesson context instead of exposing them as separate top-level products.
- Keep external links and file tools collapsed under disclosures/tools.
- Teacher tools are isolated under `/teacher` and never shown as learner controls.

## Security hardening
- Teacher role remains invitation/approval-only and server verified.
- MFA/AAL2 is required for teacher workspace by default.
- RLS is enabled for user-owned and teacher-owned data; teacher-content writes use hardened server routes.
- Login, AI, dictionary, uploads, voice and teacher content generation are rate limited.
- Service-role secrets remain server-only.
- Teacher uploads use MIME allowlists, byte limits, signature checks, random object names and private storage.
- Teacher source material is never auto-published. Generated lessons are `review-required` drafts.
- Provider error bodies are not exposed to clients.
- Kids profile cloud sync is blocked until a guardian/organization workflow exists. Youth sync requires a 13+ confirmation in the current consumer flow.
- No emotion-recognition feature is permitted in the educational AI/voice architecture.

## Teacher content studio
Route: `/teacher/content-studio`

Teacher can provide:
- TXT/Markdown source file (processed immediately),
- PDF/image/audio source (stored privately; requires configured OCR/STT processor unless text is pasted),
- pasted source text,
- language (`fi`/`sv`),
- CEFR target,
- teacher instruction.

When AI is configured, the server generates a structured draft containing:
- lesson theory + examples,
- vocabulary,
- grammar,
- Blackboard blocks,
- varied exercises,
- flashcards,
- test questions + explanations,
- teacher notes + limitations.

All AI output requires human review before publication.

## Copyright guard
Teachers must affirm that they have the right to use uploaded material. OpiOpe should not reproduce long third-party works into generated lessons. Uploaded source is private by default.

## SEO
- `/`, `/learn`, level pages and level-skill pages have crawlable metadata/canonicals.
- Sitemap now includes public A0–C2 level and skill routes.
- `/teacher`, `/account`, `/admin` remain disallowed in robots and teacher pages are `noindex`.
- Root page includes `WebSite` and `SoftwareApplication` JSON-LD only; no fake ratings/reviews/accreditation.
- Do not use Google `Course` structured data unless the actual pages meet Google's current Course eligibility requirements.

## Legal launch blockers
Before launch, configure the real controller/legal entity and privacy contact, document processors/subprocessors and retention, establish child/guardian account policy, establish teacher material copyright policy, review AI Act classification as features evolve, and complete a DPIA if processing risk warrants it.

## AI Act design guardrails
- Clearly disclose AI interactions.
- Do not use emotion recognition in education.
- Do not present AI practice grading as an official YKI/CEFR decision.
- If AI is later used by an educational institution to make decisions that determine access, progression or outcomes, perform a formal AI Act high-risk classification/compliance review before deployment.

