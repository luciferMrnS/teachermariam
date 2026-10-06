import type { Route } from 'next'
import {
  BookOpen,
  CreditCard,
  FileText,
  Flag,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  ShieldAlert,
  UserCheck,
  Users,
} from 'lucide-react'

import type { Role } from '@/lib/rbac'

export type NavItem = {
  href: Route
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export const ROLE_NAV: Record<Role, NavItem[]> = {
  admin: [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/students', label: 'Students', icon: Users },
    { href: '/admin/staff', label: 'Staff', icon: UserCheck },
    { href: '/admin/classes', label: 'Classes', icon: BookOpen },
    { href: '/admin/fees', label: 'Fees & payments', icon: CreditCard },
    { href: '/admin/applications', label: 'Applications', icon: FileText },
    { href: '/admin/announcements', label: 'Announcements', icon: MessageSquare },
    { href: '/admin/resources', label: 'Resources', icon: ScrollText },
    { href: '/admin/reports', label: 'Safety reports', icon: ShieldAlert },
    { href: '/admin/discipline', label: 'Discipline', icon: Flag },
  ],
  facilitator: [
    { href: '/facilitator', label: 'Overview', icon: LayoutDashboard },
    { href: '/facilitator/classes', label: 'My classes', icon: BookOpen },
    { href: '/facilitator/attendance', label: 'Attendance', icon: UserCheck },
    { href: '/facilitator/gradebook', label: 'Gradebook', icon: ScrollText },
    { href: '/facilitator/resources', label: 'Resources', icon: ScrollText },
    { href: '/facilitator/complaints', label: 'Complaints', icon: MessageSquare },
    { href: '/facilitator/discipline', label: 'Discipline', icon: Flag },
  ],
  parent: [
    { href: '/parent', label: 'Overview', icon: LayoutDashboard },
    { href: '/parent/children', label: 'My children', icon: Users },
    { href: '/parent/attendance', label: 'Attendance', icon: UserCheck },
    { href: '/parent/grades', label: 'Results', icon: ScrollText },
    { href: '/parent/fees', label: 'Fees', icon: CreditCard },
    { href: '/parent/announcements', label: 'Announcements', icon: MessageSquare },
    { href: '/parent/complaints', label: 'Complaints', icon: MessageSquare },
  ],
  student: [
    { href: '/student', label: 'Overview', icon: LayoutDashboard },
    { href: '/student/attendance', label: 'My attendance', icon: UserCheck },
    { href: '/student/grades', label: 'My results', icon: ScrollText },
    { href: '/student/resources', label: 'Learning resources', icon: BookOpen },
    { href: '/student/announcements', label: 'Announcements', icon: MessageSquare },
    { href: '/student/report', label: 'Report a concern', icon: ShieldAlert },
  ],
  applicant: [
    { href: '/applicant', label: 'My application', icon: FileText },
    { href: '/applicant/announcements', label: 'Announcements', icon: MessageSquare },
  ],
}
