-- OpiOpe V24.10 — language-aware review + richer mistake history.

alter table public.vocabulary_progress
  add column if not exists learning_language text not null default 'fi';

alter table public.vocabulary_progress
  drop constraint if exists vocabulary_progress_learning_language_check;
alter table public.vocabulary_progress
  add constraint vocabulary_progress_learning_language_check
  check (learning_language in ('fi','sv'));

alter table public.vocabulary_progress
  drop constraint if exists vocabulary_progress_user_id_word_key;
alter table public.vocabulary_progress
  add constraint vocabulary_progress_user_language_word_key
  unique (user_id, learning_language, word);

create index if not exists vocabulary_progress_user_language_due_idx
  on public.vocabulary_progress(user_id, learning_language, next_review);

alter table public.exercise_attempts
  add column if not exists learning_language text,
  add column if not exists question_text text,
  add column if not exists correct_answer text;

update public.exercise_attempts
set learning_language = case
  when lesson_slug like 'sv:%' then 'sv'
  when lesson_slug like 'fi:%' then 'fi'
  else learning_language
end
where learning_language is null;

alter table public.exercise_attempts
  drop constraint if exists exercise_attempts_learning_language_check;
alter table public.exercise_attempts
  add constraint exercise_attempts_learning_language_check
  check (learning_language is null or learning_language in ('fi','sv'));

create index if not exists exercise_attempts_user_language_wrong_idx
  on public.exercise_attempts(user_id, learning_language, attempted_at desc)
  where is_correct = false;

