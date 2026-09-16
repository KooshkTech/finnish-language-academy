-- OpiOpe V24.12: in-app notifications and assignment deadline reminders.
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_language text not null check (course_language in ('fi','sv')),
  notification_type text not null check (notification_type in ('assignment_created','assignment_due_soon','assignment_overdue','submission_received','feedback_received')),
  title text not null check (char_length(title) between 1 and 180),
  body text not null default '' check (char_length(body) <= 1200),
  link_path text check (link_path is null or (char_length(link_path) <= 350 and link_path like '/%')),
  source_key text not null check (char_length(source_key) between 1 and 220),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, source_key)
);
create index if not exists user_notifications_user_created_idx on public.user_notifications(user_id, created_at desc);
create index if not exists user_notifications_user_unread_idx on public.user_notifications(user_id, read_at, created_at desc);
alter table public.user_notifications enable row level security;
drop policy if exists "user reads own notifications" on public.user_notifications;
create policy "user reads own notifications" on public.user_notifications for select to authenticated using (user_id = auth.uid());
revoke insert, update, delete on public.user_notifications from anon, authenticated;

