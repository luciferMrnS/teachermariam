import 'server-only'

import { cache } from 'react'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { isRole, ROLE_HOME, type Role } from '@/lib/rbac'

export type ProfileDTO = {
  id: string
  role: Role
  firstName: string
  lastName: string
  fullName: string
  email: string
  avatarUrl: string | null
  studentId: string | null
  staffId: string | null
}

export type AuthContext = {
  userId: string
  email: string
  profile: ProfileDTO
}

function toDTO(row: Record<string, unknown>): ProfileDTO | null {
  const role = row.role
  if (!isRole(role)) return null

  const firstName = String(row.first_name ?? '')
  const lastName = String(row.last_name ?? '')

  return {
    id: String(row.id),
    role,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim() || String(row.email ?? ''),
    email: String(row.email ?? ''),
    avatarUrl: row.avatar_url ? String(row.avatar_url) : null,
    studentId: row.student_id ? String(row.student_id) : null,
    staffId: row.staff_id ? String(row.staff_id) : null,
  }
}

/**
 * Returns the signed-in user, or null. Verifies the token against the Supabase
 * auth server on every call, so a forged or stale cookie cannot pass.
 */
export const getUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user ?? null
})

/**
 * Authoritative session + role lookup for Server Components.
 * Returns null when signed out; call `requireContext` to redirect instead.
 */
export const getContext = cache(async (): Promise<AuthContext | null> => {
  const user = await getUser()
  if (!user) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, first_name, last_name, email, avatar_url, student_id, staff_id')
    .eq('id', user.id)
    .maybeSingle()

  if (error || !data) return null

  const profile = toDTO(data as Record<string, unknown>)
  if (!profile) return null

  return { userId: user.id, email: user.email ?? profile.email, profile }
})

/** Server Component guard. Redirects signed-out users to sign-in. */
export async function requireContext(): Promise<AuthContext> {
  const context = await getContext()
  if (!context) redirect('/auth/sign-in')
  return context
}

/**
 * Server Component role guard. Redirects to the caller's own portal rather than
 * leaking the existence of another portal.
 */
export async function requireRole(...allowed: Role[]): Promise<AuthContext> {
  const context = await requireContext()

  if (!allowed.includes(context.profile.role)) {
    redirect(ROLE_HOME[context.profile.role])
  }

  return context
}

/**
 * Server Action / Route Handler guard.
 *
 * Server Actions are reachable by direct POST, so a page-level check is not
 * enough — every mutation must call this. Returns the context or throws so the
 * request never proceeds unauthenticated.
 */
export async function assertRole(
  ...allowed: Role[]
): Promise<AuthContext> {
  const context = await getContext()

  if (!context) {
    throw new Error('Unauthenticated: no valid session.')
  }

  if (!allowed.includes(context.profile.role)) {
    throw new Error(
      `Forbidden: role '${context.profile.role}' is not permitted for this action.`,
    )
  }

  return context
}
