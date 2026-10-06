-- =============================================================================
-- Mariam — Comprehensive School Management Platform
-- 0006_enrol_applicant.sql
--
-- US-A1: an administrator enrols an approved applicant into a class so they
-- become an active student with a registration ID.
--
-- Why one function and not four client-side writes: enrolment touches
-- students + profiles + enrollments + applications. Run as separate writes a
-- crash between them leaves a half-enrolled applicant (student row, still an
-- applicant role, no class). A single SECURITY DEFINER function runs in one
-- transaction — it either enrols completely or not at all.
--
-- Guards (all fail closed):
--   * caller must be an admin (checked inside, not trusted from the client);
--   * the application must exist and still be pending review
--     (submitted / under_review / interview — never twice, never after a
--     decision);
--   * the applicant must not already have a student row (double enrol);
--   * the target class must exist.
-- The admission number comes from generate_admission_number() (0005) via the
-- column default. Every enrolment is written to audit_log.
-- =============================================================================

create or replace function public.enrol_applicant(
  p_application_id uuid,
  p_class_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_applicant uuid;
  v_status application_status;
  v_student uuid;
begin
  if not public.is_admin() then
    raise exception 'Forbidden: enrolment requires the admin role.'
      using errcode = '42501';
  end if;

  select applicant_id, status
    into v_applicant, v_status
    from public.applications
   where id = p_application_id
   for update;

  if not found then
    raise exception 'Application % does not exist.', p_application_id
      using errcode = 'P0002';
  end if;

  if v_status not in ('submitted', 'under_review', 'interview') then
    raise exception 'Application % is already decided (%); it cannot be enrolled.', p_application_id, v_status
      using errcode = 'P0001';
  end if;

  if not exists (select 1 from public.classes where id = p_class_id) then
    raise exception 'Class % does not exist.', p_class_id
      using errcode = 'P0002';
  end if;

  if exists (select 1 from public.students where profile_id = v_applicant) then
    raise exception 'Applicant % already has a student record.', v_applicant
      using errcode = 'P0001';
  end if;

  insert into public.students (profile_id, class_id, admission_date)
  values (v_applicant, p_class_id, current_date)
  returning id into v_student;

  update public.profiles
     set role = 'student',
         updated_at = now()
   where id = v_applicant;

  insert into public.enrollments (student_id, class_id)
  values (v_student, p_class_id);

  update public.applications
     set status = 'accepted',
         reviewer_id = auth.uid(),
         decided_at = now(),
         updated_at = now()
   where id = p_application_id;

  insert into public.audit_log (actor_id, action, entity, entity_id, detail)
  values (
    auth.uid(),
    'application.enrolled',
    'students',
    v_student,
    jsonb_build_object('application_id', p_application_id, 'class_id', p_class_id)
  );

  return v_student;
end;
$$;
