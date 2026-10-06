'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { FieldError, FormAlert, SubmitButton } from '@/components/ui'
import { signInAction } from '@/app/auth/actions'
import { initialAuthState } from '@/app/auth/state'

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signInAction, initialAuthState)

  return (
    <form action={action} className="space-y-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}

      <FormAlert status={state.status}>{state.message}</FormAlert>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
          className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          placeholder="you@school.edu"
        />
        <FieldError errors={state.fieldErrors?.email} />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password)}
          className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          placeholder="••••••••"
        />
        <FieldError errors={state.fieldErrors?.password} />
      </div>

      <SubmitButton pending={pending}>Sign in</SubmitButton>

      <p className="text-center text-sm text-gray-500">
        Applying to the school?{' '}
        <Link href="/auth/apply" className="font-medium text-brand-600 hover:text-brand-700">
          Start an application
        </Link>
      </p>
    </form>
  )
}
