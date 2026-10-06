import { requireRole } from '@/lib/dal/auth'
import { PortalShell } from '@/components/portal-shell'
import { ReportConcernForm } from './report-concern-form'

export const metadata = { title: 'Report a concern' }

export default async function StudentReportPage() {
  await requireRole('student')

  return (
    <PortalShell
      role="student"
      title="Report a concern"
      description="Raise a safety or conduct issue without giving your name."
    >
      <div className="max-w-2xl">
        <ReportConcernForm />
      </div>
    </PortalShell>
  )
}
