import { describe, expect, it } from 'vitest'

import { safePortalNext } from '@/lib/redirects'

// The sign-in action and the auth callback both trust this helper. An
// open-redirect here would turn every login email into a phishing vector.
describe('safePortalNext', () => {
  it('accepts a portal path, preserving the query string', () => {
    expect(safePortalNext('/admin/students?page=2')).toBe('/admin/students?page=2')
    expect(safePortalNext('/parent')).toBe('/parent')
  })

  it('rejects absolute and protocol-relative URLs', () => {
    expect(safePortalNext('https://evil.example/admin')).toBeNull()
    expect(safePortalNext('//evil.example/admin')).toBeNull()
  })

  it('rejects backslashes and control characters', () => {
    expect(safePortalNext('/admin\\evil')).toBeNull()
    expect(safePortalNext('/admin\nevil')).toBeNull()
  })

  it('rejects non-portal paths and empty input', () => {
    expect(safePortalNext('/api/reports')).toBeNull()
    expect(safePortalNext('/')).toBeNull()
    expect(safePortalNext('')).toBeNull()
    expect(safePortalNext(null)).toBeNull()
    expect(safePortalNext(undefined)).toBeNull()
  })
})
