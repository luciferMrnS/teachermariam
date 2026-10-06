import { Card } from '@/components/ui'
import { PortalShell } from '@/components/portal-shell'
import { listClasses, listStudents } from '@/lib/dal/students'
import { cn } from '@/lib/utils'

export const metadata = { title: 'Students' }

const STATUS_TONE: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  graduated: 'bg-brand-50 text-brand-700 ring-brand-600/20',
  withdrawn: 'bg-gray-100 text-gray-700 ring-gray-500/20',
  transferred: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  deceased: 'bg-gray-100 text-gray-600 ring-gray-500/20',
}

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; class?: string; status?: string }>
}) {
  const { q, class: classId, status } = await searchParams

  const [students, classes] = await Promise.all([
    listStudents({ search: q, classId, status, limit: 50 }),
    listClasses(),
  ])

  return (
    <PortalShell
      role="admin"
      title="Students"
      description="Every enrolled student and their current class."
    >
      <Card>
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="min-w-48 flex-1">
            <label
              htmlFor="q"
              className="block text-xs font-medium text-gray-600"
            >
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={q ?? ''}
              placeholder="First name"
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </div>

          <div className="min-w-40">
            <label
              htmlFor="class"
              className="block text-xs font-medium text-gray-600"
            >
              Class
            </label>
            <select
              id="class"
              name="class"
              defaultValue={classId ?? ''}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="">All classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.stream ? ` — ${c.stream}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-36">
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
              <option value="">Any status</option>
              {['active', 'graduated', 'withdrawn', 'transferred'].map((s) => (
                <option key={s} value={s}>
                  {s[0]!.toUpperCase() + s.slice(1)}
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

      <Card className="mt-4 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Student roster</caption>
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Admission no.
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Name
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Class
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No students match these filters.
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-900 tabular-nums">
                      {s.admissionNumber}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-gray-900">{s.fullName}</span>
                      <span className="block text-xs text-gray-500">{s.email}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {s.className ?? '—'}
                      {s.stream && (
                        <span className="block text-xs text-gray-500">{s.stream}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset',
                          STATUS_TONE[s.status] ?? STATUS_TONE.withdrawn,
                        )}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 tabular-nums">
                      {s.phone ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PortalShell>
  )
}
