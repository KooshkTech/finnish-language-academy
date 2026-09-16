-- OpiOpe V16 dictionary, age profile, uploads, voice and arcade foundation

create table if not exists public.learning_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  age_tier text not null default 'adult' check (age_tier in ('kids','youth','adult')),
  selected_mascot text check (selected_mascot is null or selected_mascot in ('bear','fox','owl')),
  learning_language text not null default 'fi' check (learning_language in ('fi','sv')),
  cefr_level text not null default 'A0' check (cefr_level in ('A0','A1','A2','B1','B2','C1','C2')),
  intensity text not null default 'casual' check (intensity in ('casual','intensive','exam-sprint')),
  speech_rate numeric(3,2) not null default 1.00 check (speech_rate in (0.50,0.75,1.00,1.25)),
  auto_listen boolean not null default false,
  ai_voice_model text not null default 'academic-pro' check (ai_voice_model in ('warm-teacher','friendly-mascot','academic-pro')),
  updated_at timestamptz not null default now()
);

create table if not exists public.dictionary_bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  dictionary_entry_id text not null,
  created_at timestamptz not null default now(),
  unique(user_id, dictionary_entry_id)
);

create table if not exists public.learner_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  byte_size bigint not null check (byte_size > 0 and byte_size <= 15728640),
  learning_context text,
  processing_status text not null default 'stored' check (processing_status in ('stored','processing','processed','processor-not-configured','failed')),
  extracted_text text,
  created_at timestamptz not null default now()
);
create index if not exists learner_uploads_user_created_idx on public.learner_uploads(user_id, created_at desc);

create table if not exists public.assessment_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module_route text not null,
  percentage integer not null check (percentage between 0 and 100),
  letter_grade text not null check (letter_grade in ('A','B','C','D','E','F')),
  practice_band text not null check (practice_band in ('A0','A1','A2','B1','B2','C1','C2')),
  item_results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists assessment_reports_user_created_idx on public.assessment_reports(user_id, created_at desc);

create table if not exists public.voice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_language text not null check (learning_language in ('fi','sv')),
  prompt_text text not null,
  transcript text,
  storage_path text,
  provider_name text,
  pronunciation_score numeric(5,2) check (pronunciation_score is null or pronunciation_score between 0 and 100),
  pronunciation_details jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.live_quiz_rooms (
  id uuid primary key default gen_random_uuid(),
  game_pin text not null unique,
  host_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting','active','finished')),
  current_question_index integer not null default 0 check (current_question_index >= 0),
  time_per_question_seconds integer not null default 20 check (time_per_question_seconds between 5 and 180),
  created_at timestamptz not null default now(),
  ended_at timestamptz
);
create index if not exists live_quiz_rooms_host_idx on public.live_quiz_rooms(host_user_id, created_at desc);

create table if not exists public.live_quiz_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.live_quiz_rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  nickname text not null check (char_length(nickname) between 1 and 24),
  score integer not null default 0 check (score >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  last_answer_correct boolean,
  joined_at timestamptz not null default now()
);
create index if not exists live_quiz_players_room_idx on public.live_quiz_players(room_id, score desc);

alter table public.learning_profiles enable row level security;
alter table public.dictionary_bookmarks enable row level security;
alter table public.learner_uploads enable row level security;
alter table public.assessment_reports enable row level security;
alter table public.voice_attempts enable row level security;
alter table public.live_quiz_rooms enable row level security;
alter table public.live_quiz_players enable row level security;

drop policy if exists "learning profiles own row" on public.learning_profiles;
create policy "learning profiles own row" on public.learning_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "dictionary bookmarks own rows" on public.dictionary_bookmarks;
create policy "dictionary bookmarks own rows" on public.dictionary_bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "learner uploads own rows" on public.learner_uploads;
create policy "learner uploads own rows" on public.learner_uploads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "assessment reports own rows" on public.assessment_reports;
create policy "assessment reports own rows" on public.assessment_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "voice attempts own rows" on public.voice_attempts;
create policy "voice attempts own rows" on public.voice_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "quiz hosts own rooms" on public.live_quiz_rooms;
create policy "quiz hosts own rooms" on public.live_quiz_rooms for all using (auth.uid() = host_user_id) with check (auth.uid() = host_user_id);

