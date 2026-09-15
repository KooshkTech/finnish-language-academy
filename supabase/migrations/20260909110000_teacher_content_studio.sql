-- OpiOpe V21 teacher content studio
-- Teacher uploads are private and generated lesson content is draft-only until human review.

create table if not exists public.teacher_materials (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  storage_path text,
  original_name text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size > 0 and byte_size <= 15728640),
  language text not null check (language in ('fi','sv')),
  cefr_level text not null check (cefr_level in ('A0','A1','A2','B1','B2','C1','C2')),
  rights_confirmed boolean not null default false,
  status text not null default 'processing' check (status in ('processing','awaiting-processor','draft-ready','failed','archived')),
  failure_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teacher_lesson_drafts (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  material_id uuid references public.teacher_materials(id) on delete set null,
  language text not null check (language in ('fi','sv')),
  cefr_level text not null check (cefr_level in ('A0','A1','A2','B1','B2','C1','C2')),
  title text not null,
  source_excerpt text,
  draft_json jsonb not null,
  status text not null default 'review-required' check (status in ('review-required','approved','rejected','published','archived')),
  ai_model text,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teacher_materials_teacher_created_idx on public.teacher_materials(teacher_id, created_at desc);
create index if not exists teacher_lesson_drafts_teacher_created_idx on public.teacher_lesson_drafts(teacher_id, created_at desc);
create index if not exists teacher_lesson_drafts_status_idx on public.teacher_lesson_drafts(status, created_at desc);

alter table public.teacher_materials enable row level security;
alter table public.teacher_lesson_drafts enable row level security;

-- Read access for the owning approved teacher. Writes are performed through hardened server routes.
create policy "teacher reads own materials" on public.teacher_materials
for select to authenticated
using (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.teacher_access ta
    where ta.user_id = auth.uid() and ta.status = 'active'
  )
);

create policy "teacher reads own drafts" on public.teacher_lesson_drafts
for select to authenticated
using (
  teacher_id = auth.uid()
  and exists (
    select 1 from public.teacher_access ta
    where ta.user_id = auth.uid() and ta.status = 'active'
  )
);

revoke insert, update, delete on public.teacher_materials from anon, authenticated;
revoke insert, update, delete on public.teacher_lesson_drafts from anon, authenticated;

-- Private teacher-materials storage bucket. Object policies intentionally limited to owner folder + active teacher.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'teacher-materials', 'teacher-materials', false, 15728640,
  array['text/plain','text/markdown','application/pdf','image/png','image/jpeg','image/webp','audio/mpeg','audio/wav','audio/x-wav']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- No direct client upload policy. Uploads go through the MFA-protected server route using service_role.

