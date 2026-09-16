# Database

Existing migration `20260906170000_opiope_v7_learning_core.sql` stores profile, placement, lesson progress, attempts, vocabulary SRS and daily activity.

New migration `20260908030000_course_engine_foundation.sql` adds normalized curriculum entities:
- levels
- courses
- modules
- units
- lessons
- lesson_activities
- exercises
- user_courses
- activity_progress
- mistakes

Published curriculum receives read-only learner access through RLS. User-owned progression tables use owner-only RLS. Admin content-write policies are intentionally not opened until server-verified RBAC exists.

