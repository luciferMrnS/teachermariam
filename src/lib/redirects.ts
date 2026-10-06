import type { Route } from 'next'

import { PORTAL_PREFIXES } from '@/lib/rbac'

/**
 * Validates a post-authentication redirect target.
 *
 * Returns a `Route` only when the value is a single-slash-prefixed path that
 * lands inside a portal. Everything else — absolute URLs, protocol-relative
 * `//host` values, backslashes, control characters, and paths outside the
 * portals — yields `null` so the caller can fall back to a known-good page.
 *
 * Both the sign-in Server Action and the OAuth/email callback must use this,
 * otherwise one of them becomes an open-redirect.
 */
export function safePortalNext(value: string | null | undefined): Route | null {
  if (typeof value !== 'string' || value.length === 0) return null

  if (!value.startsWith('/')) return null
  if (value.startsWith('//')) return null
  if (value.includes('\\')) return null
  if (/[\u0000-\u001f]/.test(value)) return null

  const path = value.split(/[?#]/)[0] ?? value

  const isPortal = PORTAL_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  )

  return isPortal ? (value as Route) : null
}
