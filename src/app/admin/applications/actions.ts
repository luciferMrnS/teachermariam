'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import type { AuthState } from '@/app/auth/state'
import { initialAuthState } from '@/app/auth/state'
import { assertRole } from '@/lib/dal/auth'
import { enrolApplicant, reviewApplication } from '@/lib/dal/applications'

const reviewSchema = z.object({
  applicationId: z.string().uuid('Invalid application.'),
  status: z.enum(['under_review', 'interview', 'rejected'], { error: 'Invalid decision.' }),
  decisionNote: z.string().trim().max(2000, 'Keep the note under 2000 characters.').nullish(),
})

const enrolSchema = z.object({
  applicationId: z.string().uuid('Invalid application.'),
  classId: z.string().uuid('Select a class to enrol into.'),
})

function toFailure(message: string, fieldErrors?: Record<string, string[]>): AuthState {
  return { status: 'error', message, fieldErrors }
}

export async function reviewApplicationAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  await assertRole('admin')

  const parsed = reviewSchema.safeParse({
    applicationId: formData.get('applicationId'),
    status: formData.get('status'),
    decisionNote: formData.get('decisionNote') || null,
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await reviewApplication(
      parsed.data.applicationId,
      parsed.data.status,
      parsed.data.decisionNote ?? null,
    )
  } catch (error) {
    return toFailure(error instanceof Error ? error.message : 'Could not update the application.')
  }

  revalidatePath('/admin/applications')
  return { ...initialAuthState, status: 'success', message: 'Application updated.' }
}

export async function enrolApplicantAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  await assertRole('admin')

  const parsed = enrolSchema.safeParse({
    applicationId: formData.get('applicationId'),
    classId: formData.get('classId'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Select a class to enrol into.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  try {
    await enrolApplicant(parsed.data.applicationId, parsed.data.classId)
  } catch (error) {
    return toFailure(error instanceof Error ? error.message : 'Could not enrol the applicant.')
  }

  revalidatePath('/admin/applications')
  revalidatePath('/admin/students')
  return { ...initialAuthState, status: 'success', message: 'Applicant enrolled as a student.' }
}
