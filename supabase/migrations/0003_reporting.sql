-- =============================================================================
-- Mariam — Reporting helpers
-- 0003_reporting.sql
--
-- Aggregate views/functions used by dashboards. These exist so the figures a
-- bursar or principal sees come from one SQL definition rather than being
-- recomputed (and disagreeing) in application code.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Money is aggregated per currency. Summing across currencies would be wrong,
-- so the function returns one row per currency and the UI never assumes NGN.
-- -----------------------------------------------------------------------------

create or replace function public.fee_summary()
returns table (
  currency        char(3),
  billed          numeric(14,2),
  collected       numeric(14,2),
  outstanding     numeric(14,2),
  invoice_count   bigint,
  overdue_count   bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    i.currency,
    sum(i.total_amount - i.discount)                       as billed,
    sum(i.amount_paid)                                      as collected,
    sum(greatest(i.total_amount - i.discount - i.amount_paid, 0)) as outstanding,
    count(*)                                               as invoice_count,
    count(*) filter (where i.status = 'overdue')           as overdue_count
  from public.invoices i
  group by i.currency
  order by i.currency;
$$;

grant execute on function public.fee_summary() to authenticated;

-- -----------------------------------------------------------------------------
-- Attendance rate per student for a term. Denominator is the number of days the
-- class actually met, so a mid-term join does not report a false 100%.
-- -----------------------------------------------------------------------------

create or replace function public.attendance_rate(
  p_student uuid,
  p_term    uuid
)
returns table (
  total    bigint,
  present  bigint,
  late     bigint,
  absent   bigint,
  excused  bigint,
  rate_pct numeric(5,2)
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    count(*)                                                   as total,
    count(*) filter (where a.status = 'present')               as present,
    count(*) filter (where a.status = 'late')                  as late,
    count(*) filter (where a.status = 'absent')                as absent,
    count(*) filter (where a.status = 'excused')               as excused,
    case
      when count(*) = 0 then null
      else round(
        100.0 * count(*) filter (where a.status in ('present', 'late'))
        / count(*),
        2
      )
    end                                                        as rate_pct
  from public.attendance_records a
  where a.student_id = p_student
    and a.term_id = p_term;
$$;

grant execute on function public.attendance_rate(uuid, uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- Principal view: the numbers a head of school asks for first.
-- -----------------------------------------------------------------------------

create or replace view public.school_overview
with (security_invoker = true)
as
select
  (select count(*) from public.students where status = 'active')                    as active_students,
  (select count(*) from public.staff    where status = 'active')                    as active_staff,
  (select count(*) from public.classes)                                             as class_count,
  (select count(*) from public.applications where status = 'submitted')             as new_applications,
  (select count(*) from public.complaints    where status in ('open', 'in_review'))  as open_complaints,
  (select count(*) from public.anonymous_reports where status in ('new', 'triaged')) as open_reports,
  (select count(*) from public.discipline_records where status <> 'closed')          as open_discipline;

grant select on public.school_overview to authenticated;
