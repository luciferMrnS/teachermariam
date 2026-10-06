import { createHash, randomBytes } from 'node:crypto'

import { NextResponse, type NextRequest } from 'next/server'

import { anonymousReportSchema } from '@/lib/validation'

/**
 * Anonymous safety reporting.
 *
 * Properties this endpoint is designed for:
 *   - No account required. A report can be filed by someone with no login.
 *   - No identity is written. `submitted_by` does not exist on this table, and
 *     the insert runs through a SECURITY DEFINER function that takes no actor.
 *   - The caller receives a random reference code and, if they supplied one, a
 *     contact token whose SHA-256 digest is stored. The raw token is never
 *     stored, so a database leak cannot be used to look up or contact anyone.
 */

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX = 5

/**
 * Per-process rate limit. Deliberately best-effort: it needs no shared state, so
 * it cannot be poisoned, but a multi-instance deployment should also rely on an
 * edge/WAF rule for the same path.
 */
const recentSubmissions = new Map<string, { count: number; resetAt: number }>()

function rateLimited(key: string): boolean {
  const now = Date.now()
  const entry = recentSubmissions.get(key)

  if (!entry || entry.resetAt <= now) {
    recentSubmissions.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  entry.count += 1
  return entry.count > RATE_LIMIT_MAX
}

function clientKey(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded?.split(',')[0]?.trim() || 'unknown'
  return `${ip}:${request.headers.get('user-agent')?.slice(0, 40) ?? 'unknown'}`
}

/** Human-quotable, non-sequential code. Guessing it is not the security boundary. */
function makeReferenceCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = randomBytes(10)
  let out = ''
  for (let i = 0; i < 10; i += 1) {
    out += alphabet[bytes[i]! % alphabet.length]
    if (i === 4) out += '-'
  }
  return out
}

export async function POST(request: NextRequest) {
  if (rateLimited(clientKey(request))) {
    return NextResponse.json(
      { error: 'Too many reports submitted. Please try again later.' },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = anonymousReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the highlighted fields.', fieldErrors: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const { category, body: reportBody, incidentDate } = parsed.data

  // The tracking token is always generated here, never accepted from the client.
  // A caller-supplied token would let a report be correlated across submissions.
  const issuedToken = randomBytes(32).toString('base64url')
  const tokenHash = createHash('sha256').update(issuedToken).digest('hex')

  const referenceCode = makeReferenceCode()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json(
      { error: 'Reporting is not configured. Please contact the school directly.' },
      { status: 503 },
    )
  }

  // Called with the anon key so RLS cannot attribute the row to a signed-in user.
  // Wrapped: a network/DNS failure must be a 502, never an unhandled 500.
  let response: Response
  try {
    response = await fetch(`${supabaseUrl}/rest/v1/rpc/submit_anonymous_report`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_reference_code: referenceCode,
        p_contact_token_hash: tokenHash,
        p_category: category,
        p_body: reportBody,
        p_incident_date: incidentDate || null,
      }),
    })
  } catch {
    return NextResponse.json(
      { error: 'We could not record your report. Please try again.' },
      { status: 502 },
    )
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: 'We could not record your report. Please try again.' },
      { status: 502 },
    )
  }

  return NextResponse.json(
    {
      ok: true,
      referenceCode,
      contactToken: issuedToken,
    },
    { status: 201 },
  )
}
