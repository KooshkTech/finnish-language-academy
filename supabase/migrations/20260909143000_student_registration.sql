-- OpiOpe V22.1 student registration
-- Creates a student profile from trusted auth metadata while forcing role=student.

create or replace function public.handle_new_student_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
  requested_name text;
begin
  requested_username := lower(trim(coalesce(new.raw_user_meta_data->>'username', '')));
  requested_name := nullif(trim(coalesce(new.raw_user_meta_data->>'display_name', '')), '');

  if requested_username = '' or requested_username !~ '^[a-z0-9._-]{3,32}$' then
    raise exception 'invalid username';
  end if;

  insert into public.profiles (id, display_name, username, role, created_at, updated_at)
  values (new.id, coalesce(requested_name, requested_username), requested_username, 'student', now(), now())
  on conflict (id) do update
    set display_name = excluded.display_name,
        username = excluded.username,
        role = 'student',
        updated_at = now();

  return new;
end;
$$;

-- Replace only OpiOpe's own trigger name; leave unrelated auth triggers untouched.
drop trigger if exists on_auth_user_created_opiope on auth.users;
create trigger on_auth_user_created_opiope
  after insert on auth.users
  for each row execute function public.handle_new_student_user();

revoke all on function public.handle_new_student_user() from public;

