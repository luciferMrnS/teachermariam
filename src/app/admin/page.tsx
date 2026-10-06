import { CreditCard, Flag, MessageSquare, ShieldAlert, UserCheck, Users } from 'lucide-react'

import { Card } from '@/components/ui'
import { PortalShell } from '@/components/portal-shell'
import { requireRole } from '@/lib/dal/auth'

export const metadata = { title: 'Admin overview' }

export default async function AdminOverviewPage() {
  await requireRole('admin')

  return (
    <PortalShell
      role="admin"
      title="Overview"
      description="The state of the school right now."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          href="/admin/students"
          icon={Users}
          label="Students"
          value="—"
          hint="Roster"
        />
        <StatCard
          href="/admin/staff"
          icon={UserCheck}
          label="Staff"
          value="—"
          hint="Directory"
        />
        <StatCard
          href="/admin/fees"
          icon={CreditCard}
          label="Fees collected"
          value="—"
          hint="This session"
        />
        <StatCard
          href="/admin/applications"
          icon={MessageSquare}
          label="Open complaints"
          value="—"
          hint="Awaiting triage"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-gray-900">At a glance</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            The live figures below are computed by Postgres views so every portal
            reports the same number. They populate once the reporting migration is
            applied and the seed data is loaded.
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            {['Active students', 'Active staff', 'Classes', 'New applications', 'Open discipline'].map(
              (label) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="text-gray-600">{label}</dt>
                  <dd className="font-medium text-gray-900 tabular-nums">—</dd>
                </div>
              ),
            )}
          </dl>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-gray-900">Needs attention</h2>
          <ul className="mt-3 space-y-2.5 text-sm">
            <AttentionRow
              href="/admin/reports"
              icon={ShieldAlert}
              label="Anonymous safety reports"
            />
            <AttentionRow
              href="/admin/discipline"
              icon={Flag}
              label="Open discipline cases"
            />
            <AttentionRow
              href="/admin/complaints"
              icon={MessageSquare}
              label="Complaints awaiting a response"
            />
          </ul>
        </Card>
      </div>
    </PortalShell>
  )
}

function StatCard({
  href,
  icon: Icon,
  label,
  value,
  hint,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint: string
}) {
  return (
    <a href={href} className="card card-hover p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="bg-brand-gradient grid size-8 place-items-center rounded-lg text-white shadow-md shadow-brand-600/25"
        >
          <Icon className="size-4" />
        </span>
        <p className="text-sm font-medium text-gray-600">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900 tabular-nums">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-gray-500">{hint}</p>
    </a>
  )
}

function AttentionRow({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <li>
      <a
        href={href}
        className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 -mx-2 text-gray-700 transition-colors hover:bg-gray-50"
      >
        <Icon className="size-4 shrink-0 text-gray-400" aria-hidden />
        <span>{label}</span>
      </a>
    </li>
  )
}
