# OpiOpe V23 — Daily Lesson CMS + Scheduled Publishing

## Purpose
V23 changes daily lesson maintenance from a code/deployment task into a teacher workflow. Teachers can generate a lesson draft, review it, choose a skill/audience, publish immediately, or schedule it for a future local time.

## Added
- `/teacher/calendar` publishing calendar
- teacher class creation with private join codes
- `/join-class` authenticated student enrollment using the teacher-issued code
- review → schedule/publish panel inside Content Studio
- public/student daily lesson feed on `/learn`
- `/daily-lessons/[slug]` learner lesson page
- `/api/teacher/content/publish`
- `/api/teacher/content/calendar`
- `/api/teacher/classes`
- `/api/lessons/daily`
- migration `20260909203000_daily_lesson_cms.sql`

## Automatic publishing
Scheduled rows become readable when `publish_at <= now()`. RLS and the server API enforce the time gate, so a cron job is not required merely to make a scheduled lesson visible.

## Security
- Teacher mutations require active teacher role and MFA via `checkTeacherAccess(true)`.
- Client cannot write CMS tables directly.
- service-role key remains server-only.
- Public users can only read public lessons whose publish time has arrived.
- Students can additionally read direct or class-targeted lessons after server authorization.
- Publication actions are written to `security_audit_log`.
- AI-generated lessons still require teacher review before scheduling or publishing.

## Required production setup
1. Run all Supabase migrations, including `20260909203000_daily_lesson_cms.sql`.
2. Configure Supabase production env values.
3. Create/approve teacher accounts and MFA.
4. Test with at least two student accounts and one teacher account.
5. Confirm one student cannot access another student's targeted lesson.
6. Confirm scheduled lessons are invisible before `publish_at` and visible afterward.

## Deliberate limits
- Class join is restricted to authenticated users whose server-side role is `student`; anonymous enrollment is rejected.
- AI does not auto-publish. Human approval remains mandatory.

