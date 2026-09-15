-- OpiOpe course-engine foundation
-- Data-driven Level -> Course -> Module -> Unit -> Lesson -> Activity -> Exercise hierarchy.

create table if not exists public.levels (
  id text primary key,
  language text not null check (language in ('fi','sv')),
  cefr_level text not null check (cefr_level in ('A0','A1','A2','B1','B2','C1','C2')),
  title text not null,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  unique(language, cefr_level)
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  level_id text not null references public.levels(id) on delete restrict,
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  order_index integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists modules_course_order_idx on public.modules(course_id, order_index);

create table if not exists public.units (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists units_module_order_idx on public.units(module_id, order_index);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  slug text not null unique,
  title text not null,
  objective text not null,
  estimated_minutes integer not null default 10 check (estimated_minutes between 1 and 240),
  status text not null default 'draft' check (status in ('draft','review','published','archived')),
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists lessons_unit_order_idx on public.lessons(unit_id, order_index);

create table if not exists public.lesson_activities (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  kind text not null check (kind in ('learn','understand','practice','apply','check')),
  title text not null,
  content jsonb not null default '{}'::jsonb,
  required boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists lesson_activities_lesson_order_idx on public.lesson_activities(lesson_id, order_index);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.lesson_activities(id) on delete cascade,
  type text not null,
  prompt text not null,
  instructions text,
  content jsonb not null default '{}'::jsonb,
  correct_answer jsonb not null,
  acceptable_answers jsonb not null default '[]'::jsonb,
  explanation text not null,
  hint text,
  difficulty text,
  skill text not null,
  grammar_topic text,
  points integer not null default 10 check (points >= 0),
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists exercises_activity_order_idx on public.exercises(activity_id, order_index);

create table if not exists public.user_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_activity_at timestamptz not null default now(),
  unique(user_id, course_id)
);
create index if not exists user_courses_user_idx on public.user_courses(user_id, last_activity_at desc);

create table if not exists public.activity_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid not null references public.lesson_activities(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score integer,
  accuracy numeric(5,2),
  time_spent_seconds integer not null default 0 check (time_spent_seconds >= 0),
  attempts integer not null default 0 check (attempts >= 0),
  updated_at timestamptz not null default now(),
  unique(user_id, activity_id)
);
create index if not exists activity_progress_user_updated_idx on public.activity_progress(user_id, updated_at desc);

create table if not exists public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid references public.exercises(id) on delete set null,
  answer text,
  correct_answer text,
  skill text,
  grammar_topic text,
  error_type text,
  attempt_count integer not null default 1 check (attempt_count > 0),
  last_attempt_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists mistakes_user_unresolved_idx on public.mistakes(user_id, resolved_at, last_attempt_at desc);

alter table public.levels enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.units enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_activities enable row level security;
alter table public.exercises enable row level security;
alter table public.user_courses enable row level security;
alter table public.activity_progress enable row level security;
alter table public.mistakes enable row level security;

-- Public learners may read only published curriculum hierarchy. Levels are catalog metadata.
drop policy if exists levels_public_read on public.levels;
create policy levels_public_read on public.levels for select using (true);
drop policy if exists courses_public_read on public.courses;
create policy courses_public_read on public.courses for select using (status = 'published');
drop policy if exists modules_public_read on public.modules;
create policy modules_public_read on public.modules for select using (exists (select 1 from public.courses c where c.id = modules.course_id and c.status = 'published'));
drop policy if exists units_public_read on public.units;
create policy units_public_read on public.units for select using (exists (select 1 from public.modules m join public.courses c on c.id = m.course_id where m.id = units.module_id and c.status = 'published'));
drop policy if exists lessons_public_read on public.lessons;
create policy lessons_public_read on public.lessons for select using (status = 'published');
drop policy if exists lesson_activities_public_read on public.lesson_activities;
create policy lesson_activities_public_read on public.lesson_activities for select using (exists (select 1 from public.lessons l where l.id = lesson_activities.lesson_id and l.status = 'published'));
drop policy if exists exercises_public_read on public.exercises;
create policy exercises_public_read on public.exercises for select using (exists (select 1 from public.lesson_activities a join public.lessons l on l.id = a.lesson_id where a.id = exercises.activity_id and l.status = 'published'));

-- Learner-owned records.
drop policy if exists user_courses_owner_all on public.user_courses;
create policy user_courses_owner_all on public.user_courses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists activity_progress_owner_all on public.activity_progress;
create policy activity_progress_owner_all on public.activity_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists mistakes_owner_all on public.mistakes;
create policy mistakes_owner_all on public.mistakes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Admin/teacher content-write policies are intentionally NOT opened here.
-- Add server-verified RBAC before enabling content mutations from the CMS.

