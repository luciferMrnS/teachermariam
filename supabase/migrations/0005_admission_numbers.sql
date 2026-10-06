-- =============================================================================
-- Mariam — Comprehensive School Management Platform
-- 0005_admission_numbers.sql
--
-- FR-5.6: on approval the system generates a unique, non-guessable
-- registration (admission) number. Unambiguous alphabet (no 0/O/1/I), 8
-- random characters from gen_random_bytes (~1T combinations), loop-guarded
-- by the unique constraint on students.admission_number.
--
-- The default still permits an explicit value, so imports of legacy numbers
-- keep working; the generator only fires when none is supplied.
-- =============================================================================

create or replace function public.generate_admission_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  i integer;
  byte integer;
begin
  loop
    candidate := 'M-' || to_char(now(), 'YYYY') || '-';
    for i in 1..8 loop
      byte := get_byte(gen_random_bytes(1), 0);
      candidate := candidate || substr(alphabet, (byte % 32) + 1, 1);
    end loop;

    exit when not exists (
      select 1 from public.students s where s.admission_number = candidate
    );
  end loop;

  return candidate;
end;
$$;

alter table public.students
  alter column admission_number set default public.generate_admission_number();
