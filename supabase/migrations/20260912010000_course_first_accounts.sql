-- OpiOpe V24.4 course-first accounts
-- Separates the studied language from account role and supports registered free users.

alter table public.profiles
  add column if not exists course_language text not null default 'fi',
  add column if not exists account_mode text not null default 'student';

alter table public.profiles drop constraint if exists profiles_course_language_check;
alter table public.profiles add constraint profiles_course_language_check check (course_language in ('fi','sv'));
alter table public.profiles drop constraint if exists profiles_account_mode_check;
alter table public.profiles add constraint profiles_account_mode_check check (account_mode in ('student','free','teacher_pending','teacher'));

create table if not exists public.teacher_applications (
  user_id uuid primary key references auth.users(id) on delete cascade,
  course_language text not null check (course_language in ('fi','sv')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
alter table public.teacher_applications enable row level security;
drop policy if exists teacher_applications_owner_select on public.teacher_applications;
create policy teacher_applications_owner_select on public.teacher_applications for select using (auth.uid() = user_id);

create or replace function public.handle_new_student_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
  requested_name text;
  requested_course text;
  requested_mode text;
  requested_role text;
begin
  requested_username := lower(trim(coalesce(new.raw_user_meta_data->>'username', '')));
  requested_name := nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), '');
  requested_course := case when new.raw_user_meta_data->>'course_language' = 'sv' then 'sv' else 'fi' end;
  requested_mode := coalesce(new.raw_user_meta_data->>'account_mode', 'student');
  requested_role := coalesce(new.raw_user_meta_data->>'requested_role', 'student');

  if requested_username = '' or requested_username !~ '^[a-z0-9._-]{3,32}$' then
    raise exception 'invalid username';
  end if;

  if requested_role = 'teacher' then
    requested_mode := 'teacher_pending';
  elsif requested_mode not in ('student','free') then
    requested_mode := 'student';
  end if;

  insert into public.profiles (id, display_name, username, role, course_language, account_mode, created_at, updated_at)
  values (new.id, coalesce(requested_name, requested_username), requested_username, 'student', requested_course, requested_mode, now(), now())
  on conflict (id) do update
    set display_name = excluded.display_name,
        username = excluded.username,
        course_language = excluded.course_language,
        account_mode = excluded.account_mode,
        updated_at = now();

  if requested_role = 'teacher' then
    insert into public.teacher_applications (user_id, course_language, status)
    values (new.id, requested_course, 'pending')
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

