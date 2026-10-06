import { requireRole } from '@/lib/dal/auth'
import { Card } from '@/components/ui'
import { PortalShell } from '@/components/portal-shell'
import { ROLE_NAV } from '@/lib/nav'

export const metadata = { title: 'Student overview' }

export default async function StudentOverviewPage() {
  await requireRole('student')

  return (
    <PortalShell
      role="student"
      title="Overview"
      description="Your attendance, results and what's due."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ROLE_NAV.student.slice(1).map(({ href, label, icon: Icon }) => (
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
        <h2 className="text-sm font-semibold text-gray-900">Something wrong?</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          If you need to report bullying, a safety concern or misconduct, use the
          anonymous reporting channel. You can file a report without giving your
          name, and follow it using the reference code you are given.
        </p>
        <a
          href="/student/report"
          className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Report a concern
        </a>
      </Card>
    </PortalShell>
  )
}
