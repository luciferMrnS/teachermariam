'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { FieldError, FormAlert, SubmitButton } from '@/components/ui'
import { signUpApplicantAction } from '@/app/auth/actions'
import { initialAuthState } from '@/app/auth/state'

const CLASS_OPTIONS = [
  'Primary 1',
  'Primary 2',
  'Primary 3',
  'Primary 4',
  'Primary 5',
  'Primary 6',
  'JSS 1',
  'JSS 2',
  'JSS 3',
  'SSS 1',
  'SSS 2',
  'SSS 3',
]

const inputClass =
  'mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30'

const labelClass = 'block text-sm font-medium text-gray-700'

export function ApplyForm() {
  const [state, action, pending] = useActionState(signUpApplicantAction, initialAuthState)
  const values = state.values ?? {}

  return (
    <form action={action} className="space-y-6" noValidate>
      <FormAlert status={state.status}>{state.message}</FormAlert>

      <fieldset className="space-y-4">
        <legend className="text-sm font-semibold text-gray-900">About you</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className={labelClass}>
              First name
            </label>
            <input id="firstName" name="firstName" required defaultValue={values.firstName ?? ''} className={inputClass} />
            <FieldError errors={state.fieldErrors?.firstName} />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>
              Surname
            </label>
            <input id="lastName" name="lastName" required defaultValue={values.lastName ?? ''} className={inputClass} />
            <FieldError errors={state.fieldErrors?.lastName} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dateOfBirth" className={labelClass}>
              Date of birth
            </label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              defaultValue={values.dateOfBirth ?? ''}
              className={inputClass}
            />
            <FieldError errors={state.fieldErrors?.dateOfBirth} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Your phone number
            </label>
            <input id="phone" name="phone" type="tel" required defaultValue={values.phone ?? ''} className={inputClass} />
            <FieldError errors={state.fieldErrors?.phone} />
          </div>
        </div>

        <div>
          <label htmlFor="email" className={labelClass}>
            Email address
          </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={values.email ?? ''}
              className={inputClass}
            />
          <FieldError errors={state.fieldErrors?.email} />
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-gray-200 pt-6">
        <legend className="text-sm font-semibold text-gray-900">Guardian</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="guardianName" className={labelClass}>
              Guardian&rsquo;s name
            </label>
            <input
              id="guardianName"
              name="guardianName"
              required
              defaultValue={values.guardianName ?? ''}
              className={inputClass}
            />
            <FieldError errors={state.fieldErrors?.guardianName} />
          </div>
          <div>
            <label htmlFor="guardianPhone" className={labelClass}>
              Guardian&rsquo;s phone number
            </label>
            <input
              id="guardianPhone"
              name="guardianPhone"
              type="tel"
              required
              defaultValue={values.guardianPhone ?? ''}
              className={inputClass}
            />
            <FieldError errors={state.fieldErrors?.guardianPhone} />
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t border-gray-200 pt-6">
        <legend className="text-sm font-semibold text-gray-900">
          Your application
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="classApplying" className={labelClass}>
              Class you are applying to
            </label>
            <select
              id="classApplying"
              name="classApplying"
              required
              defaultValue={values.classApplying ?? ''}
              className={inputClass}
            >
              <option value="">Select a class</option>
              {CLASS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <FieldError errors={state.fieldErrors?.classApplying} />
          </div>
          <div>
            <label htmlFor="previousSchool" className={labelClass}>
              Previous school{' '}
              <span className="font-normal text-gray-500">(optional)</span>
            </label>
            <input id="previousSchool" name="previousSchool" defaultValue={values.previousSchool ?? ''} className={inputClass} />
            <FieldError errors={state.fieldErrors?.previousSchool} />
          </div>
        </div>

        <div>
          <label htmlFor="statement" className={labelClass}>
            Why should we admit you?
          </label>
          <textarea
            id="statement"
            name="statement"
            required
            minLength={40}
            rows={5}
            defaultValue={values.statement ?? ''}
            className={inputClass}
            placeholder="Tell us about yourself and what you hope to achieve."
          />
          <FieldError errors={state.fieldErrors?.statement} />
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Choose a password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-gray-500">
            At least 12 characters. Longer is stronger — you will use this to
            follow your application.
          </p>
          <FieldError errors={state.fieldErrors?.password} />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className={inputClass}
          />
          <FieldError errors={state.fieldErrors?.confirmPassword} />
        </div>
      </fieldset>

      <SubmitButton pending={pending}>Submit application</SubmitButton>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link
          href="/auth/sign-in"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
