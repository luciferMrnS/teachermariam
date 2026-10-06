import { Card } from '@/components/ui'
import { PortalShell } from '@/components/portal-shell'
import { listStaff } from '@/lib/dal/staff'
import { cn, titleCase } from '@/lib/utils'

export const metadata = { title: 'Staff' }

const STATUS_TONE: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  on_leave: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  suspended: 'bg-red-50 text-red-700 ring-red-600/20',
  inactive: 'bg-gray-100 text-gray-600 ring-gray-500/20',
}

const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'visiting']
const STATUSES = ['active', 'on_leave', 'suspended', 'inactive']

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; status?: string }>
}) {
  const { q, type: employmentType, status } = await searchParams

  const members = await listStaff({ search: q, employmentType, status, limit: 50 })

  return (
    <PortalShell
      role="admin"
      title="Staff"
      description="The staff directory: employment type, status and contact."
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
              htmlFor="type"
              className="block text-xs font-medium text-gray-600"
            >
              Employment
            </label>
            <select
              id="type"
              name="type"
              defaultValue={employmentType ?? ''}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="">Any type</option>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {titleCase(t)}
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

      <Card className="mt-4 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Staff directory</caption>
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Staff no.
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Name
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Employment
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
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    No staff match these filters.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-900 tabular-nums">
                      {m.staffNumber}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-gray-900">{m.fullName}</span>
                      <span className="block text-xs text-gray-500">{m.email}</span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {titleCase(m.employmentType)}
                      {m.specialization && (
                        <span className="block text-xs text-gray-500">{m.specialization}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset',
                          STATUS_TONE[m.status] ?? STATUS_TONE.inactive,
                        )}
                      >
                        {titleCase(m.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 tabular-nums">
                      {m.phone ?? '—'}
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
