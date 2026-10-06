-- =============================================================================
-- Mariam — Storage
-- 0004_storage.sql
--
-- Buckets are private. Nothing here is world-readable: files are served through
-- short-lived signed URLs minted by a Route Handler *after* the caller has
-- passed the same RLS check that governs the metadata row.
--
-- Ownership is expressed as a folder convention (`<uid>/...`) rather than the
-- deprecated `owner_id` column, so the policy does not depend on a column that
-- Supabase has been migrating away from.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Buckets
-- -----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'application-documents',
    'application-documents',
    false,
    10485760, -- 10 MB per file
    array[
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  ),
  (
    'resources',
    'resources',
    false,
    52428800, -- 50 MB per file
    null
  )
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

/** First path segment of a storage object name, i.e. the owning profile id. */
create or replace function public.storage_owner(object_name text)
returns uuid
language plpgsql
immutable
set search_path = public
as $$
declare
  first_segment text;
begin
  first_segment := split_part(object_name, '/', 1);

  if first_segment = '' or first_segment !~ '^[0-9a-fA-F-]{36}$' then
    return null;
  end if;

  return first_segment::uuid;
end;
$$;

/**
 * Can the caller read this learning resource?
 *
 * Mirrors `resources_read` by looking the path up in the `resources` table, so a
 * file and its metadata row can never disagree about who may see them. Falls
 * back to denying access when no metadata row exists: an orphaned upload is not
 * readable by anybody but staff.
 */
create or replace function public.can_read_resource(target_path text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when public.is_staff() then true
    else exists (
      select 1
        from public.resources r
       where r.file_path = target_path
         and (
              r.visibility = 'public'
           or (r.visibility = 'parents'  and public.current_role() = 'parent')
           or (r.visibility = 'students' and public.current_role() = 'student')
         )
    )
  end;
$$;

-- -----------------------------------------------------------------------------
-- Policies: application-documents
-- -----------------------------------------------------------------------------
-- Idempotency (see 0002): drop before recreate so a fix-and-rerun is safe.
drop policy if exists application_documents_read on storage.objects;
drop policy if exists application_documents_insert on storage.objects;
drop policy if exists application_documents_delete on storage.objects;
drop policy if exists application_documents_no_update on storage.objects;
drop policy if exists resources_read on storage.objects;
drop policy if exists resources_write on storage.objects;
drop policy if exists resources_delete on storage.objects;
drop policy if exists resources_no_update on storage.objects;

-- An applicant reads and writes only inside their own folder.
create policy application_documents_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'application-documents'
    and public.storage_owner(name) = auth.uid()
  );

create policy application_documents_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'application-documents'
    and public.storage_owner(name) = auth.uid()
  );

-- Deleting is allowed only while the applicant may still edit the application,
-- which the `applications_update_own` policy caps at draft/submitted.
create policy application_documents_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'application-documents'
    and public.storage_owner(name) = auth.uid()
    and exists (
      select 1
        from public.applications a
       where a.applicant_id = auth.uid()
         and a.status in ('draft', 'submitted')
    )
  );

-- Nobody may move an object to another folder, which would break the ownership
-- check above.
create policy application_documents_no_update on storage.objects
  for update to authenticated
  using (false)
  with check (false);

-- -----------------------------------------------------------------------------
-- Policies: resources
-- -----------------------------------------------------------------------------

create policy resources_read on storage.objects
  for select to authenticated
  using (
    bucket_id = 'resources'
    and public.can_read_resource(name)
  );

-- Uploading is allowed into your own folder, plus admins anywhere. This is a
-- folder-ownership check rather than a `resources` table lookup on purpose: the
-- metadata row that makes a file visible cannot exist until after the upload
-- lands, so gating the upload on it would be circular.
--
-- Pairing the object with a class is a separate step — insert the `resources`
-- row referencing this path, which is what `resources_read` then consults.
create policy resources_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'resources'
    and (public.is_admin() or public.storage_owner(name) = auth.uid())
  );

-- Authors may clean up their own uploads; admins may remove anything.
create policy resources_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'resources'
    and (public.is_admin() or public.storage_owner(name) = auth.uid())
  );

create policy resources_no_update on storage.objects
  for update to authenticated
  using (false)
  with check (false);

-- -----------------------------------------------------------------------------
-- Grants
-- -----------------------------------------------------------------------------

-- Objects are immutable: there is no column on storage.objects a client should
-- be rewriting, and letting them rename a path would break both the folder
-- ownership check and the `resources` metadata lookup above. Replace-by-delete
-- and re-upload.
grant usage on schema storage to authenticated;
grant select, insert, delete on storage.objects to authenticated;
