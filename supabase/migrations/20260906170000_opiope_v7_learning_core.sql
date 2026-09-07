-- OpiOpe V7 functional learning core
-- Run in Supabase SQL editor or via `supabase db push`.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  level text,
  goal text,
  daily_minutes integer check (daily_minutes is null or daily_minutes between 1 and 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_level text,
  current_lesson text,
  total_xp integer not null default 0 check (total_xp >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.placement_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  estimated_level text not null,
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  category_scores jsonb not null default '{}'::jsonb,
  recommended_lesson text,
  completed_at timestamptz not null default now()
);
create index if not exists placement_results_user_completed_idx on public.placement_results(user_id, completed_at desc);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_slug text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  last_position integer not null default 0 check (last_position >= 0),
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_slug)
);
create index if not exists lesson_progress_user_updated_idx on public.lesson_progress(user_id, updated_at desc);

create table if not exists public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_slug text,
  exercise_id text not null,
  grammar_topic text,
  answer text,
  is_correct boolean not null,
  explanation text,
  attempted_at timestamptz not null default now()
);
create index if not exists exercise_attempts_user_attempted_idx on public.exercise_attempts(user_id, attempted_at desc);
create index if not exists exercise_attempts_user_topic_idx on public.exercise_attempts(user_id, grammar_topic);

create table if not exists public.vocabulary_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  word text not null,
  translation text not null,
  first_seen timestamptz not null default now(),
  last_reviewed timestamptz,
  next_review timestamptz not null default now(),
  correct_count integer not null default 0 check (correct_count >= 0),
  wrong_count integer not null default 0 check (wrong_count >= 0),
  interval integer not null default 0 check (interval >= 0),
  ease_factor numeric(4,2) not null default 2.50 check (ease_factor between 1.30 and 3.00),
  confidence integer not null default 0 check (confidence between 0 and 100),
  mastery integer not null default 0 check (mastery between 0 and 100),
  updated_at timestamptz not null default now(),
  unique(user_id, word)
);
create index if not exists vocabulary_progress_due_idx on public.vocabulary_progress(user_id, next_review);

create table if not exists public.daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_date date not null default current_date,
  minutes integer not null default 0 check (minutes >= 0),
  exercises integer not null default 0 check (exercises >= 0),
  updated_at timestamptz not null default now(),
  unique(user_id, activity_date)
);
create index if not exists daily_activity_user_date_idx on public.daily_activity(user_id, activity_date desc);

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.placement_results enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.exercise_attempts enable row level security;
alter table public.vocabulary_progress enable row level security;
alter table public.daily_activity enable row level security;

-- Owner-only read policies.
drop policy if exists profiles_owner_select on public.profiles;
create policy profiles_owner_select on public.profiles for select using (auth.uid() = id);
drop policy if exists user_progress_owner_select on public.user_progress;
create policy user_progress_owner_select on public.user_progress for select using (auth.uid() = user_id);
drop policy if exists placement_results_owner_select on public.placement_results;
create policy placement_results_owner_select on public.placement_results for select using (auth.uid() = user_id);
drop policy if exists lesson_progress_owner_select on public.lesson_progress;
create policy lesson_progress_owner_select on public.lesson_progress for select using (auth.uid() = user_id);
drop policy if exists exercise_attempts_owner_select on public.exercise_attempts;
create policy exercise_attempts_owner_select on public.exercise_attempts for select using (auth.uid() = user_id);
drop policy if exists vocabulary_progress_owner_select on public.vocabulary_progress;
create policy vocabulary_progress_owner_select on public.vocabulary_progress for select using (auth.uid() = user_id);
drop policy if exists daily_activity_owner_select on public.daily_activity;
create policy daily_activity_owner_select on public.daily_activity for select using (auth.uid() = user_id);

-- Owner-only write policies.
drop policy if exists profiles_owner_insert on public.profiles;
create policy profiles_owner_insert on public.profiles for insert with check (auth.uid() = id);
drop policy if exists profiles_owner_update on public.profiles;
create policy profiles_owner_update on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists profiles_owner_delete on public.profiles;
create policy profiles_owner_delete on public.profiles for delete using (auth.uid() = id);

drop policy if exists user_progress_owner_insert on public.user_progress;
create policy user_progress_owner_insert on public.user_progress for insert with check (auth.uid() = user_id);
drop policy if exists user_progress_owner_update on public.user_progress;
create policy user_progress_owner_update on public.user_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists user_progress_owner_delete on public.user_progress;
create policy user_progress_owner_delete on public.user_progress for delete using (auth.uid() = user_id);

drop policy if exists placement_results_owner_insert on public.placement_results;
create policy placement_results_owner_insert on public.placement_results for insert with check (auth.uid() = user_id);
drop policy if exists placement_results_owner_update on public.placement_results;
create policy placement_results_owner_update on public.placement_results for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists placement_results_owner_delete on public.placement_results;
create policy placement_results_owner_delete on public.placement_results for delete using (auth.uid() = user_id);

drop policy if exists lesson_progress_owner_insert on public.lesson_progress;
create policy lesson_progress_owner_insert on public.lesson_progress for insert with check (auth.uid() = user_id);
drop policy if exists lesson_progress_owner_update on public.lesson_progress;
create policy lesson_progress_owner_update on public.lesson_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists lesson_progress_owner_delete on public.lesson_progress;
create policy lesson_progress_owner_delete on public.lesson_progress for delete using (auth.uid() = user_id);

drop policy if exists exercise_attempts_owner_insert on public.exercise_attempts;
create policy exercise_attempts_owner_insert on public.exercise_attempts for insert with check (auth.uid() = user_id);
drop policy if exists exercise_attempts_owner_update on public.exercise_attempts;
create policy exercise_attempts_owner_update on public.exercise_attempts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists exercise_attempts_owner_delete on public.exercise_attempts;
create policy exercise_attempts_owner_delete on public.exercise_attempts for delete using (auth.uid() = user_id);

drop policy if exists vocabulary_progress_owner_insert on public.vocabulary_progress;
create policy vocabulary_progress_owner_insert on public.vocabulary_progress for insert with check (auth.uid() = user_id);
drop policy if exists vocabulary_progress_owner_update on public.vocabulary_progress;
create policy vocabulary_progress_owner_update on public.vocabulary_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists vocabulary_progress_owner_delete on public.vocabulary_progress;
create policy vocabulary_progress_owner_delete on public.vocabulary_progress for delete using (auth.uid() = user_id);

drop policy if exists daily_activity_owner_insert on public.daily_activity;
create policy daily_activity_owner_insert on public.daily_activity for insert with check (auth.uid() = user_id);
drop policy if exists daily_activity_owner_update on public.daily_activity;
create policy daily_activity_owner_update on public.daily_activity for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists daily_activity_owner_delete on public.daily_activity;
create policy daily_activity_owner_delete on public.daily_activity for delete using (auth.uid() = user_id);
