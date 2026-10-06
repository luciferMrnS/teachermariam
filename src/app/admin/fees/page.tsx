import { Card } from '@/components/ui'
import { PortalShell } from '@/components/portal-shell'
import { listFeeSummaries, listInvoices } from '@/lib/dal/fees'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

export const metadata = { title: 'Fees & payments' }

const STATUS_TONE: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  partially_paid: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  pending: 'bg-gray-100 text-gray-700 ring-gray-500/20',
  overdue: 'bg-red-50 text-red-700 ring-red-600/20',
  waived: 'bg-brand-50 text-brand-700 ring-brand-600/20',
}

export default async function AdminFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  const [invoices, summaries] = await Promise.all([
    listInvoices({ status }),
    listFeeSummaries(),
  ])

  return (
    <PortalShell
      role="admin"
      title="Fees & payments"
      description="Invoices, receipts and outstanding balances."
    >
      {/*
        Amounts are never totalled across currencies. One metric row per
        currency the school actually invoices in.
      */}
      {summaries.map((summary) => (
        <div key={summary.currency} className="mb-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {summary.currency}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Billed"
              value={formatCurrency(summary.billed, summary.currency)}
            />
            <Metric
              label="Collected"
              value={formatCurrency(summary.collected, summary.currency)}
            />
            <Metric
              label="Outstanding"
              value={formatCurrency(summary.outstanding, summary.currency)}
              tone={summary.outstanding > 0 ? 'warn' : 'ok'}
            />
            <Metric
              label="Overdue invoices"
              value={String(summary.overdueCount)}
              tone={summary.overdueCount > 0 ? 'warn' : 'ok'}
            />
          </div>
        </div>
      ))}

      <Card className="mt-4">
        <form method="get" className="flex flex-wrap items-end gap-3">
          <div className="min-w-40">
            <label htmlFor="status" className="block text-xs font-medium text-gray-600">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={status ?? ''}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            >
              <option value="">All statuses</option>
              {['pending', 'partially_paid', 'paid', 'overdue', 'waived'].map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())}
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
            <caption className="sr-only">Invoices</caption>
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">Invoice</th>
                <th scope="col" className="px-5 py-3 font-semibold">Student</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Payable</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Paid</th>
                <th scope="col" className="px-5 py-3 text-right font-semibold">Balance</th>
                <th scope="col" className="px-5 py-3 font-semibold">Status</th>
                <th scope="col" className="px-5 py-3 font-semibold">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="transition-colors hover:bg-gray-50">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-900 tabular-nums">
                      {inv.invoiceNumber}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-gray-900">{inv.studentName}</span>
                      <span className="block text-xs text-gray-500 tabular-nums">
                        {inv.admissionNumber}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">
                      {formatCurrency(inv.totalAmount - inv.discount, inv.currency)}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600 tabular-nums">
                      {formatCurrency(inv.amountPaid, inv.currency)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900 tabular-nums">
                      {formatCurrency(inv.balance, inv.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                          STATUS_TONE[inv.status] ?? STATUS_TONE.pending,
                        )}
                      >
                        {inv.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-gray-600">
                      {inv.dueOn ? formatDate(inv.dueOn) : '—'}
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

function Metric({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string
  tone?: 'default' | 'ok' | 'warn'
}) {
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p
        className={cn(
          'mt-2 text-2xl font-bold tracking-tight tabular-nums',
          tone === 'warn' ? 'text-red-600' : 'text-gray-900',
        )}
      >
        {value}
      </p>
    </div>
  )
}
