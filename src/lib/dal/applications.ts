import 'server-only'

import { cache } from 'react'

import { assertRole } from '@/lib/dal/auth'
import { createClient } from '@/lib/supabase/server'
import type { ApplicationStatus } from '@/lib/supabase/database.types'

export type ApplicationDTO = {
  id: string
  status: string
  classApplying: string
  submittedAt: string
  decidedAt: string | null
  decisionNote: string | null
}

export type ApplicationAdminDTO = ApplicationDTO & {
  applicantId: string
  applicantName: string
  applicantEmail: string
  guardianName: string | null
}

const STATUS_TONE: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 ring-gray-500/20',
  submitted: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  under_review: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  interview: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  withdrawn: 'bg-gray-100 text-gray-600 ring-gray-500/20',
}

export function toneForStatus(status: string) {
  return STATUS_TONE[status] ?? STATUS_TONE.draft
}

export const listMyApplications = cache(async (): Promise<ApplicationDTO[]> => {
  const context = await assertRole('applicant')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('applications')
    .select('id, status, class_applying, submitted_at, decided_at, decision_note')
    .eq('applicant_id', context.userId)
    .order('submitted_at', { ascending: false })

  if (error) throw new Error(`Failed to load applications: ${error.message}`)

  return (data ?? []).map((a) => ({
    id: a.id,
    status: a.status,
    classApplying: a.class_applying,
    submittedAt: a.submitted_at,
    decidedAt: a.decided_at,
    decisionNote: a.decision_note,
  }))
})

/** Review queue for administrators. Narrow DTO, newest first. */
export const listApplications = cache(
  async (filters: { status?: string; limit?: number } = {}): Promise<ApplicationAdminDTO[]> => {
    await assertRole('admin')

    const supabase = await createClient()
    const limit = Math.min(filters.limit ?? 50, 200)

    let query = supabase
      .from('applications')
      .select(
        'id, status, class_applying, submitted_at, decided_at, decision_note, applicant_id, guardian_name, profiles!applications_applicant_id_fkey (first_name, last_name, email)',
      )
      .order('submitted_at', { ascending: false })
      .limit(limit)

    if (filters.status) query = query.eq('status', filters.status as ApplicationStatus)

    const { data, error } = await query
    if (error) throw new Error(`Failed to load applications: ${error.message}`)

    return (data ?? []).map(toAdminDTO)
  },
)

function toAdminDTO(row: unknown): ApplicationAdminDTO {
  const r = row as {
    id: string
    status: string
    class_applying: string
    submitted_at: string
    decided_at: string | null
    decision_note: string | null
    applicant_id: string
    guardian_name: string | null
    profiles: { first_name: string; last_name: string; email: string } | { first_name: string; last_name: string; email: string }[] | null
  }

  const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles
  const firstName = profile?.first_name ?? ''
  const lastName = profile?.last_name ?? ''

  return {
    id: r.id,
    status: r.status,
    classApplying: r.class_applying,
    submittedAt: r.submitted_at,
    decidedAt: r.decided_at,
    decisionNote: r.decision_note,
    applicantId: r.applicant_id,
    applicantName: `${firstName} ${lastName}`.trim() || 'Unknown applicant',
    applicantEmail: profile?.email ?? '',
    guardianName: r.guardian_name,
  }
}

/**
 * Verification workflow transitions (spec FR-5.8). `accepted` is terminal via
 * this path on purpose — acceptance happens only through enrolment, so the
 * student row, role flip and class placement can never be skipped.
 */
const REVIEW_TRANSITIONS: Record<string, string[]> = {
  submitted: ['under_review', 'rejected'],
  under_review: ['interview', 'rejected'],
  interview: ['rejected'],
}

export async function reviewApplication(
  id: string,
  status: 'under_review' | 'interview' | 'rejected',
  decisionNote: string | null,
): Promise<void> {
  const context = await assertRole('admin')

  const supabase = await createClient()
  const { data: current, error: readError } = await supabase
    .from('applications')
    .select('status')
    .eq('id', id)
    .maybeSingle()

  if (readError || !current) throw new Error('Application not found.')
  if (!(REVIEW_TRANSITIONS[current.status] ?? []).includes(status)) {
    throw new Error(`Cannot move an application from ${current.status} to ${status}.`)
  }

  const { error } = await supabase
    .from('applications')
    .update({
      status,
      decision_note: decisionNote,
      reviewer_id: context.userId,
      decided_at: status === 'rejected' ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (error) throw new Error(`Failed to update application: ${error.message}`)
}

/**
 * US-A1: accept + create the student + flip the role + place in class, all
 * inside the atomic `enrol_applicant` transaction (migration 0006). Throws on
 * any guard failure — already decided, unknown class, double enrol.
 */
export async function enrolApplicant(applicationId: string, classId: string): Promise<string> {
  await assertRole('admin')

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('enrol_applicant', {
    p_application_id: applicationId,
    p_class_id: classId,
  })

  if (error) throw new Error(friendlyEnrolError(error.message))
  return String(data)
}

function friendlyEnrolError(message: string): string {
  if (message.includes('already decided')) return 'This application has already been decided.'
  if (message.includes('already has a student record')) return 'This applicant is already enrolled.'
  if (message.includes('does not exist')) return 'The application or class no longer exists.'
  if (message.includes('Forbidden')) return 'Enrolment requires the admin role.'
  return `Enrolment failed: ${message}`
}
