-- OpiOpe V24.11: teacher assignments, student submissions, and teacher feedback.
create table if not exists public.teacher_assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  course_language text not null check (course_language in ('fi','sv')),
  cefr_level text not null default 'A0' check (cefr_level in ('A0','A1','A2','B1','B2','C1','C2')),
  title text not null check (char_length(title) between 2 and 160),
  instructions text not null default '' check (char_length(instructions) <= 8000),
  lesson_path text check (lesson_path is null or (char_length(lesson_path) <= 300 and lesson_path like '/%')),
  due_at timestamptz,
  status text not null default 'active' check (status in ('active','closed','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.teacher_assignments(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  answer_text text not null default '' check (char_length(answer_text) <= 12000),
  status text not null default 'submitted' check (status in ('submitted','reviewed')),
  score integer check (score is null or (score >= 0 and score <= 100)),
  teacher_feedback text check (teacher_feedback is null or char_length(teacher_feedback) <= 8000),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create index if not exists teacher_assignments_class_due_idx on public.teacher_assignments(class_id, due_at);
create index if not exists teacher_assignments_teacher_idx on public.teacher_assignments(teacher_id, created_at desc);
create index if not exists assignment_submissions_assignment_idx on public.assignment_submissions(assignment_id, submitted_at desc);
create index if not exists assignment_submissions_student_idx on public.assignment_submissions(student_id, submitted_at desc);

alter table public.teacher_assignments enable row level security;
alter table public.assignment_submissions enable row level security;

drop policy if exists "teacher reads own assignments" on public.teacher_assignments;
create policy "teacher reads own assignments" on public.teacher_assignments for select to authenticated using (
  teacher_id = auth.uid()
  and exists (select 1 from public.teacher_access ta where ta.user_id = auth.uid() and ta.status = 'active')
);

drop policy if exists "student reads class assignments" on public.teacher_assignments;
create policy "student reads class assignments" on public.teacher_assignments for select to authenticated using (
  status = 'active'
  and exists (
    select 1 from public.teacher_class_members cm
    where cm.class_id = teacher_assignments.class_id and cm.student_id = auth.uid()
  )
);

drop policy if exists "student reads own submissions" on public.assignment_submissions;
create policy "student reads own submissions" on public.assignment_submissions for select to authenticated using (student_id = auth.uid());

drop policy if exists "teacher reads assignment submissions" on public.assignment_submissions;
create policy "teacher reads assignment submissions" on public.assignment_submissions for select to authenticated using (
  exists (
    select 1 from public.teacher_assignments a
    where a.id = assignment_submissions.assignment_id and a.teacher_id = auth.uid()
  )
);

-- Mutations are intentionally server-only so role, class membership, deadlines and language are rechecked.
revoke insert, update, delete on public.teacher_assignments from anon, authenticated;
revoke insert, update, delete on public.assignment_submissions from anon, authenticated;

