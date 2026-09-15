-- OpiOpe V24.4.3: complete the teacher application/approval data flow.
-- Teacher signup always starts as a student-role profile with account_mode=teacher_pending.
-- Only a trusted admin server workflow may promote the role and activate teacher_access.

alter table public.teacher_applications
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null;

create index if not exists teacher_applications_status_created_idx
  on public.teacher_applications(status, created_at desc);

-- Owners may see only their own application status. Mutations remain service-role only.
drop policy if exists teacher_applications_owner_select on public.teacher_applications;
create policy teacher_applications_owner_select on public.teacher_applications
for select to authenticated using (auth.uid() = user_id);

revoke insert, update, delete on public.teacher_applications from anon, authenticated;

-- Re-assert the auth trigger because older databases may have applied migrations selectively.
drop trigger if exists on_auth_user_created_opiope on auth.users;
create trigger on_auth_user_created_opiope
  after insert on auth.users
  for each row execute function public.handle_new_student_user();

