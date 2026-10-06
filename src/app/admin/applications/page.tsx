import { Card } from '@/components/ui'
import { PortalShell } from '@/components/portal-shell'
import {
  ApplicationActions,
  type ClassOption,
} from '@/app/admin/applications/application-actions'
import { listApplications, toneForStatus } from '@/lib/dal/applications'
import { listClasses } from '@/lib/dal/students'
import { cn, formatDate, titleCase } from '@/lib/utils'

export const metadata = { title: 'Applications' }

const STATUSES = ['submitted', 'under_review', 'interview', 'accepted', 'rejected']

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  const [applications, classes] = await Promise.all([
    listApplications({ status: status || undefined, limit: 50 }),
    listClasses(),
  ])

  const classOptions: ClassOption[] = classes.map((c) => ({
    id: c.id,
    name: c.name,
    stream: c.stream,
  }))

  return (
    <PortalShell
      role="admin"
      title="Applications"
      description="Submitted applications awaiting review, with accept or reject decisions."
    >
      <Card>
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="min-w-40">
            <label
              htmlFor="status"
              className="block text-xs font-medium text-gray-600"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status ?? ''}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="">All applications</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Filter
          </button>
        </form>
      </Card>

      {applications.length === 0 ? (
        <Card className="mt-4">
          <p className="text-sm text-gray-500">No applications match this filter.</p>
        </Card>
      ) : (
        <ul className="mt-4 space-y-4">
          {applications.map((app) => (
            <li key={app.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {app.applicantName}
                      <span className="ml-2 font-normal text-gray-500">{app.applicantEmail}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Applying for {app.classApplying} · Submitted {formatDate(app.submittedAt)}
                      {app.guardianName && ` · Guardian: ${app.guardianName}`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
                      toneForStatus(app.status),
                    )}
                  >
                    {titleCase(app.status)}
                  </span>
                </div>

                {app.decisionNote && (
                  <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-700">
                    <span className="font-semibold">Decision note: </span>
                    {app.decisionNote}
                  </p>
                )}

                <ApplicationActions
                  applicationId={app.id}
                  status={app.status}
                  classes={classOptions}
                />
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PortalShell>
  )
}
