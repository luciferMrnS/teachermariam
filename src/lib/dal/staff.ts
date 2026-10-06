import 'server-only'

import { cache } from 'react'

import { assertRole } from '@/lib/dal/auth'
import { createClient } from '@/lib/supabase/server'

export type StaffDTO = {
  id: string
  staffNumber: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string | null
  employmentType: string
  status: string
  hiredOn: string | null
  qualification: string | null
  specialization: string | null
}

export type StaffListFilters = {
  search?: string
  status?: string
  employmentType?: string
  limit?: number
  offset?: number
}

/**
 * Staff directory. Admin-only: per the spec matrix a facilitator reads their
 * own record alone, never the directory, so no broader role is admitted.
 * Returns a narrow DTO — never whole rows.
 */
export const listStaff = cache(
  async (filters: StaffListFilters = {}): Promise<StaffDTO[]> => {
    await assertRole('admin')

    const supabase = await createClient()
    const limit = Math.min(filters.limit ?? 50, 200)
    const offset = filters.offset ?? 0

    let query = supabase
      .from('staff')
      .select(
        'id, staff_number, employment_type, status, hired_on, qualification, specialization, profiles!staff_profile_id_fkey (first_name, last_name, email, phone)',
      )
      .order('staff_number', { ascending: true })
      .range(offset, offset + limit - 1)

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.employmentType) query = query.eq('employment_type', filters.employmentType)

    const search = filters.search?.trim()
    if (search) {
      // Escape the PostgREST filter metacharacters so a crafted search string
      // cannot widen the result set.
      const safe = search.replace(/[,()%*."\\]/g, ' ')
      query = query.ilike('profiles.first_name', `%${safe}%`)
    }

    const { data, error } = await query
    if (error) throw new Error(`Failed to list staff: ${error.message}`)

    return (data ?? []).map(toStaffDTO)
  },
)

function toStaffDTO(row: unknown): StaffDTO {
  const r = row as {
    id: string
    staff_number: string
    employment_type: string
    status: string
    hired_on: string | null
    qualification: string | null
    specialization: string | null
    profiles: { first_name: string; last_name: string; email: string; phone: string | null } | { first_name: string; last_name: string; email: string; phone: string | null }[] | null
  }

  const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles

  const firstName = profile?.first_name ?? ''
  const lastName = profile?.last_name ?? ''

  return {
    id: r.id,
    staffNumber: r.staff_number,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    email: profile?.email ?? '',
    phone: profile?.phone ?? null,
    employmentType: r.employment_type,
    status: r.status,
    hiredOn: r.hired_on,
    qualification: r.qualification,
    specialization: r.specialization,
  }
}

export const getStaff = cache(async (id: string): Promise<StaffDTO | null> => {
  await assertRole('admin')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff')
    .select(
      'id, staff_number, employment_type, status, hired_on, qualification, specialization, profiles!staff_profile_id_fkey (first_name, last_name, email, phone)',
    )
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  return toStaffDTO(data)
})
