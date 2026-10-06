import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { publicEnv } from '@/lib/env'

/**
 * Refreshes the Supabase session cookie and returns a response that carries the
 * refreshed cookies. Call this from `proxy.ts` on every matched request.
 *
 * `getClaims()` is the authoritative answer to "is there a session?", so it is
 * returned rather than re-derived from cookie names. Cookie names are an
 * implementation detail of @supabase/ssr (they are project-scoped and get
 * chunked once they grow), and matching on them by prefix is how optimistic
 * gates quietly start letting signed-in users through or bouncing signed-out
 * ones.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = publicEnv()

  const supabase = createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }
        response = NextResponse.next({ request })
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options)
        }
      },
    },
  })

  // Touching the session is what triggers the refresh. The claims themselves are
  // used only to detect that a session exists — authorization happens in the DAL
  // and in Postgres RLS. `getClaims()` returns a verified JWT, so a non-null
  // `data` is a real answer rather than a guess from the cookie jar.
  const { data } = await supabase.auth.getClaims()

  return { response, isAuthenticated: data !== null }
}
