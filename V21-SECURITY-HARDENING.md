# OpiOpe V21 — Security Hardening & Simplification

## Implemented
- Teacher access is invitation/approval based through `teacher_access`; a browser checkbox cannot grant a teacher role.
- Teacher workspace requires server-side role validation and TOTP MFA (AAL2) by default.
- Teacher settings are no longer linked from the learner sidebar or Tarkka panel.
- Login errors are intentionally generic to reduce username/role enumeration.
- Login, AI, dictionary, voice transcription, and uploads use rate limiting. Production uses a service-role PostgreSQL rate-limit function; an in-memory fallback exists only for degraded/local environments.
- Security audit events are stored in a service-role-only audit table.
- Learner upload paths use cryptographically random UUID names, allowed MIME types, byte-size limits, and file-signature checks. SVG/HTML/executable uploads are not accepted.
- Failed upload metadata persistence removes the just-uploaded object to avoid orphaned private files.
- AI/provider error bodies are not returned to the browser.
- Teacher/account/admin areas are disallowed in robots.
- Common HTTP hardening headers are configured; HSTS is production-only.
- Upload/download UI is collapsed under a Tools disclosure to reduce learner clutter.

## Teacher activation
Creating a normal auth user is not enough to grant teacher access. A trusted admin must:
1. set `profiles.role = 'teacher'`, and
2. create/activate the corresponding `teacher_access` row.

Example trusted SQL (replace UUIDs; run only in a trusted admin context):
```sql
update public.profiles set role = 'teacher' where id = '<teacher-user-uuid>';
insert into public.teacher_access(user_id, status, mfa_required, approved_at)
values ('<teacher-user-uuid>', 'active', true, now())
on conflict (user_id) do update
set status = 'active', mfa_required = true, approved_at = now(), updated_at = now();
```

## Required production configuration
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or publishable key
- `SUPABASE_SERVICE_ROLE_KEY` (server only)
- `RATE_LIMIT_PEPPER` (long random server-only value)
- private Supabase Storage bucket named by `OPIOPE_UPLOAD_BUCKET`
- Supabase MFA/TOTP enabled
- run migration `20260909090000_security_hardening.sql`

## Still recommended before public launch
- Malware scanning/quarantine for uploads (signature validation is not antivirus scanning).
- External monitoring/alerting for auth and admin events.
- Backup/restore drill and Supabase PITR plan where applicable.
- CSP with per-request nonces after validating all Next.js/analytics/script requirements.
- Periodic RLS integration tests with separate student/teacher/admin accounts.
- Consider a dedicated distributed rate limiter if deployment topology does not use the included PostgreSQL function.