-- Players are intentionally host-readable only in V16. Guest joins require a dedicated server-authoritative RPC/edge function before production.
drop policy if exists "quiz hosts read players" on public.live_quiz_players;
create policy "quiz hosts read players" on public.live_quiz_players for select using (
  exists (select 1 from public.live_quiz_rooms room where room.id = room_id and room.host_user_id = auth.uid())
);

-- Private learner upload bucket. Safe to run repeatedly.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('learner-uploads','learner-uploads',false,15728640,array['application/pdf','image/png','image/jpeg','image/webp','audio/mpeg','audio/wav','audio/x-wav'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "learner uploads insert own folder" on storage.objects;
create policy "learner uploads insert own folder" on storage.objects for insert to authenticated with check (
  bucket_id = 'learner-uploads' and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "learner uploads read own folder" on storage.objects;
create policy "learner uploads read own folder" on storage.objects for select to authenticated using (
  bucket_id = 'learner-uploads' and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "learner uploads delete own folder" on storage.objects;
create policy "learner uploads delete own folder" on storage.objects for delete to authenticated using (
  bucket_id = 'learner-uploads' and (storage.foldername(name))[1] = auth.uid()::text
);

alter table public.learning_profiles add column if not exists timezone text not null default 'Europe/Helsinki';
alter table public.weekly_assignments add column if not exists penalty_applied boolean not null default false;

alter table public.weekly_assignments drop constraint if exists weekly_assignments_assigned_module_check;
alter table public.weekly_assignments add constraint weekly_assignments_assigned_module_check check (assigned_module in ('/dictionary','/voice-lab','/arcade','/listening','/reading','/writing','/speaking','/understanding','/vocabulary','/yki-test','/ai-tutor'));

alter table public.live_quiz_rooms add column if not exists questions jsonb not null default '[]'::jsonb;
alter table public.live_quiz_rooms add column if not exists question_started_at timestamptz;

create table if not exists public.live_quiz_answers (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.live_quiz_rooms(id) on delete cascade,
  player_id uuid not null references public.live_quiz_players(id) on delete cascade,
  question_index integer not null check (question_index >= 0),
  option_index integer not null check (option_index between 0 and 3),
  is_correct boolean not null,
  points_awarded integer not null default 0 check (points_awarded >= 0),
  answered_at timestamptz not null default now(),
  unique(room_id, player_id, question_index)
);
alter table public.live_quiz_answers enable row level security;

create or replace function public.is_quiz_room_member(target_room uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(select 1 from public.live_quiz_rooms r where r.id = target_room and r.host_user_id = auth.uid())
      or exists(select 1 from public.live_quiz_players p where p.room_id = target_room and p.user_id = auth.uid());
$$;
revoke all on function public.is_quiz_room_member(uuid) from public;
grant execute on function public.is_quiz_room_member(uuid) to authenticated;

drop policy if exists "quiz room members read room" on public.live_quiz_rooms;
create policy "quiz room members read room" on public.live_quiz_rooms for select to authenticated using (public.is_quiz_room_member(id));

drop policy if exists "quiz room members read players" on public.live_quiz_players;
create policy "quiz room members read players" on public.live_quiz_players for select to authenticated using (public.is_quiz_room_member(room_id));

drop policy if exists "quiz room members read answers" on public.live_quiz_answers;
create policy "quiz room members read answers" on public.live_quiz_answers for select to authenticated using (public.is_quiz_room_member(room_id));

-- Enable realtime events once per table in Supabase.
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='live_quiz_rooms') then
    alter publication supabase_realtime add table public.live_quiz_rooms;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='live_quiz_players') then
    alter publication supabase_realtime add table public.live_quiz_players;
  end if;
end $$;
alter table public.weekly_assignments add column if not exists is_mandatory boolean not null default true;
update public.weekly_assignments set is_mandatory = false where day_of_week = 'SUN';

