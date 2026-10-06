import type { Route } from 'next'

export const ROLES = [
  'admin',
  'facilitator',
  'parent',
  'student',
  'applicant',
] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  facilitator: 'Facilitator',
  parent: 'Parent',
  student: 'Student',
  applicant: 'Prospective Student',
}

export const PORTAL_PREFIXES = [
  '/admin',
  '/facilitator',
  '/parent',
  '/student',
  '/applicant',
] as const

export const ROLE_HOME = {
  admin: '/admin',
  facilitator: '/facilitator',
  parent: '/parent',
  student: '/student',
  applicant: '/applicant',
} as const satisfies Record<Role, Route>

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}

/**
 * Capability names are module-scoped and suffixed with the action they gate so a
 * permission can never be reused across modules under a misleading name.
 */
export const PERMISSIONS = [
  // Students & staff records
  'students:read',
  'students:read_own',
  'students:write',
  'staff:read',
  'staff:write',
  // Academics
  'classes:read',
  'classes:write',
  'courses:read',
  'courses:write',
  'attendance:read',
  'attendance:read_own',
  'attendance:write',
  'grades:read',
  'grades:read_own',
  'grades:write',
  // Fees
  'fees:read',
  'fees:read_own',
  'fees:write',
  'payments:record',
  // Communication
  'announcements:read',
  'announcements:write',
  // Resources
  'resources:read',
  'resources:write',
  // Registration
  'applications:read',
  'applications:read_own',
  'applications:submit',
  'applications:review',
  // Complaints & feedback
  'complaints:read',
  'complaints:read_own',
  'complaints:submit',
  'complaints:triage',
  // Anonymous reporting
  'reports:submit',
  // Committee-only (spec FR-8.4): never granted by role. Membership in the
  // oversight committee is checked in the DAL/RLS, not here.
  'reports:investigate',
  // Discipline
  'discipline:read',
  'discipline:read_own',
  'discipline:record',
  'discipline:resolve',
  // Administration
  'settings:manage',
  'users:manage',
  'audit:read',
] as const

export type Permission = (typeof PERMISSIONS)[number]

const READ_ONLY: Permission[] = [
  'students:read_own',
  'attendance:read_own',
  'grades:read_own',
  'fees:read_own',
  'applications:read_own',
  'complaints:read_own',
  'complaints:submit',
  'reports:submit',
  'discipline:read_own',
  'announcements:read',
  'resources:read',
  'classes:read',
]

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  // NB: admin holds every permission EXCEPT reports:investigate. Anonymous
  // reports are committee-only (spec FR-8.4) — an admin off the committee is
  // denied, so the grant must never come from the role.
  admin: PERMISSIONS.filter((p) => p !== 'reports:investigate'),
  facilitator: [
    'students:read',
    'staff:read',
    'classes:read',
    'courses:read',
    'attendance:read',
    'attendance:write',
    'grades:read',
    'grades:write',
    'announcements:read',
    'announcements:write',
    'resources:read',
    'resources:write',
    'complaints:read',
    'complaints:triage',
    'discipline:read',
    'discipline:record',
  ],
  parent: [
    'students:read_own',
    'attendance:read_own',
    'grades:read_own',
    'fees:read_own',
    'announcements:read',
    'resources:read',
    'classes:read',
    'applications:submit',
    'applications:read_own',
    'complaints:read_own',
    'complaints:submit',
    'reports:submit',
    'discipline:read_own',
  ],
  student: READ_ONLY,
  applicant: [
    'applications:submit',
    'applications:read_own',
    'announcements:read',
    'complaints:submit',
    'reports:submit',
  ],
}

export function can(role: Role | null | undefined, permission: Permission) {
  if (!role) return false
  return ROLE_PERMISSIONS[role].includes(permission)
}
