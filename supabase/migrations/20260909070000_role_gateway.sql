-- OpiOpe V20 role gateway
-- Adds stable login aliases and server-verifiable roles without trusting client state.

alter table public.profiles
  add column if not exists username text,
  add column if not exists role text not null default 'student';

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('student','teacher','admin'));

-- Existing user-owned profile RLS remains in force. Role elevation must be performed
-- only by trusted server/admin workflows, never by a client-side checkbox.

