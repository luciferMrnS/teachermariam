import 'server-only'

import { cache } from 'react'

import { assertRole, getContext } from '@/lib/dal/auth'
import { createClient } from '@/lib/supabase/server'
import { titleCase } from '@/lib/utils'

export type ChildDTO = {
  studentId: string
  admissionNumber: string
  firstName: string
  lastName: string
  fullName: string
  classId: string | null
  className: string | null
  stream: string | null
  status: string
  relationship: string
  relationshipLabel: string
  isPrimary: boolean
}

/**
 * Children linked to the signed-in parent through `guardianships` — the only
 * source of "my children". The child id is never taken from the client, so a
 * parent cannot widen the set by guessing ids (spec FR-2.1).
 */
export const listMyChildren = cache(async (): Promise<ChildDTO[]> => {
  const context = await assertRole('parent')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('guardianships')
    .select(
      'relationship, is_primary, students!guardianships_student_id_fkey (id, admission_number, status, class_id, profiles!students_profile_id_fkey (first_name, last_name), classes!students_class_fkey (name, stream))',
    )
    .eq('guardian_id', context.userId)
    .order('is_primary', { ascending: false })

  if (error) throw new Error(`Failed to load linked children: ${error.message}`)

  return (data ?? []).flatMap(toChildDTO)
})

function toChildDTO(row: unknown): ChildDTO[] {
  const r = row as {
    relationship: string
    is_primary: boolean
    students: {
      id: string
      admission_number: string
      status: string
      class_id: string | null
      profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null
      classes: { name: string; stream: string | null } | { name: string; stream: string | null }[] | null
    } | null
  }

  const student = Array.isArray(r.students) ? r.students[0] : r.students
  if (!student) return []

  const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles
  const klass = Array.isArray(student.classes) ? student.classes[0] : student.classes

  const firstName = profile?.first_name ?? ''
  const lastName = profile?.last_name ?? ''

  return [
    {
      studentId: student.id,
      admissionNumber: student.admission_number,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim() || 'Unnamed student',
      classId: student.class_id,
      className: klass?.name ?? null,
      stream: klass?.stream ?? null,
      status: student.status,
      relationship: r.relationship,
      relationshipLabel: titleCase(r.relationship),
      isPrimary: r.is_primary,
    },
  ]
}

/** Parent-scoped guard for child-level pages: the id must be a linked child. */
export async function assertMyChild(studentId: string): Promise<ChildDTO> {
  await getContext()
  const children = await listMyChildren()
  const child = children.find((c) => c.studentId === studentId)
  if (!child) throw new Error("Forbidden: this student is not linked to your account.")
  return child
}
