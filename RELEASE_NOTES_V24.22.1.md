# OpiOpe V24.22.1 — Stabilization release

This release fixes defects found during the V24.22 security and behavior audit.

## Fixed

- Blocked external login callback redirects using backslash URL parsing.
- Based attendance percentages on completed sessions, including unmarked sessions.
- Excluded excused sessions from the attendance-rate denominator.
- Added an explicit unmarked count to teacher attendance reports.
- Exported every enrolled student for every class session in the attendance CSV.
- Added session status and unmarked attendance values to CSV exports.
- Neutralized spreadsheet-formula injection in CSV cells.
- Returned database failures from student reaction writes.
- Reported failed automatic feed, notification, and audit-log side effects.
- Repaired the student Level Up achievements anchor.
- Added executable regression tests for redirects, attendance math, and CSV safety.

No new Supabase migration is required after V24.22. Apply all existing migrations through `20260915120000_class_feed_learning_path.sql` before account testing.

