import { Card } from '@/components/ui'
import { PortalShell } from '@/components/portal-shell'
import { listMyApplications, toneForStatus } from '@/lib/dal/applications'
import { requireRole } from '@/lib/dal/auth'
import { cn, formatDate, titleCase } from '@/lib/utils'

export const metadata = { title: 'My application' }

const EXPLAINER: Record<string, string> = {
  draft: 'Your application is saved but not yet submitted.',
  submitted: 'We have your application and it is waiting to be picked up for review.',
  under_review: 'The admissions team is reviewing your application.',
  interview: 'You have been invited for an interview. Check your email for details.',
  accepted: 'Congratulations — your application has been accepted.',
  rejected: 'Your application was not successful this time.',
  withdrawn: 'This application was withdrawn.',
}

export default async function ApplicantPortalPage() {
  await requireRole('applicant')
  const applications = await listMyApplications()

  return (
    <PortalShell
      role="applicant"
      title="My application"
      description="Track the status of your application to the school."
    >
      {applications.length === 0 ? (
        <Card>
          <h2 className="text-sm font-semibold text-gray-900">No application yet</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Start an application to submit your details to the admissions team.
          </p>
          <a
            href="/auth/apply"
            className="mt-4 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Start an application
          </a>
        </Card>
      ) : (
        <ul className="space-y-4">
          {applications.map((app) => (
            <li key={app.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Applying for {app.classApplying}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Submitted {formatDate(app.submittedAt)}
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

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {EXPLAINER[app.status] ?? ''}
                </p>

                {app.decisionNote && (
                  <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-700">
                    <span className="font-semibold">Note from admissions: </span>
                    {app.decisionNote}
                  </p>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PortalShell>
  )
}
