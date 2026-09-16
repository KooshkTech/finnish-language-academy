-- OpiOpe V24.15: class invitations, announcements and teacher/student messaging.

alter table public.user_notifications drop constraint if exists user_notifications_notification_type_check;
alter table public.user_notifications add constraint user_notifications_notification_type_check
  check (notification_type in (
    'assignment_created','assignment_due_soon','assignment_overdue','submission_received','feedback_received',
    'class_invitation','class_announcement','class_message'
  ));

create table if not exists public.class_invitations (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  course_language text not null check (course_language in ('fi','sv')),
  invite_token text not null unique check (char_length(invite_token) between 20 and 120),
  target_student_id uuid references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','declined','revoked')),
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists class_invitations_class_idx on public.class_invitations(class_id, created_at desc);
create index if not exists class_invitations_target_idx on public.class_invitations(target_student_id, status, created_at desc);
alter table public.class_invitations enable row level security;
revoke insert, update, delete on public.class_invitations from anon, authenticated;
drop policy if exists "student reads targeted class invitations" on public.class_invitations;
create policy "student reads targeted class invitations" on public.class_invitations for select to authenticated
  using (target_student_id = auth.uid());

create table if not exists public.class_announcements (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  course_language text not null check (course_language in ('fi','sv')),
  title text not null check (char_length(title) between 2 and 180),
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists class_announcements_class_idx on public.class_announcements(class_id, created_at desc);
alter table public.class_announcements enable row level security;
revoke insert, update, delete on public.class_announcements from anon, authenticated;

create table if not exists public.class_messages (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete cascade,
  recipient_user_id uuid not null references auth.users(id) on delete cascade,
  course_language text not null check (course_language in ('fi','sv')),
  body text not null check (char_length(body) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_user_id <> recipient_user_id)
);
create index if not exists class_messages_class_created_idx on public.class_messages(class_id, created_at desc);
create index if not exists class_messages_recipient_idx on public.class_messages(recipient_user_id, read_at, created_at desc);
alter table public.class_messages enable row level security;
revoke insert, update, delete on public.class_messages from anon, authenticated;
drop policy if exists "user reads own class messages" on public.class_messages;
create policy "user reads own class messages" on public.class_messages for select to authenticated
  using (sender_user_id = auth.uid() or recipient_user_id = auth.uid());

