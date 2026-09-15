-- OpiOpe V24.5: bind every teacher class to one studied language.
alter table public.teacher_classes
  add column if not exists course_language text not null default 'fi';

alter table public.teacher_classes drop constraint if exists teacher_classes_course_language_check;
alter table public.teacher_classes
  add constraint teacher_classes_course_language_check check (course_language in ('fi','sv'));

create index if not exists teacher_classes_teacher_language_idx
  on public.teacher_classes(teacher_id, course_language, created_at desc);

