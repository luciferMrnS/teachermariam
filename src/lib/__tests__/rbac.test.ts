import { describe, expect, it } from 'vitest'

import { can } from '@/lib/rbac'

// Spec §C permission matrix, encoded as negative + positive cases. These are
// the load-bearing denials: if any of them flips to `true`, a role boundary
// has silently widened.
describe('role permissions', () => {
  it('denies anonymous-report investigation to every role (FR-8.4, committee-only)', () => {
    for (const role of ['admin', 'facilitator', 'parent', 'student', 'applicant'] as const) {
      expect(can(role, 'reports:investigate')).toBe(false)
    }
  })

  it('denies a forged or absent role everything', () => {
    expect(can(null, 'students:read')).toBe(false)
    expect(can(undefined, 'students:read')).toBe(false)
  })

  it('keeps admin broad but scoped: students/fees/audit yes, reports no', () => {
    expect(can('admin', 'students:write')).toBe(true)
    expect(can('admin', 'fees:write')).toBe(true)
    expect(can('admin', 'audit:read')).toBe(true)
    expect(can('admin', 'reports:investigate')).toBe(false)
  })

  it('scopes facilitator to teaching duties, not oversight', () => {
    expect(can('facilitator', 'attendance:write')).toBe(true)
    expect(can('facilitator', 'grades:write')).toBe(true)
    expect(can('facilitator', 'reports:investigate')).toBe(false)
    expect(can('facilitator', 'fees:write')).toBe(false)
  })

  it('limits applicant to applying and reading announcements', () => {
    expect(can('applicant', 'applications:submit')).toBe(true)
    expect(can('applicant', 'announcements:read')).toBe(true)
    expect(can('applicant', 'students:read')).toBe(false)
    expect(can('applicant', 'grades:read')).toBe(false)
  })

  it('gives student self-only reads, never school-wide ones', () => {
    expect(can('student', 'grades:read_own')).toBe(true)
    expect(can('student', 'reports:submit')).toBe(true)
    expect(can('student', 'grades:read')).toBe(false)
    expect(can('student', 'students:read')).toBe(false)
  })
})
