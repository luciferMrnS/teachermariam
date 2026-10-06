import { describe, expect, it } from 'vitest'

import { initials, titleCase } from '@/lib/utils'

describe('initials', () => {
  it('takes the first two name parts, upper-cased', () => {
    expect(initials('Adaeze Okafor')).toBe('AO')
    expect(initials('  chidi  eze  nwachukwu ')).toBe('CE')
    expect(initials('Mariam')).toBe('M')
  })
})

describe('titleCase', () => {
  it('humanises status slugs for badges', () => {
    expect(titleCase('under_review')).toBe('Under Review')
    expect(titleCase('submitted')).toBe('Submitted')
  })
})
