-- OpiOpe V15 classroom, schedule and accountability foundation
create table if not exists public.user_accountability (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cefr_level text not null default 'A0' check (cefr_level in ('A0','A1','A2','B1','B2','C1','C2')),
  current_streak integer not null default 0 check (current_streak >= 0),
  xp_total integer not null default 0 check (xp_total >= 0),
  kulta_balance integer not null default 0 check (kulta_balance >= 0),
  hearts_remaining integer not null default 5 check (hearts_remaining between 0 and 5),
  is_detention_active boolean not null default false,
  missed_count_this_week integer not null default 0 check (missed_count_this_week >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  day_of_week text not null check (day_of_week in ('MON','TUE','WED','THU','FRI','SAT','SUN')),
  assigned_module text not null check (assigned_module in ('/listening','/reading','/writing','/speaking','/understanding','/vocabulary','/yki-test','/ai-tutor')),
  homework_task_id text not null,
  due_at timestamptz not null,
  required_score integer check (required_score between 0 and 100),
  is_completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id, week_start, day_of_week, homework_task_id)
);

create index if not exists weekly_assignments_user_due_idx on public.weekly_assignments(user_id, due_at);

alter table public.user_accountability enable row level security;
alter table public.weekly_assignments enable row level security;

drop policy if exists "accountability own rows" on public.user_accountability;
create policy "accountability own rows" on public.user_accountability for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "assignments own rows" on public.weekly_assignments;
create policy "assignments own rows" on public.weekly_assignments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

