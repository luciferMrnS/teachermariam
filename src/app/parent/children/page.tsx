import { Card } from '@/components/ui'
import { PortalShell } from '@/components/portal-shell'
import { listMyChildren } from '@/lib/dal/guardianships'
import { cn, titleCase } from '@/lib/utils'

export const metadata = { title: 'My children' }

const STATUS_TONE: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  graduated: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  withdrawn: 'bg-gray-100 text-gray-700 ring-gray-500/20',
  transferred: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  deceased: 'bg-gray-100 text-gray-600 ring-gray-500/20',
}

export default async function ParentChildrenPage() {
  const children = await listMyChildren()

  return (
    <PortalShell
      role="parent"
      title="My children"
      description="Each linked child's class, enrolment and guardian relationship."
    >
      {children.length === 0 ? (
        <Card>
          <h2 className="text-sm font-semibold text-gray-900">No linked children</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            No students are linked to your account yet. If your child is
            enrolled, contact the school administrator to link them.
          </p>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {children.map((child) => (
            <li key={child.studentId}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{child.fullName}</p>
                    <p className="mt-0.5 text-xs text-gray-500 tabular-nums">
                      {child.admissionNumber} · {child.relationshipLabel}
                      {child.isPrimary && ' · Primary'}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset',
                      STATUS_TONE[child.status] ?? STATUS_TONE.withdrawn,
                    )}
                  >
                    {titleCase(child.status)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  {child.className ?? 'No class assigned'}
                  {child.stream && (
                    <span className="text-gray-500"> — {child.stream}</span>
                  )}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </PortalShell>
  )
}
