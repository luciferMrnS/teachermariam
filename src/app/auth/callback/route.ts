import { NextResponse, type NextRequest } from 'next/server'

import { getContext } from '@/lib/dal/auth'
import { safePortalNext } from '@/lib/redirects'
import { ROLE_HOME } from '@/lib/rbac'
import { createClient } from '@/lib/supabase/server'

/**
 * Supabase redirects here after email-confirmation links and password recovery.
 * The `code` exchange is the state-changing step, so it must happen in a Route
 * Handler (which can write cookies) rather than in a Server Component.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = safePortalNext(searchParams.get('next'))

  const signIn = new URL('/auth/sign-in', origin)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // A confirmed user with no profile row is not a valid session for the
      // portal, so send them back to sign in rather than to a 404.
      const context = await getContext()
      if (context) {
        return NextResponse.redirect(
          new URL(next ?? ROLE_HOME[context.profile.role], origin),
        )
      }
    }
  }

  return NextResponse.redirect(signIn)
}
