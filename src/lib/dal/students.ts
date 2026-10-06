import 'server-only'

import { cache } from 'react'

import { assertRole } from '@/lib/dal/auth'
import { createClient } from '@/lib/supabase/server'
import type { StudentStatus } from '@/lib/supabase/database.types'

export type StudentDTO = {
  id: string
  admissionNumber: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string | null
  status: string
  classId: string | null
  className: string | null
  stream: string | null
}

export type StudentListFilters = {
  search?: string
  classId?: string
  status?: string
  limit?: number
  offset?: number
}

/**
 * Student roster for staff. Returns a narrow DTO — never whole rows, and never
 * the fields (address, date of birth) that the roster has no use for.
 */
export const listStudents = cache(
  async (filters: StudentListFilters = {}): Promise<StudentDTO[]> => {
    await assertRole('admin', 'facilitator')

    const supabase = await createClient()
    const limit = Math.min(filters.limit ?? 50, 200)
    const offset = filters.offset ?? 0

    let query = supabase
      .from('students')
      .select(
        'id, admission_number, status, class_id, profiles!students_profile_id_fkey (first_name, last_name, email, phone), classes (name, stream)',
      )
      .order('admission_number', { ascending: true })
      .range(offset, offset + limit - 1)

    if (filters.status) query = query.eq('status', filters.status as StudentStatus)
    if (filters.classId) query = query.eq('class_id', filters.classId)

    const search = filters.search?.trim()
    if (search) {
      // Escape the PostgREST filter metacharacters so a crafted search string
      // cannot widen the result set.
      const safe = search.replace(/[,()%*."\\]/g, ' ')
      query = query.ilike('profiles.first_name', `%${safe}%`)
    }

    const { data, error } = await query
    if (error) throw new Error(`Failed to list students: ${error.message}`)

    return (data ?? []).map(toStudentDTO)
  },
)

function toStudentDTO(row: unknown): StudentDTO {
  const r = row as {
    id: string
    admission_number: string
    status: string
    class_id: string | null
    profiles: { first_name: string; last_name: string; email: string; phone: string | null } | { first_name: string; last_name: string; email: string; phone: string | null }[] | null
    classes: { name: string; stream: string | null } | { name: string; stream: string | null }[] | null
  }

  const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
  const klass = Array.isArray(r.classes) ? r.classes[0] : r.classes

  const firstName = profile?.first_name ?? ''
  const lastName = profile?.last_name ?? ''

  return {
    id: r.id,
    admissionNumber: r.admission_number,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    email: profile?.email ?? '',
    phone: profile?.phone ?? null,
    status: r.status,
    classId: r.class_id,
    className: klass?.name ?? null,
    stream: klass?.stream ?? null,
  }
}

export const getStudent = cache(async (id: string): Promise<StudentDTO | null> => {
  await assertRole('admin', 'facilitator')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('students')
    .select(
      'id, admission_number, status, class_id, profiles!students_profile_id_fkey (first_name, last_name, email, phone), classes (name, stream)',
    )
    .eq('id', id)
    .maybeSingle()

  if (error || !data) return null
  return toStudentDTO(data)
})

export const listClasses = cache(async () => {
  await assertRole('admin', 'facilitator')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('classes')
    .select('id, name, level, stream')
    .order('level', { ascending: true })

  if (error) throw new Error(`Failed to list classes: ${error.message}`)

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    level: c.level,
    stream: c.stream,
  }))
})
