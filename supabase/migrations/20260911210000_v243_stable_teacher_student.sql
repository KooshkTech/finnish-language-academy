-- OpiOpe V24.3 stable upgrade: student profile fields, class metadata, recurring lesson plans and teacher-authorized learner analytics.
alter table public.profiles
  add column if not exists ui_language text not null default 'fi' check (ui_language in ('fi','sv')),
  add column if not exists target_language text not null default 'fi' check (target_language in ('fi','sv')),
  add column if not exists current_level text default 'A0',
  add column if not exists learning_goal text;

alter table public.teacher_classes
  add column if not exists class_type text not null default 'general' check (class_type in ('general','swedish','yki','work','integration')),
  add column if not exists cefr_level text not null default 'A0' check (cefr_level in ('A0','A1','A2','B1','B2','C1','C2')),
  add column if not exists is_active boolean not null default true;

create table if not exists public.recurring_lesson_plans (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid references public.teacher_classes(id) on delete cascade,
  target_language text not null check (target_language in ('fi','sv')),
  cefr_level text not null check (cefr_level in ('A0','A1','A2','B1','B2','C1','C2')),
  topic text not null,
  skill_focus text[] not null default '{}',
  frequency text not null default 'manual' check (frequency in ('manual','daily','weekly','monthly','yearly')),
  next_run_at timestamptz,
  last_run_at timestamptz,
  is_active boolean not null default true,
  requires_teacher_approval boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_versions (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid references public.teacher_lesson_drafts(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  version integer not null,
  content jsonb not null,
  status text not null default 'draft' check (status in ('draft','review','approved','scheduled','published','archived')),
  ai_model text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique(draft_id, version)
);

alter table public.recurring_lesson_plans enable row level security;
alter table public.lesson_versions enable row level security;

drop policy if exists "teacher reads own recurring plans" on public.recurring_lesson_plans;
create policy "teacher reads own recurring plans" on public.recurring_lesson_plans for select to authenticated using (teacher_id = auth.uid());

drop policy if exists "teacher reads own lesson versions" on public.lesson_versions;
create policy "teacher reads own lesson versions" on public.lesson_versions for select to authenticated using (teacher_id = auth.uid());

-- Teacher analytics access is limited to students who are members of the teacher's own classes.
drop policy if exists "teacher reads assigned lesson progress" on public.lesson_progress;
create policy "teacher reads assigned lesson progress" on public.lesson_progress for select to authenticated using (
  exists (select 1 from public.teacher_class_members m join public.teacher_classes c on c.id=m.class_id where m.student_id=user_id and c.teacher_id=auth.uid())
);

drop policy if exists "teacher reads assigned exercise attempts" on public.exercise_attempts;
create policy "teacher reads assigned exercise attempts" on public.exercise_attempts for select to authenticated using (
  exists (select 1 from public.teacher_class_members m join public.teacher_classes c on c.id=m.class_id where m.student_id=user_id and c.teacher_id=auth.uid())
);

revoke insert, update, delete on public.recurring_lesson_plans from anon, authenticated;
revoke insert, update, delete on public.lesson_versions from anon, authenticated;

