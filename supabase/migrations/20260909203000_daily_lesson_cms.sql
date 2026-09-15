-- OpiOpe V23 Daily Lesson CMS + scheduled publishing
-- Writes are server-only; teachers must pass server role checks + MFA.

create table if not exists public.teacher_classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  join_code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teacher_class_members (
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table if not exists public.teacher_lesson_publications (
  id uuid primary key default gen_random_uuid(),
  draft_id uuid not null unique references public.teacher_lesson_drafts(id) on delete cascade,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  language text not null check (language in ('fi','sv')),
  cefr_level text not null check (cefr_level in ('A0','A1','A2','B1','B2','C1','C2')),
  skill text not null check (skill in ('speaking','listening','reading','writing','understanding','vocabulary','yki-test','mixed')),
  title text not null,
  objective text not null default '',
  lesson_json jsonb not null,
  status text not null default 'scheduled' check (status in ('scheduled','published','unpublished','archived')),
  audience text not null default 'public' check (audience in ('public','class','student')),
  target_class_id uuid references public.teacher_classes(id) on delete set null,
  target_student_id uuid references auth.users(id) on delete set null,
  publish_at timestamptz not null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lesson_audience_target_check check (
    (audience = 'public' and target_class_id is null and target_student_id is null)
    or (audience = 'class' and target_class_id is not null and target_student_id is null)
    or (audience = 'student' and target_student_id is not null and target_class_id is null)
  )
);

create index if not exists teacher_classes_teacher_idx on public.teacher_classes(teacher_id, created_at desc);
create index if not exists teacher_class_members_student_idx on public.teacher_class_members(student_id, joined_at desc);
create index if not exists teacher_lesson_publications_teacher_idx on public.teacher_lesson_publications(teacher_id, publish_at desc);
create index if not exists teacher_lesson_publications_public_idx on public.teacher_lesson_publications(status, audience, publish_at desc);
create index if not exists teacher_lesson_publications_class_idx on public.teacher_lesson_publications(target_class_id, publish_at desc) where target_class_id is not null;
create index if not exists teacher_lesson_publications_student_idx on public.teacher_lesson_publications(target_student_id, publish_at desc) where target_student_id is not null;

alter table public.teacher_classes enable row level security;
alter table public.teacher_class_members enable row level security;
alter table public.teacher_lesson_publications enable row level security;

create policy "teacher reads own classes" on public.teacher_classes
for select to authenticated using (
  teacher_id = auth.uid()
  and exists (select 1 from public.teacher_access ta where ta.user_id = auth.uid() and ta.status = 'active')
);

create policy "student reads own memberships" on public.teacher_class_members
for select to authenticated using (student_id = auth.uid());

create policy "teacher reads class memberships" on public.teacher_class_members
for select to authenticated using (
  exists (
    select 1 from public.teacher_classes tc
    where tc.id = class_id and tc.teacher_id = auth.uid()
  )
);

-- Public lessons become visible automatically when publish_at arrives. A cron job is not required.
create policy "public reads due public lessons" on public.teacher_lesson_publications
for select to anon, authenticated using (
  audience = 'public'
  and status in ('scheduled','published')
  and publish_at <= now()
);

create policy "students read direct due lessons" on public.teacher_lesson_publications
for select to authenticated using (
  audience = 'student'
  and target_student_id = auth.uid()
  and status in ('scheduled','published')
  and publish_at <= now()
);

create policy "students read class due lessons" on public.teacher_lesson_publications
for select to authenticated using (
  audience = 'class'
  and status in ('scheduled','published')
  and publish_at <= now()
  and exists (
    select 1 from public.teacher_class_members cm
    where cm.class_id = target_class_id and cm.student_id = auth.uid()
  )
);

create policy "teacher reads own publications" on public.teacher_lesson_publications
for select to authenticated using (
  teacher_id = auth.uid()
  and exists (select 1 from public.teacher_access ta where ta.user_id = auth.uid() and ta.status = 'active')
);

-- Mutations go through hardened server routes only.
revoke insert, update, delete on public.teacher_classes from anon, authenticated;
revoke insert, update, delete on public.teacher_class_members from anon, authenticated;
revoke insert, update, delete on public.teacher_lesson_publications from anon, authenticated;

