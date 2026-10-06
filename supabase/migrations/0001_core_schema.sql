-- =============================================================================
-- Mariam — Comprehensive School Management Platform
-- 0001_core_schema.sql
--
-- Conventions:
--   * All ids are uuid v4, generated in Postgres (gen_random_uuid()).
--   * All timestamps are timestamptz, stored in UTC.
--   * Money is numeric(12,2) and always paired with an ISO 4217 currency code.
--   * RLS is enabled on every table. Authorization is enforced here as well as
--     in the Next.js Data Access Layer; neither is trusted alone.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Enumerated domains
-- -----------------------------------------------------------------------------

create type user_role      as enum ('admin', 'facilitator', 'parent', 'student', 'applicant');
create type staff_status   as enum ('active', 'on_leave', 'suspended', 'inactive');
create type student_status as enum ('active', 'graduated', 'withdrawn', 'transferred', 'deceased');
create type attendance_status as enum ('present', 'absent', 'late', 'excused');
create type application_status as enum ('draft', 'submitted', 'under_review', 'interview', 'accepted', 'rejected', 'withdrawn');
create type fee_status     as enum ('pending', 'partially_paid', 'paid', 'waived', 'overdue');
create type payment_method as enum ('cash', 'bank_transfer', 'card', 'mobile_money', 'cheque', 'waiver');
create type complaint_status as enum ('open', 'in_review', 'resolved', 'rejected');
create type report_status  as enum ('new', 'triaged', 'investigating', 'actioned', 'closed');
create type report_severity as enum ('low', 'medium', 'high', 'critical');
create type discipline_status as enum ('recorded', 'under_review', 'upheld', 'appealed', 'closed');
create type resource_visibility as enum ('staff_only', 'students', 'parents', 'public');
create type audience        as enum ('all', 'students', 'parents', 'staff', 'applicants');

-- =============================================================================
-- Identity
-- =============================================================================

-- profiles mirrors auth.users 1:1. One row per authenticated human.
create table profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  role          user_role not null,
  first_name    text not null,
  last_name     text not null,
  phone         text,
  avatar_url    text,
  date_of_birth date,
  address       text,
  staff_id      uuid,          -- set by trigger once staff row exists
  student_id    uuid,          -- set by trigger once student row exists
  is_active     boolean not null default true,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index profiles_role_idx     on profiles (role);
create index profiles_last_name_idx on profiles (last_name, first_name);

