'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ROLE_NAV } from '@/lib/nav'
import type { Role } from '@/lib/rbac'
import { cn } from '@/lib/utils'

/**
 * Navigation links for one role. This is a client component so it can read the
 * current pathname and mark the active item; the surrounding shell stays a
 * Server Component.
 */
export function PortalNavLinks({
  role,
  variant = 'sidebar',
  onNavigate,
}: {
  role: Role
  variant?: 'sidebar' | 'drawer'
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const items = ROLE_NAV[role]

  return (
    <ul
      className={cn(
        'space-y-0.5',
        variant === 'drawer' && 'flex flex-col gap-1',
      )}
    >
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href

        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-gradient text-white shadow-md shadow-brand-600/25'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{label}</span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
