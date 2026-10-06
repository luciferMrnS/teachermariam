import { describe, expect, it } from 'vitest'

import {
  anonymousReportSchema,
  applicantRegistrationSchema,
  complaintSchema,
  passwordSchema,
} from '@/lib/validation'

describe('passwordSchema (spec §G: min 12, no composition rules)', () => {
  it('accepts 12+ characters of any composition', () => {
    expect(passwordSchema.safeParse('abcdefghijkl').success).toBe(true)
    expect(passwordSchema.safeParse('correct horse battery staple').success).toBe(true)
  })

  it('rejects anything shorter, even with mixed character classes', () => {
    expect(passwordSchema.safeParse('Pw1!short').success).toBe(false)
    expect(passwordSchema.safeParse('Password1!').success).toBe(false)
  })
})

describe('complaintSchema (spec FR-7.2)', () => {
  const base = { subject: 'A clear subject line', body: 'Enough detail to act on, at least twenty characters.' }

  it.each(['academic', 'financial', 'disciplinary'])('accepts %s', (category) => {
    expect(complaintSchema.safeParse({ ...base, category }).success).toBe(true)
  })

  it.each(['facilities', 'fees', 'staff', 'welfare', 'other'])('rejects legacy %s', (category) => {
    expect(complaintSchema.safeParse({ ...base, category }).success).toBe(false)
  })
})

describe('applicantRegistrationSchema password confirmation', () => {
  const base = {
    firstName: 'Adaeze',
    lastName: 'Okafor',
    email: 'adaeze@example.com',
    phone: '+2348012345678',
    dateOfBirth: '2015-03-04',
    guardianName: 'Chidi Okafor',
    guardianPhone: '+2348098765432',
    classApplying: 'Primary 4',
    statement: 'A statement comfortably longer than forty characters for testing.',
    password: 'correct horse battery staple',
  }

  it('accepts matching passwords', () => {
    const parsed = applicantRegistrationSchema.safeParse({ ...base, confirmPassword: base.password })
    expect(parsed.success).toBe(true)
  })

  it('rejects mismatched passwords on confirmPassword', () => {
    const parsed = applicantRegistrationSchema.safeParse({ ...base, confirmPassword: 'something else entirely' })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.flatten().fieldErrors.confirmPassword).toContain('Passwords do not match.')
    }
  })

  it('rejects a missing confirmation', () => {
    expect(applicantRegistrationSchema.safeParse(base).success).toBe(false)
  })
})

describe('anonymousReportSchema', () => {
  it('requires the anonymity flag so a caller cannot opt out silently', () => {
    const body = { category: 'safety', body: 'A detailed report body with more than thirty characters.' }
    expect(anonymousReportSchema.safeParse({ ...body, anonymous: true }).success).toBe(true)
    expect(anonymousReportSchema.safeParse(body).success).toBe(false)
  })
})
