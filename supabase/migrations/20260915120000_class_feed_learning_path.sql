-- OpiOpe V24.17: private class feed and student weekly learning goals.

alter table public.user_notifications drop constraint if exists user_notifications_notification_type_check;
alter table public.user_notifications add constraint user_notifications_notification_type_check
  check (notification_type in (
    'assignment_created','assignment_due_soon','assignment_overdue','submission_received','feedback_received',
    'class_invitation','class_announcement','class_message','class_session_scheduled','class_session_cancelled',
    'class_feed_post','class_feed_comment'
  ));

create table if not exists public.class_feed_posts (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  course_language text not null check (course_language in ('fi','sv')),
  post_type text not null default 'teacher_post' check (post_type in ('teacher_post','lesson','session','achievement')),
  title text not null check (char_length(title) between 2 and 180),
  body text not null check (char_length(body) between 1 and 4000),
  link_path text check (link_path is null or (char_length(link_path) <= 500 and link_path like '/%')),
  is_pinned boolean not null default false,
  comments_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists class_feed_posts_class_idx on public.class_feed_posts(class_id, is_pinned desc, created_at desc);

create table if not exists public.class_feed_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.class_feed_posts(id) on delete cascade,
  class_id uuid not null references public.teacher_classes(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists class_feed_comments_post_idx on public.class_feed_comments(post_id, created_at);

create table if not exists public.class_feed_reactions (
  post_id uuid not null references public.class_feed_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null default 'like' check (reaction in ('like')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.student_weekly_goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  target_minutes integer not null default 90 check (target_minutes between 10 and 1400),
  target_lessons integer not null default 3 check (target_lessons between 1 and 50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id, week_start)
);

alter table public.class_feed_posts enable row level security;
alter table public.class_feed_comments enable row level security;
alter table public.class_feed_reactions enable row level security;
alter table public.student_weekly_goals enable row level security;

grant select on public.class_feed_posts, public.class_feed_comments, public.class_feed_reactions to authenticated;
grant select, insert, update on public.student_weekly_goals to authenticated;
revoke insert, update, delete on public.class_feed_posts, public.class_feed_comments, public.class_feed_reactions from anon, authenticated;

create policy "class members read feed posts" on public.class_feed_posts for select to authenticated using (
  author_user_id = (select auth.uid()) or exists (
    select 1 from public.teacher_class_members m where m.class_id = class_feed_posts.class_id and m.student_id = (select auth.uid())
  )
);
create policy "class members read feed comments" on public.class_feed_comments for select to authenticated using (
  author_user_id = (select auth.uid()) or exists (
    select 1 from public.teacher_class_members m where m.class_id = class_feed_comments.class_id and m.student_id = (select auth.uid())
  )
);
create policy "class members read feed reactions" on public.class_feed_reactions for select to authenticated using (
  user_id = (select auth.uid()) or exists (
    select 1 from public.class_feed_posts p join public.teacher_class_members m on m.class_id = p.class_id
    where p.id = class_feed_reactions.post_id and m.student_id = (select auth.uid())
  )
);
create policy "students manage own weekly goals" on public.student_weekly_goals for all to authenticated
  using (student_id = (select auth.uid())) with check (student_id = (select auth.uid()));


