import { requireRole } from '@/lib/dal/auth'
import { ROLE_NAV } from '@/lib/nav'
import { Card } from '@/components/ui'
import { PortalShell } from '@/components/portal-shell'

export const metadata = { title: 'Facilitator overview' }

export default async function FacilitatorOverviewPage() {
  await requireRole('facilitator')

  const items = ROLE_NAV.facilitator

  return (
    <PortalShell
      role="facilitator"
      title="Overview"
      description="Your classes, today's attendance and open work."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.slice(1).map(({ href, label, icon: Icon }) => (
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

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-gray-900">What you can do</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-600">
          <li>Take and review attendance for the classes you teach.</li>
          <li>Create assessments and record grades against them.</li>
          <li>Upload learning resources scoped to your own classes.</li>
          <li>Triage complaints and record discipline for your students.</li>
        </ul>
        <p className="mt-4 text-xs text-gray-500">
          Scope is enforced in the database, not the interface: a facilitator can
          only read or write rows belonging to classes assigned to them.
        </p>
      </Card>
    </PortalShell>
  )
}
