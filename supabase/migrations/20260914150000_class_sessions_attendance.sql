-- OpiOpe V24.16: scheduled class sessions and attendance tracking.

alter table public.user_notifications drop constraint if exists user_notifications_notification_type_check;
alter table public.user_notifications add constraint user_notifications_notification_type_check
  check (notification_type in (
    'assignment_created','assignment_due_soon','assignment_overdue','submission_received','feedback_received',
    'class_invitation','class_announcement','class_message',
    'class_session_scheduled','class_session_cancelled'
  ));

create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  course_language text not null check (course_language in ('fi','sv')),
  title text not null check (char_length(title) between 2 and 180),
  description text check (description is null or char_length(description) <= 4000),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  meeting_url text check (meeting_url is null or char_length(meeting_url) <= 1000),
  location_text text check (location_text is null or char_length(location_text) <= 240),
  status text not null default 'scheduled' check (status in ('scheduled','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists class_sessions_class_start_idx on public.class_sessions(class_id, starts_at desc);
create index if not exists class_sessions_teacher_start_idx on public.class_sessions(teacher_id, starts_at desc);

alter table public.class_sessions enable row level security;
revoke insert, update, delete on public.class_sessions from anon, authenticated;
drop policy if exists "student reads own class sessions" on public.class_sessions;
create policy "student reads own class sessions" on public.class_sessions for select to authenticated
  using (exists (
    select 1 from public.teacher_class_members m
    where m.class_id = class_sessions.class_id and m.student_id = auth.uid()
  ));

create table if not exists public.class_attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.class_sessions(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  attendance_status text not null check (attendance_status in ('present','late','absent','excused')),
  teacher_note text check (teacher_note is null or char_length(teacher_note) <= 1000),
  marked_by uuid not null references auth.users(id) on delete cascade,
  marked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(session_id, student_id)
);
create index if not exists class_attendance_student_idx on public.class_attendance(student_id, marked_at desc);
create index if not exists class_attendance_session_idx on public.class_attendance(session_id, attendance_status);

alter table public.class_attendance enable row level security;
revoke insert, update, delete on public.class_attendance from anon, authenticated;
drop policy if exists "student reads own attendance" on public.class_attendance;
create policy "student reads own attendance" on public.class_attendance for select to authenticated
  using (student_id = auth.uid());