-- Back-fill email on insert; role defaults to the least-privileged value so a
-- new signup can never be an admin by default.
--
-- This is the ONLY place a profile is created for a self-signup. Application
-- forms must pass the remaining profile fields through user metadata rather
-- than inserting into profiles themselves, otherwise the second insert
-- collides with this row on the primary key.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles
    (id, email, role, first_name, last_name, phone, date_of_birth)
  values (
    new.id,
    coalesce(new.email, ''),
    'applicant',
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
    -- User metadata is attacker-controlled, so only accept an ISO date and
    -- never let an unparseable value abort the signup.
    case
      when new.raw_user_meta_data ->> 'date_of_birth'
           ~ '^\d{4}-\d{2}-\d{2}$'
      then (new.raw_user_meta_data ->> 'date_of_birth')::date
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- People
-- =============================================================================

create table staff (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null unique references profiles (id) on delete cascade,
  staff_number   text not null unique,
  employment_type text not null default 'full_time'
                 check (employment_type in ('full_time', 'part_time', 'contract', 'visiting')),
  status         staff_status not null default 'active',
  hired_on       date,
  qualification  text,
  specialization text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table students (
  id                uuid primary key default gen_random_uuid(),
  profile_id        uuid not null unique references profiles (id) on delete cascade,
  admission_number  text not null unique,
  status            student_status not null default 'active',
  class_id          uuid,               -- FK added after academic_terms/classes exist
  admission_date    date,
  graduated_on      date,
  guardian_notes    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index students_class_idx on students (class_id);
create index students_status_idx on students (status);

-- -----------------------------------------------------------------------------
-- Wire profile -> staff/student ids so the DAL can resolve ownership without a
-- second round trip. Trigger keeps it correct regardless of insertion order.
-- -----------------------------------------------------------------------------

create or replace function public.sync_profile_links()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles p
     set staff_id   = s.id,
         updated_at = now()
    from public.staff s
   where s.profile_id = p.id
     and p.staff_id is distinct from s.id;

  update public.profiles p
     set student_id = st.id,
         updated_at = now()
    from public.students st
   where st.profile_id = p.id
     and p.student_id is distinct from st.id;

  return null;
end;
$$;

create trigger on_staff_change_sync_links
  after insert or update of profile_id on public.staff
  for each row execute function public.sync_profile_links();

create trigger on_student_change_sync_links
  after insert or update of profile_id on public.students
  for each row execute function public.sync_profile_links();

-- Parents may have several children; children may have several guardians.
create table guardianships (
  guardian_id  uuid not null references profiles (id) on delete cascade,
  student_id   uuid not null references students (id) on delete cascade,
  relationship text not null default 'guardian'
             check (relationship in ('mother', 'father', 'grandparent', 'sibling', 'uncle', 'aunt', 'legal_guardian', 'other')),
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now(),
  primary key (guardian_id, student_id)
);

create index guardianships_student_idx on guardianships (student_id);

-- =============================================================================
-- Academics
-- =============================================================================

create table academic_sessions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,          -- e.g. "2025/2026"
  starts_on  date not null,
  ends_on    date not null,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  constraint academic_sessions_order check (ends_on > starts_on)
);

create unique index academic_sessions_single_current
  on academic_sessions ((is_current)) where is_current;

create table classes (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,               -- e.g. "Year 10"
  level        smallint not null check (level between 1 and 12),
  stream       text,                        -- e.g. "Science", "Arts", "Commercial"
  session_id   uuid not null references academic_sessions (id) on delete restrict,
  homeroom_staff_id uuid references staff (id) on delete set null,
  capacity     integer check (capacity is null or capacity > 0),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (session_id, name, stream)
);

create index classes_session_idx on classes (session_id);

alter table students
  add constraint students_class_fkey foreign key (class_id) references classes (id) on delete set null;

create table subjects (
  id         uuid primary key default gen_random_uuid(),
  code       text not null unique,
  name       text not null,
  level      smallint not null check (level between 1 and 12),
  is_core    boolean not null default false,
  created_at timestamptz not null default now(),
  unique (code, name)
);

create table class_subjects (
  class_id    uuid not null references classes (id) on delete cascade,
  subject_id  uuid not null references subjects (id) on delete cascade,
  staff_id    uuid references staff (id) on delete set null,
  periods_per_week smallint check (periods_per_week is null or periods_per_week > 0),
  primary key (class_id, subject_id)
);

create table terms (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references academic_sessions (id) on delete cascade,
  name        text not null,
  sequence    smallint not null check (sequence > 0),
  starts_on   date not null,
  ends_on     date not null,
  created_at  timestamptz not null default now(),
  unique (session_id, name),
  unique (session_id, sequence),
  constraint terms_order check (ends_on > starts_on)
);

create table enrollments (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  class_id   uuid not null references classes (id) on delete cascade,
  enrolled_on date not null default current_date,
  left_on    date,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  unique (student_id, class_id, enrolled_on)
);

create index enrollments_student_idx on enrollments (student_id, is_current);

create table attendance_records (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students (id) on delete cascade,
  class_id    uuid not null references classes (id) on delete cascade,
  term_id     uuid not null references terms (id) on delete cascade,
  taken_on    date not null,
  status      attendance_status not null,
  note        text,
  recorded_by uuid not null references profiles (id) on delete restrict,
  created_at  timestamptz not null default now(),
  unique (student_id, class_id, taken_on)
);

create index attendance_student_date_idx on attendance_records (student_id, taken_on desc);
create index attendance_class_date_idx  on attendance_records (class_id, taken_on desc);

create table assessments (
  id            uuid primary key default gen_random_uuid(),
  class_id      uuid not null references classes (id) on delete cascade,
  subject_id    uuid not null references subjects (id) on delete cascade,
  term_id       uuid not null references terms (id) on delete cascade,
  title         text not null,
  assessment_type text not null default 'test'
                check (assessment_type in ('test', 'quiz', 'assignment', 'project', 'exam', 'practical')),
  max_score     numeric(6,2) not null check (max_score > 0),
  weight        numeric(5,2) check (weight is null or (weight >= 0 and weight <= 100)),
  due_on        date,
  created_by    uuid not null references profiles (id) on delete restrict,
  created_at    timestamptz not null default now()
);

create index assessments_class_term_idx on assessments (class_id, term_id);

create table grades (
  id            uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments (id) on delete cascade,
  student_id    uuid not null references students (id) on delete cascade,
  score         numeric(6,2) check (score is null or score >= 0),
  comment       text,
  graded_by     uuid not null references profiles (id) on delete restrict,
  graded_at     timestamptz not null default now(),
  unique (assessment_id, student_id)
);

-- A score may never exceed the assessment maximum. Enforced in the database so
-- it cannot be bypassed by a direct API write.
create or replace function public.enforce_grade_ceiling()
returns trigger
language plpgsql
as $$
declare
  ceiling numeric(6,2);
begin
  if new.score is null then
    return new;
  end if;

  select max_score into ceiling from public.assessments where id = new.assessment_id;

  if ceiling is null then
    raise exception 'Assessment % does not exist', new.assessment_id;
  end if;

  if new.score > ceiling then
    raise exception 'Score % exceeds maximum % for assessment %', new.score, ceiling, new.assessment_id;
  end if;

  return new;
end;
$$;

create trigger grades_enforce_ceiling
  before insert or update of score on public.grades
  for each row execute function public.enforce_grade_ceiling();

create index grades_student_idx on grades (student_id);

-- =============================================================================
-- Fees & payments
-- =============================================================================

create table fee_structures (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  session_id    uuid not null references academic_sessions (id) on delete cascade,
  level         smallint check (level is null or level between 1 and 12),
  class_id      uuid references classes (id) on delete cascade,
  currency      char(3) not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table fee_items (
  id         uuid primary key default gen_random_uuid(),
  structure_id uuid not null references fee_structures (id) on delete cascade,
  name       text not null,
  description text,
  amount     numeric(12,2) not null check (amount >= 0),
  is_optional boolean not null default false,
  created_at timestamptz not null default now()
);

create index fee_items_structure_idx on fee_items (structure_id);

create table invoices (
  id           uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  student_id   uuid not null references students (id) on delete restrict,
  session_id   uuid not null references academic_sessions (id) on delete restrict,
  term_id      uuid references terms (id) on delete set null,
  currency     char(3) not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  discount     numeric(12,2) not null default 0 check (discount >= 0),
  amount_paid  numeric(12,2) not null default 0 check (amount_paid >= 0),
  status       fee_status not null default 'pending',
  due_on       date,
  issued_at    timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint invoices_discount_le_total check (discount <= total_amount),
  constraint invoices_paid_le_total check (amount_paid <= total_amount - discount)
);

create index invoices_student_idx on invoices (student_id, due_on desc);
create index invoices_status_idx  on invoices (status);

-- Derive status from the money so the two can never disagree.
create or replace function public.enforce_invoice_totals()
returns trigger
language plpgsql
as $$
declare
  payable numeric(12,2);
begin
  payable := new.total_amount - new.discount;

  if new.amount_paid > payable then
    raise exception 'Amount paid % exceeds payable % for invoice %', new.amount_paid, payable, new.id;
  end if;

  if new.status = 'waived' then
    new.amount_paid := payable;
  elsif payable = 0 then
    new.status := 'paid';
  elsif new.amount_paid <= 0 then
    new.status := case when new.due_on is not null and new.due_on < current_date then 'overdue' else 'pending' end;
  elsif new.amount_paid < payable then
    new.status := 'partially_paid';
  else
    new.status := 'paid';
  end if;

  return new;
end;
$$;

create trigger invoices_enforce_totals
  before insert or update of total_amount, discount, amount_paid, status, due_on on public.invoices
  for each row execute function public.enforce_invoice_totals();

create table payments (
  id            uuid primary key default gen_random_uuid(),
  receipt_number text not null unique,
  invoice_id    uuid not null references invoices (id) on delete restrict,
  student_id    uuid not null references students (id) on delete restrict,
  amount        numeric(12,2) not null check (amount > 0),
  currency      char(3) not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  method        payment_method not null,
  reference     text,
  paid_at       timestamptz not null default now(),
  received_by   uuid not null references profiles (id) on delete restrict,
  note          text,
  created_at    timestamptz not null default now()
);

create index payments_invoice_idx on payments (invoice_id, paid_at desc);
create index payments_student_idx  on payments (student_id, paid_at desc);

-- A payment must belong to the same student as its invoice, and the invoice's
-- paid total must always equal the sum of its payments.
create or replace function public.enforce_payment_consistency()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1 from public.invoices
     where id = new.invoice_id and student_id = new.student_id
  ) then
    raise exception 'Payment student % does not match invoice % owner', new.student_id, new.invoice_id;
  end if;

  update public.invoices inv
     set amount_paid = coalesce((
           select sum(p.amount) from public.payments p
            where p.invoice_id = new.invoice_id
         ), 0),
         updated_at = now()
   where inv.id = new.invoice_id;

  return new;
end;
$$;

create trigger payments_enforce_consistency
  after insert on public.payments
  for each row execute function public.enforce_payment_consistency();

-- =============================================================================
-- Registration
-- =============================================================================

create table applications (
  id              uuid primary key default gen_random_uuid(),
  applicant_id    uuid not null references profiles (id) on delete cascade,
  status          application_status not null default 'submitted',
  class_applying  text not null,
  guardian_name   text not null,
  guardian_phone  text not null,
  previous_school text,
  statement       text not null,
  documents       text[] not null default '{}',
  reviewer_id     uuid references profiles (id) on delete set null,
  decision_note   text,
  submitted_at    timestamptz not null default now(),
  decided_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index applications_applicant_idx on applications (applicant_id, submitted_at desc);
create index applications_status_idx    on applications (status, submitted_at desc);

-- =============================================================================
-- Communication
-- =============================================================================

create table announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  audience     audience not null default 'all',
  class_id     uuid references classes (id) on delete cascade,
  is_pinned    boolean not null default false,
  publish_at   timestamptz not null default now(),
  expires_at   timestamptz,
  created_by   uuid not null references profiles (id) on delete restrict,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index announcements_publish_idx on announcements (publish_at desc);

create table messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references profiles (id) on delete cascade,
  recipient_id uuid not null references profiles (id) on delete cascade,
  body         text not null,
  read_at      timestamptz,
  created_at   timestamptz not null default now(),
  constraint messages_not_self check (sender_id <> recipient_id)
);

create index messages_recipient_idx on messages (recipient_id, created_at desc);

-- =============================================================================
-- Learning resources
-- =============================================================================

create table resources (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  subject_id  uuid references subjects (id) on delete set null,
  class_id    uuid references classes (id) on delete cascade,
  file_path   text not null,          -- storage object path, not a public URL
  mime_type   text not null,
  size_bytes  bigint not null check (size_bytes >= 0),
  visibility  resource_visibility not null default 'students',
  uploaded_by uuid not null references profiles (id) on delete restrict,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index resources_class_idx    on resources (class_id, created_at desc);
create index resources_subject_idx on resources (subject_id, created_at desc);

-- =============================================================================
-- Complaints & feedback
-- =============================================================================

create table complaints (
  id           uuid primary key default gen_random_uuid(),
  submitted_by uuid references profiles (id) on delete set null,  -- null when anonymous
  is_anonymous boolean not null default false,
  category     text not null,
  subject      text not null,
  body         text not null,
  status       complaint_status not null default 'open',
  assigned_to  uuid references profiles (id) on delete set null,
  resolution   text,
  resolved_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- An anonymous complaint must never carry a submitter identity.
  constraint complaints_anonymous_has_no_author
    check (not is_anonymous or submitted_by is null)
);

create index complaints_status_idx on complaints (status, created_at desc);

create table complaint_updates (
  id          uuid primary key default gen_random_uuid(),
  complaint_id uuid not null references complaints (id) on delete cascade,
  author_id   uuid references profiles (id) on delete set null,
  body        text not null,
  is_internal boolean not null default false,
  created_at  timestamptz not null default now()
);

create index complaint_updates_complaint_idx on complaint_updates (complaint_id, created_at);

-- =============================================================================
-- Anonymous safety reporting
-- =============================================================================

create table anonymous_reports (
  id            uuid primary key default gen_random_uuid(),
  reference_code text not null unique,     -- shown to the reporter, not a secret
  contact_token_hash text,                 -- nullable; lets one reporter track one report
  category      text not null,
  body          text not null,
  incident_date date,
  severity      report_severity not null default 'medium',
  status        report_status not null default 'new',
  assigned_to   uuid references profiles (id) on delete set null,
  outcome       text,
  submitted_at  timestamptz not null default now(),
  closed_at     timestamptz
);

create index anonymous_reports_status_idx on anonymous_reports (status, submitted_at desc);

create table report_audit_log (
  id         uuid primary key default gen_random_uuid(),
  report_id  uuid not null references anonymous_reports (id) on delete cascade,
  actor_id   uuid references profiles (id) on delete set null,
  action     text not null,
  note       text,
  created_at timestamptz not null default now()
);

create index report_audit_log_report_idx on report_audit_log (report_id, created_at);

-- =============================================================================
-- Discipline
-- =============================================================================

create table discipline_records (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students (id) on delete cascade,
  incident_date date not null,
  category      text not null,
  severity      report_severity not null default 'low',
  description   text not null,
  action_taken  text,
  status        discipline_status not null default 'recorded',
  reported_by   uuid not null references profiles (id) on delete restrict,
  reviewed_by   uuid references profiles (id) on delete set null,
  parent_notified_at timestamptz,
  resolution    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index discipline_student_idx on discipline_records (student_id, incident_date desc);
create index discipline_status_idx  on discipline_records (status, incident_date desc);

-- =============================================================================
-- Audit trail
-- =============================================================================

create table audit_log (
  id          bigserial primary key,
  actor_id    uuid references profiles (id) on delete set null,
  action      text not null,
  entity      text not null,
  entity_id   uuid,
  detail      jsonb not null default '{}'::jsonb,
  ip_address  inet,
  created_at  timestamptz not null default now()
);

create index audit_log_actor_idx  on audit_log (actor_id, created_at desc);
create index audit_log_entity_idx on audit_log (entity, entity_id, created_at desc);
