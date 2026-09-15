-- OpiOpe V24.5: atomic teacher approval/rejection helpers.
-- These functions are callable only with the service-role key after the application layer
-- has already verified that the acting user is an OpiOpe admin.

create or replace function public.approve_teacher_application(
  p_user_id uuid,
  p_admin_user_id uuid
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  now_ts timestamptz := now();
  current_status text;
begin
  select status into current_status
  from public.teacher_applications
  where user_id = p_user_id
  for update;

  if current_status is null or current_status <> 'pending' then
    return false;
  end if;

  update public.profiles
    set role = 'teacher', account_mode = 'teacher', updated_at = now_ts
    where id = p_user_id;

  if not found then
    raise exception 'profile not found';
  end if;

  insert into public.teacher_access (
    user_id, status, mfa_required, approved_by, approved_at, updated_at
  ) values (
    p_user_id, 'active', true, p_admin_user_id, now_ts, now_ts
  )
  on conflict (user_id) do update
    set status = 'active',
        mfa_required = true,
        approved_by = excluded.approved_by,
        approved_at = excluded.approved_at,
        updated_at = excluded.updated_at;

  update public.teacher_applications
    set status = 'approved', reviewed_at = now_ts, reviewed_by = p_admin_user_id
    where user_id = p_user_id;

  insert into public.security_audit_log(actor_user_id, event_type, target_user_id)
    values (p_admin_user_id, 'teacher_application_approved', p_user_id);

  return true;
end;
$$;

create or replace function public.reject_teacher_application(
  p_user_id uuid,
  p_admin_user_id uuid
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  now_ts timestamptz := now();
  current_status text;
begin
  select status into current_status
  from public.teacher_applications
  where user_id = p_user_id
  for update;

  if current_status is null or current_status <> 'pending' then
    return false;
  end if;

  update public.teacher_applications
    set status = 'rejected', reviewed_at = now_ts, reviewed_by = p_admin_user_id
    where user_id = p_user_id;

  update public.profiles
    set role = 'student', account_mode = 'teacher_pending', updated_at = now_ts
    where id = p_user_id;

  update public.teacher_access
    set status = 'suspended', updated_at = now_ts
    where user_id = p_user_id;

  insert into public.security_audit_log(actor_user_id, event_type, target_user_id)
    values (p_admin_user_id, 'teacher_application_rejected', p_user_id);

  return true;
end;
$$;

revoke all on function public.approve_teacher_application(uuid, uuid) from public, anon, authenticated;
revoke all on function public.reject_teacher_application(uuid, uuid) from public, anon, authenticated;
grant execute on function public.approve_teacher_application(uuid, uuid) to service_role;
grant execute on function public.reject_teacher_application(uuid, uuid) to service_role;

