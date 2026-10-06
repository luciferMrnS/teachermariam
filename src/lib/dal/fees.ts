import 'server-only'

import { cache } from 'react'

import { assertRole } from '@/lib/dal/auth'
import { createClient } from '@/lib/supabase/server'
import type { FeeStatus } from '@/lib/supabase/database.types'

export type InvoiceDTO = {
  id: string
  invoiceNumber: string
  studentId: string
  studentName: string
  admissionNumber: string
  currency: string
  totalAmount: number
  discount: number
  amountPaid: number
  balance: number
  status: string
  dueOn: string | null
}

export type FeeSummary = {
  currency: string
  billed: number
  collected: number
  outstanding: number
  invoiceCount: number
  overdueCount: number
}

const INVOICE_SELECT = `
  id,
  invoice_number,
  student_id,
  currency,
  total_amount,
  discount,
  amount_paid,
  status,
  due_on,
  students (
    admission_number,
    profiles!students_profile_id_fkey (first_name, last_name)
  )
`

function toInvoiceDTO(row: unknown): InvoiceDTO {
  const r = row as {
    id: string
    invoice_number: string
    student_id: string
    currency: string
    total_amount: number
    discount: number
    amount_paid: number
    status: string
    due_on: string | null
    students: {
      admission_number: string
      profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null
    } | null
  }

  const student = Array.isArray(r.students) ? r.students[0] : r.students
  const profile = student?.profiles
    ? Array.isArray(student.profiles)
      ? student.profiles[0]
      : student.profiles
    : null

  const total = Number(r.total_amount)
  const discount = Number(r.discount)
  const paid = Number(r.amount_paid)

  return {
    id: r.id,
    invoiceNumber: r.invoice_number,
    studentId: r.student_id,
    studentName:
      profile && `${profile.first_name} ${profile.last_name}`.trim()
        ? `${profile.first_name} ${profile.last_name}`.trim()
        : 'Unknown student',
    admissionNumber: student?.admission_number ?? '—',
    currency: r.currency,
    totalAmount: total,
    discount,
    amountPaid: paid,
    balance: Math.max(0, total - discount - paid),
    status: r.status,
    dueOn: r.due_on,
  }
}

export const listInvoices = cache(
  async (filters: { status?: string; limit?: number } = {}): Promise<InvoiceDTO[]> => {
    await assertRole('admin')

    const supabase = await createClient()
    const limit = Math.min(filters.limit ?? 50, 200)

    let query = supabase
      .from('invoices')
      .select(INVOICE_SELECT)
      .order('due_on', { ascending: true })
      .limit(limit)

    if (filters.status) query = query.eq('status', filters.status as FeeStatus)

    const { data, error } = await query
    if (error) throw new Error(`Failed to list invoices: ${error.message}`)

    return (data ?? []).map(toInvoiceDTO)
  },
)

/**
 * Totals are computed in Postgres rather than in JS so a single source of truth
 * answers the money question, even as row counts grow.
 *
 * `fee_summary()` groups by currency and therefore returns one row per currency
 * in use. They are never summed together: NGN 1,000 and USD 1 added is not a
 * number. Callers render a figure per currency, or pick one explicitly.
 */
export const listFeeSummaries = cache(async (): Promise<FeeSummary[]> => {
  await assertRole('admin')

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('fee_summary' as never)

  if (error) {
    throw new Error(`Failed to compute fee summary: ${error.message}`)
  }

  const rows = (Array.isArray(data) ? data : [data]) as Array<{
    currency: string
    billed: number
    collected: number
    outstanding: number
    invoice_count: number
    overdue_count: number
  } | null>

  return rows
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .map((row) => ({
      // `currency` is char(3) in Postgres, so PostgREST pads it to a fixed width.
      currency: String(row.currency).trim(),
      billed: Number(row.billed ?? 0),
      collected: Number(row.collected ?? 0),
      outstanding: Number(row.outstanding ?? 0),
      invoiceCount: Number(row.invoice_count ?? 0),
      overdueCount: Number(row.overdue_count ?? 0),
    }))
})
