'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import type { AuthState } from '@/app/auth/state'
import { getContext } from '@/lib/dal/auth'
import { safePortalNext } from '@/lib/redirects'
import { ROLE_HOME } from '@/lib/rbac'
import { createClient } from '@/lib/supabase/server'
import {
  applicantRegistrationSchema,
  signInSchema,
  type ApplicantRegistrationInput,
} from '@/lib/validation'

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { data, error } = await (await createClient()).auth.signInWithPassword(
    parsed.data,
  )

  if (error) {
    // Deliberately vague: never reveal whether the account exists.
    return { status: 'error', message: 'Incorrect email or password.' }
  }

  if (!data.user) {
    return { status: 'error', message: 'Incorrect email or password.' }
  }

  const context = await getContext()

  if (!context) {
    // Authenticated but no profile row: the account is not provisioned.
    return {
      status: 'error',
      message:
        'Your account is not provisioned yet. Please contact the school administrator.',
    }
  }

    redirect(safePortalNext(String(formData.get('next') ?? '')) ?? ROLE_HOME[context.profile.role])
}

export async function signUpApplicantAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw: Record<string, unknown> = {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    dateOfBirth: formData.get('dateOfBirth'),
    guardianName: formData.get('guardianName'),
    guardianPhone: formData.get('guardianPhone'),
    classApplying: formData.get('classApplying'),
    previousSchool: formData.get('previousSchool') ?? undefined,
    statement: formData.get('statement'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const parsed = applicantRegistrationSchema.safeParse(raw)

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Check the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: echoValues(raw),
    }
  }

  const { password, ...applicant } = parsed.data satisfies ApplicantRegistrationInput
  const supabase = await createClient()

  // The profile is created by the `handle_new_user` database trigger, which is
  // the only sanctioned path for a self-registered account. Everything the
  // trigger needs travels in user metadata; inserting into `profiles` here
  // would collide with the row the trigger just wrote.
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: applicant.email,
    password,
    options: {
      data: {
        first_name: applicant.firstName,
        last_name: applicant.lastName,
        phone: applicant.phone,
        date_of_birth: applicant.dateOfBirth,
      },
    },
  })

  if (signUpError) {
    // Logged server-side only: the client keeps the vague message so
    // account existence is never revealed. Read the terminal to diagnose.
    console.error('Applicant sign-up failed:', signUpError.message)
    return { status: 'error', message: 'Could not create your account. Try again.' }
  }

  if (!data.user) {
    return { status: 'error', message: 'Could not create your account. Try again.' }
  }

  const { error: applicationError } = await supabase.from('applications').insert({
    applicant_id: data.user.id,
    status: 'submitted',
    class_applying: applicant.classApplying,
    guardian_name: applicant.guardianName,
    guardian_phone: applicant.guardianPhone,
    previous_school: applicant.previousSchool ?? null,
    statement: applicant.statement,
  })

  if (applicationError) {
    console.error('Applicant application insert failed:', applicationError.message)
    return {
      status: 'error',
      message: 'Your account was created but the application could not be saved. Contact the school.',
    }
  }

  revalidatePath('/applicant')

  if (data.session) {
    redirect('/applicant')
  }

  return {
    status: 'success',
    message: 'Account created. Check your email to confirm it, then sign in.',
  }
}

export async function signOutAction() {
  await (await createClient()).auth.signOut()
  redirect('/auth/sign-in')
}

/**
 * Stringifies submitted fields for echo-back after a failed submit.
 * Passwords are deliberately excluded — the user retypes those, and secrets
 * are never reflected into the rendered HTML.
 */
function echoValues(raw: Record<string, unknown>): Record<string, string> {
  const values: Record<string, string> = {}
  for (const [key, value] of Object.entries(raw)) {
    if (key === 'password' || key === 'confirmPassword') continue
    if (typeof value === 'string') values[key] = value
  }
  return values
}
