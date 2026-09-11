-- OPIOPE V25 teacher/student + recurring lesson foundation
create type if not exists public.app_role as enum ('student','teacher','admin');
create type if not exists public.class_type as enum ('general','swedish','yki','work','integration');
create type if not exists public.lesson_frequency as enum ('manual','daily','weekly','monthly','yearly');
create type if not exists public.lesson_status as enum ('draft','review','approved','scheduled','published','archived');

alter table if exists public.profiles
  add column if not exists role public.app_role not null default 'student',
  add column if not exists display_name text,
  add column if not exists ui_language text not null default 'fi' check (ui_language in ('fi','sv')),
  add column if not exists target_language text not null default 'fi' check (target_language in ('fi','sv')),
  add column if not exists current_level text default 'A0',
  add column if not exists learning_goal text;

create table if not exists public.teacher_classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  class_type public.class_type not null default 'general',
  cefr_level text not null default 'A0',
  join_code text not null unique default upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teacher_class_members (
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  lesson_id text,
  title text not null,
  instructions text,
  assigned_at timestamptz not null default now(),
  due_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.assignment_submissions (
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','submitted','completed')),
  answer_text text,
  score numeric,
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (assignment_id, student_id)
);

create table if not exists public.recurring_lesson_plans (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.teacher_classes(id) on delete cascade,
  target_language text not null check (target_language in ('fi','sv')),
  cefr_level text not null,
  topic text not null,
  skill_focus text[] not null default '{}',
  frequency public.lesson_frequency not null default 'manual',
  next_run_at timestamptz,
  last_run_at timestamptz,
  is_active boolean not null default true,
  requires_teacher_approval boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_versions (
  id uuid primary key default gen_random_uuid(),
  lesson_key text not null,
  version integer not null,
  teacher_id uuid references auth.users(id) on delete set null,
  class_id uuid references public.teacher_classes(id) on delete set null,
  source text not null default 'teacher',
  model text,
  content jsonb not null,
  status public.lesson_status not null default 'draft',
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (lesson_key, version)
);

alter table public.teacher_classes enable row level security;
alter table public.teacher_class_members enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.recurring_lesson_plans enable row level security;
alter table public.lesson_versions enable row level security;

create policy "teachers manage own classes" on public.teacher_classes
for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create policy "students read joined classes" on public.teacher_classes
for select using (exists (select 1 from public.teacher_class_members m where m.class_id = id and m.student_id = auth.uid()));

create policy "teachers manage own memberships" on public.teacher_class_members
for all using (exists (select 1 from public.teacher_classes c where c.id = class_id and c.teacher_id = auth.uid()))
with check (exists (select 1 from public.teacher_classes c where c.id = class_id and c.teacher_id = auth.uid()));

create policy "students read own memberships" on public.teacher_class_members
for select using (student_id = auth.uid());

create policy "teachers manage own assignments" on public.assignments
for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create policy "students read class assignments" on public.assignments
for select using (exists (select 1 from public.teacher_class_members m where m.class_id = class_id and m.student_id = auth.uid()));

create policy "students manage own submissions" on public.assignment_submissions
for all using (student_id = auth.uid()) with check (student_id = auth.uid());

create policy "teachers read class submissions" on public.assignment_submissions
for select using (exists (
  select 1 from public.assignments a
  join public.teacher_classes c on c.id = a.class_id
  where a.id = assignment_id and c.teacher_id = auth.uid()
));

create policy "teachers manage recurring plans" on public.recurring_lesson_plans
for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

create policy "teachers manage lesson versions" on public.lesson_versions
for all using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
