import type { Metadata } from 'next'

import { AuthShell } from '@/components/auth-shell'
import { SignInForm } from './sign-in-form'

export const metadata: Metadata = { title: 'Sign in' }

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your school portal."
      footer={
        <>
          Need help signing in?{' '}
          <a href="mailto:support@school.edu" className="font-medium text-brand-600 hover:text-brand-700">
            Contact support
          </a>
        </>
      }
    >
      <SignInForm next={next} />
    </AuthShell>
  )
}
