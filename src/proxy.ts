import { NextResponse, type NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/proxy'

const PORTAL_PREFIXES = ['/admin', '/facilitator', '/parent', '/student', '/applicant']

/**
 * Auth routes a signed-in visitor has no reason to see. `/auth/callback` is
 * deliberately absent: it is the PKCE code exchange, and bouncing it would
 * break email confirmation and password recovery for anyone who still holds a
 * (possibly stale) session cookie.
 */
const AUTH_PAGES_WITHOUT_SESSION = ['/auth/sign-in', '/auth/apply']

function isPortalPath(pathname: string) {
  return PORTAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

function matchesExactly(pathname: string, targets: string[]) {
  return targets.some((target) => pathname === target || pathname.startsWith(`${target}/`))
}

/**
 * Optimistic, cookie-only gate. Its only job is to avoid rendering a portal shell
 * for a signed-out visitor and to keep refresh tokens fresh. It is NOT an
 * authorization boundary — role checks live in the DAL and in Postgres RLS.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const { response, isAuthenticated } = await updateSession(request)

  if (isPortalPath(pathname) && !isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/sign-in'
    url.search = ''
    url.searchParams.set('next', `${pathname}${search}`)
    return NextResponse.redirect(url)
  }

  if (isAuthenticated && matchesExactly(pathname, AUTH_PAGES_WITHOUT_SESSION)) {
    // Resolve the role home in the Server Component rather than here: this gate
    // stays free of database access.
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Everything except:
     * - api routes
     * - Next internals (static, image, dev/build metadata)
     * - common static assets
     */
    '/((?!api|_next/static|_next/image|_next/dev|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|woff2?)$).*)',
  ],
}
