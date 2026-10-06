import Link from 'next/link'

import { Card } from '@/components/ui'
import { PortalShell } from '@/components/portal-shell'
import { requireRole } from '@/lib/dal/auth'
import { ROLE_NAV } from '@/lib/nav'
import type { Role } from '@/lib/rbac'

/**
 * Shared placeholder for a module that is not built yet. The route is real and
 * role-guarded, so navigation, the proxy and RLS all behave exactly as they will
 * once the module is filled in.
 */
export async function ModulePlaceholder({
  role,
  module,
  description,
}: {
  role: Role
  module: string
  description: string
}) {
  await requireRole(role)

  return (
    <PortalShell role={role} title={module} description={description}>
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-prose">
            <h2 className="text-sm font-semibold text-gray-900">{module}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{description}</p>
          </div>
          <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
            Coming next
          </span>
        </div>
      </Card>

      <nav aria-label="Other modules" className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Other modules
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {ROLE_NAV[role].map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Icon className="size-3.5 text-gray-400" aria-hidden />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </PortalShell>
  )
}
