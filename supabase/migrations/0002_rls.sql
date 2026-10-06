-- =============================================================================
-- Mariam — Row Level Security
-- 0002_rls.sql
--
-- Every policy is written so the decision is made from data the caller cannot
-- forge: the caller is identified by auth.uid(), never by a column they supply.
--
-- Helper functions are SECURITY DEFINER with a pinned search_path. This is
-- required, not stylistic: a policy on `profiles` that reads `profiles` through
-- a non-definer function would recurse, and Postgres would either error or,
-- worse, evaluate the predicate against an empty set.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

create or replace function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() = 'admin', false);
$$;

create or replace function public.is_facilitator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() = 'facilitator', false);
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() in ('admin', 'facilitator');
$$;

create or replace function public.my_student_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select student_id from public.profiles where id = auth.uid();
$$;

create or replace function public.my_staff_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select staff_id from public.profiles where id = auth.uid();
$$;

/** True when the caller is the student's parent/guardian. */
create or replace function public.is_guardian_of(target_student uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.guardianships g
     where g.guardian_id = auth.uid()
       and g.student_id = target_student
  );
$$;

/** True when the caller is the student themself. */
create or replace function public.is_self_student(target_student uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.my_student_id() = target_student;
$$;

/** Students a parent/guardian or the student themself may read. */
create or replace function public.can_read_student(target_student uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_staff()
      or public.is_guardian_of(target_student)
      or public.is_self_student(target_student);
$$;

/** Does the caller teach the given class (directly or as homeroom teacher)? */
create or replace function public.teaches_class(target_class uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.class_subjects cs
      join public.profiles p on p.staff_id = cs.staff_id
     where cs.class_id = target_class
       and p.id = auth.uid()
  )
  or exists (
    select 1
      from public.classes c
      join public.profiles p on p.staff_id = c.homeroom_staff_id
     where c.id = target_class
       and p.id = auth.uid()
  );
$$;

/** Staff may write a class's academic data only if they teach it. Admins may always. */
create or replace function public.can_manage_class(target_class uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin() or public.teaches_class(target_class);
$$;

-- =============================================================================
-- Enable RLS everywhere
-- =============================================================================

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'staff', 'students', 'guardianships',
    'academic_sessions', 'classes', 'subjects', 'class_subjects', 'terms', 'enrollments',
    'attendance_records', 'assessments', 'grades',
    'fee_structures', 'fee_items', 'invoices', 'payments',
    'applications', 'announcements', 'messages', 'resources',
    'complaints', 'complaint_updates',
    'anonymous_reports', 'report_audit_log',
    'discipline_records', 'audit_log'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end;
$$;

-- Idempotency: a failed or repeated run must not collide with policies an
-- earlier run already created. Drop ours first, then recreate below. (The
-- Supabase SQL editor does not roll a failed script back, so a fix-and-rerun
-- would otherwise die on "policy already exists".)
do $$
declare
  r record;
begin
  for r in
    select policyname, tablename from pg_policies
     where schemaname = 'public'
       and tablename in (
         'profiles', 'staff', 'students', 'guardianships',
         'academic_sessions', 'classes', 'subjects', 'class_subjects', 'terms', 'enrollments',
         'attendance_records', 'assessments', 'grades',
         'fee_structures', 'fee_items', 'invoices', 'payments',
         'applications', 'announcements', 'messages', 'resources',
         'complaints', 'complaint_updates',
         'anonymous_reports', 'report_audit_log',
         'discipline_records', 'audit_log'
       )
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end;
$$;

-- Nobody may write the audit trail directly; inserts go through SECURITY DEFINER
-- functions only.
alter table public.audit_log enable row level security;

-- =============================================================================
-- profiles
-- =============================================================================

create policy profiles_select_self on public.profiles
  for select using (id = auth.uid() or public.is_staff());

-- Staff need to resolve names when reading guardianship/rosters.
create policy profiles_select_guardian_network on public.profiles
  for select using (
    public.current_role() = 'parent'
    and exists (
      select 1
        from public.guardianships mine
        join public.guardianships theirs on theirs.guardian_id = public.profiles.id
       where mine.guardian_id = auth.uid()
         and theirs.student_id = mine.student_id
    )
  );

-- A user may only ever change their own row, and may not promote themselves.
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_role());

create policy profiles_admin_write on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- staff
-- =============================================================================

-- Staff read the staff directory. A parent additionally needs the names of the
-- teachers attached to their own child(s) to make sense of grades and reports.
create policy staff_select on public.staff
  for select using (
    public.is_staff()
    or exists (
      select 1
        from public.guardianships g
        join public.students st    on st.id = g.student_id
        join public.class_subjects cs on cs.class_id = st.class_id
       where g.guardian_id = auth.uid()
         and cs.staff_id = staff.id
    )
  );

create policy staff_admin_write on public.staff
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- students
-- =============================================================================

-- Single policy: staff see all students; everyone else sees only their own
-- children or themselves.
create policy students_select on public.students
  for select using (public.can_read_student(id));

create policy students_admin_write on public.students
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- guardianships
-- =============================================================================

create policy guardianships_select on public.guardianships
  for select using (
    public.is_staff() or guardian_id = auth.uid() or public.is_guardian_of(student_id)
  );

create policy guardianships_admin_write on public.guardianships
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- Academic structure — largely reference data, readable when signed in
-- =============================================================================

create policy academic_sessions_read on public.academic_sessions
  for select using (auth.uid() is not null);
create policy academic_sessions_admin_write on public.academic_sessions
  for all using (public.is_admin()) with check (public.is_admin());

create policy classes_read on public.classes
  for select using (auth.uid() is not null);
create policy classes_admin_write on public.classes
  for all using (public.is_admin()) with check (public.is_admin());

create policy subjects_read on public.subjects
  for select using (auth.uid() is not null);
create policy subjects_admin_write on public.subjects
  for all using (public.is_admin()) with check (public.is_admin());

create policy class_subjects_read on public.class_subjects
  for select using (auth.uid() is not null);
create policy class_subjects_write on public.class_subjects
  for all using (public.is_admin()) with check (public.is_admin());

create policy terms_read on public.terms
  for select using (auth.uid() is not null);
create policy terms_admin_write on public.terms
  for all using (public.is_admin()) with check (public.is_admin());

create policy enrollments_read on public.enrollments
  for select using (
    public.is_staff() or public.can_read_student(student_id)
  );
create policy enrollments_admin_write on public.enrollments
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- Attendance & grades
-- =============================================================================

create policy attendance_read on public.attendance_records
  for select using (public.can_read_student(student_id));

create policy attendance_write on public.attendance_records
  for all using (public.can_manage_class(class_id))
  with check (public.can_manage_class(class_id));

-- Assessment briefs are staff working documents: the question papers, mark
-- schemes and weightings. Grades are the student-facing artefact, and those are
-- governed by grades_read. Letting any signed-in role read the briefs would leak
-- upcoming questions to students and parents.
create policy assessments_read on public.assessments
  for select using (public.is_staff() or public.can_manage_class(class_id));

create policy assessments_write on public.assessments
  for all using (public.can_manage_class(class_id))
  with check (public.can_manage_class(class_id));

create policy grades_read on public.grades
  for select using (public.can_read_student(student_id));

create policy grades_write on public.grades
  for all using (
    exists (
      select 1 from public.assessments a
       where a.id = grades.assessment_id
         and public.can_manage_class(a.class_id)
    )
  )
  with check (
    exists (
      select 1 from public.assessments a
       where a.id = grades.assessment_id
         and public.can_manage_class(a.class_id)
    )
  );

-- =============================================================================
-- Fees & payments
-- =============================================================================

-- Price lists are reference data, but they are still the school's commercial
-- terms. Signed-in roles only.
create policy fee_structures_read on public.fee_structures
  for select using (auth.uid() is not null);
create policy fee_structures_admin_write on public.fee_structures
  for all using (public.is_admin()) with check (public.is_admin());

create policy fee_items_read on public.fee_items
  for select using (auth.uid() is not null);
create policy fee_items_admin_write on public.fee_items
  for all using (public.is_admin()) with check (public.is_admin());

create policy invoices_read on public.invoices
  for select using (public.can_read_student(student_id));

create policy invoices_admin_write on public.invoices
  for all using (public.is_admin()) with check (public.is_admin());

create policy payments_read on public.payments
  for select using (public.can_read_student(student_id));

-- Only administrators/bursars record money. Facilitators cannot.
create policy payments_record on public.payments
  for insert with check (public.is_admin());

-- Payments are financial records: no updates, no deletes. A correction is a new
-- payment plus an explicit reversal, both audited.
create policy payments_no_mutation on public.payments
  for update using (false) with check (false);
create policy payments_no_delete on public.payments
  for delete using (false);

-- =============================================================================
-- Applications
-- =============================================================================

create policy applications_read_own on public.applications
  for select using (applicant_id = auth.uid());

create policy applications_review on public.applications
  for select using (public.is_admin());

create policy applications_submit on public.applications
  for insert with check (applicant_id = auth.uid());

-- Applicants may only edit while still in draft/submitted, never after review.
create policy applications_update_own on public.applications
  for update using (applicant_id = auth.uid() and status in ('draft', 'submitted'))
  with check (applicant_id = auth.uid() and status in ('draft', 'submitted'));

create policy applications_admin_write on public.applications
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- Announcements
-- =============================================================================

create policy announcements_read on public.announcements
  for select using (
    auth.uid() is not null
    and publish_at <= now()
    and (expires_at is null or expires_at > now())
    and (
      audience = 'all'
      or public.is_staff()
      or (audience = 'students' and public.current_role() = 'student')
      or (audience = 'parents'  and public.current_role() = 'parent')
      or (audience = 'applicants' and public.current_role() = 'applicant')
    )
  );

create policy announcements_write on public.announcements
  for all using (public.is_staff()) with check (public.is_staff());

-- =============================================================================
-- Direct messages
-- =============================================================================

-- Only the two endpoints of a conversation can read it.
create policy messages_read on public.messages
  for select using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy messages_send on public.messages
  for insert with check (
    sender_id = auth.uid()
    and public.current_role() <> 'applicant'
  );

-- Only the recipient may flip read_at. Column-level grants confine the update
-- to that one column, because a `with check` cannot compare the old row against
-- the new one and so cannot by itself stop `body` being rewritten.
create policy messages_mark_read on public.messages
  for update
  using (recipient_id = auth.uid() and read_at is null)
  with check (recipient_id = auth.uid());

revoke update on public.messages from anon, authenticated;
grant update (read_at) on public.messages to authenticated;

-- =============================================================================
-- Learning resources
-- =============================================================================

create policy resources_read on public.resources
  for select using (
    auth.uid() is not null
    and (
      public.is_staff()
      or case visibility
           when 'public'     then true
           when 'parents'    then public.current_role() = 'parent'
           when 'students'   then public.current_role() = 'student'
           when 'staff_only' then false
           else false
         end
    )
  );

create policy resources_write on public.resources
  for all using (
    public.is_admin()
    or (public.is_facilitator() and exists (
      select 1 from public.class_subjects cs
       where cs.class_id = resources.class_id and cs.staff_id = public.my_staff_id()
    ))
  )
  with check (
    public.is_admin()
    or (public.is_facilitator() and exists (
      select 1 from public.class_subjects cs
       where cs.class_id = resources.class_id and cs.staff_id = public.my_staff_id()
    ))
  );

-- =============================================================================
-- Complaints
-- =============================================================================

-- Staff triage; the submitter tracks their own ticket. Anonymous complaints are
-- visible to staff only, and to nobody else — including the reporter.
create policy complaints_read on public.complaints
  for select using (
    public.is_staff() or submitted_by = auth.uid()
  );

create policy complaints_submit_authenticated on public.complaints
  for insert with check (
    (not is_anonymous and submitted_by = auth.uid())
  );

create policy complaints_update_staff on public.complaints
  for update using (public.is_staff()) with check (public.is_staff());

create policy complaints_delete_admin on public.complaints
  for delete using (public.is_admin());

create policy complaint_updates_read on public.complaint_updates
  for select using (
    public.is_staff()
    or exists (
      select 1 from public.complaints c
       where c.id = complaint_updates.complaint_id
         and c.submitted_by = auth.uid()
         and not complaint_updates.is_internal
    )
  );

create policy complaint_updates_write on public.complaint_updates
  for insert with check (public.is_staff() and author_id = auth.uid());

-- =============================================================================
-- Anonymous reports
-- =============================================================================

-- Reports are visible to admins and to facilitators assigned to investigate.
-- No applicant or student role can enumerate the table.
create policy anonymous_reports_read on public.anonymous_reports
  for select using (public.is_admin() or assigned_to = auth.uid());

-- Submission is deliberately NOT exposed as a table insert. `with check (true)`
-- would let any client write `status`, `assigned_to` and `outcome` directly,
-- forging triage state and skipping the report_audit_log entry that
-- submit_anonymous_report() guarantees. Table INSERT is revoked below so the
-- SECURITY DEFINER function is the only writer.

create policy anonymous_reports_investigate on public.anonymous_reports
  for update using (public.is_admin() or assigned_to = auth.uid())
  with check (public.is_admin() or assigned_to = auth.uid());

create policy report_audit_log_read on public.report_audit_log
  for select using (public.is_staff());
create policy report_audit_log_append on public.report_audit_log
  for insert with check (public.is_staff());

-- =============================================================================
-- Discipline
-- =============================================================================

create policy discipline_read on public.discipline_records
  for select using (
    public.is_admin()
    or student_id = public.my_student_id()
    or public.is_guardian_of(student_id)
    or exists (
      select 1 from public.discipline_records d
      join public.students st on st.id = d.student_id
      join public.class_subjects cs on cs.class_id = st.class_id
      join public.profiles p on p.staff_id = cs.staff_id
      where d.id = discipline_records.id and p.id = auth.uid()
    )
  );

create policy discipline_record on public.discipline_records
  for insert with check (public.is_staff());

create policy discipline_update on public.discipline_records
  for update using (public.is_admin() or reported_by = auth.uid())
  with check (public.is_admin() or reported_by = auth.uid());

-- =============================================================================
-- Audit log
-- =============================================================================

create policy audit_log_read on public.audit_log
  for select using (public.is_admin());

-- =============================================================================
-- Public: an applicant may submit a report without an account, so this insert
-- runs as SECURITY DEFINER and strips any caller-supplied actor.
-- =============================================================================

create or replace function public.submit_anonymous_report(
  p_reference_code      text,
  p_contact_token_hash  text,
  p_category            text,
  p_body                text,
  p_incident_date       date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  insert into public.anonymous_reports
    (reference_code, contact_token_hash, category, body, incident_date)
  values
    (p_reference_code, p_contact_token_hash, p_category, p_body, p_incident_date)
  returning id into new_id;

  insert into public.report_audit_log (report_id, action, note)
  values (new_id, 'submitted', null);

  return new_id;
end;
$$;

revoke all on function public.submit_anonymous_report(text, text, text, text, date) from public;
grant execute on function public.submit_anonymous_report(text, text, text, text, date) to anon, authenticated;

-- Close the direct-write path into anonymous_reports. The RPC above runs as the
-- function owner (SECURITY DEFINER) and is unaffected by this revoke.
revoke insert on public.anonymous_reports from anon, authenticated;
