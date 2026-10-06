import { requireRole } from '@/lib/dal/auth'
import { ROLE_NAV } from '@/lib/nav'
import { Card } from '@/components/ui'
import { PortalShell } from '@/components/portal-shell'

export const metadata = { title: 'Parent overview' }

export default async function ParentOverviewPage() {
  await requireRole('parent')

  return (
    <PortalShell
      role="parent"
      title="Overview"
      description="A summary of your children's week."
    >
      <Card>
        <h2 className="text-sm font-semibold text-gray-900">Your children</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Children are linked to you through a guardianship record. You only ever
          see the children linked to your account — this is enforced by a database
          policy, not by the page.
        </p>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ROLE_NAV.parent.slice(1).map(({ href, label, icon: Icon }) => (
          <a
            key={href}
            href={href}
            className="card p-5 transition-shadow hover:shadow-md"
          >
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-lg bg-brand-50 text-brand-600"
            >
              <Icon className="size-4" />
            </span>
            <p className="mt-3.5 text-sm font-semibold text-gray-900">{label}</p>
            <p className="mt-1 text-xs text-gray-500">Open module</p>
          </a>
        ))}
      </div>
    </PortalShell>
  )
}
