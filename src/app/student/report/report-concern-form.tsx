'use client'

import { useState } from 'react'

import { Card, FormAlert, SubmitButton } from '@/components/ui'

const CATEGORIES = [
  { value: 'bullying', label: 'Bullying or harassment' },
  { value: 'safety', label: 'Safety concern' },
  { value: 'abuse', label: 'Abuse or harm' },
  { value: 'theft', label: 'Theft or property' },
  { value: 'misconduct', label: 'Staff or student misconduct' },
  { value: 'other', label: 'Something else' },
] as const

type SubmitResult = {
  referenceCode: string
  contactToken: string
} | null

export function ReportConcernForm() {
  const [result, setResult] = useState<SubmitResult>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError(null)

    const form = event.currentTarget
    const data = new FormData(form)

    const payload = {
      category: data.get('category'),
      body: data.get('body'),
      incidentDate: data.get('incidentDate') || undefined,
      anonymous: true as const,
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await response.json()

      if (!response.ok) {
        setError(json.error ?? 'Something went wrong. Please try again.')
        return
      }

      setResult({ referenceCode: json.referenceCode, contactToken: json.contactToken })
      form.reset()
    } catch {
      setError('We could not reach the server. Please try again.')
    } finally {
      setPending(false)
    }
  }

  if (result) {
    return (
      <Card>
        <h2 className="text-base font-semibold text-gray-900">Report received</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Thank you. Your report has been recorded without your name. Quote the
          reference below if you speak to the school — it is not linked to you.
        </p>

        <dl className="mt-5 space-y-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Reference code
            </dt>
            <dd className="mt-1 select-all font-mono text-lg font-bold tracking-wider text-gray-900">
              {result.referenceCode}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Your private tracking token
            </dt>
            <dd className="mt-1 select-all break-all rounded-lg bg-gray-50 p-3 font-mono text-xs text-gray-800">
              {result.contactToken}
            </dd>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Save this now — we cannot show it to you again. It lets you check
              what happened to your report without revealing who you are. Do not
              share it.
            </p>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => setResult(null)}
          className="mt-6 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Submit another report
        </button>
      </Card>
    )
  }

  return (
    <Card>
      <FormAlert status={error ? 'error' : 'idle'}>{error}</FormAlert>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm leading-relaxed text-brand-900">
          This form does not ask for your name, and we do not record it. If you are
          in immediate danger, tell an adult at school or contact emergency
          services first.
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            What are you reporting?
          </label>
          <select
            id="category"
            name="category"
            required
            className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="incidentDate" className="block text-sm font-medium text-gray-700">
            When did it happen?{' '}
            <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            id="incidentDate"
            name="incidentDate"
            type="date"
            className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">
            What happened?
          </label>
          <textarea
            id="body"
            name="body"
            required
            minLength={30}
            rows={6}
            placeholder="Describe what happened, where, and who was involved. Include anything that would help us investigate."
            className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
          <p className="mt-1.5 text-xs text-gray-500">
            Avoid including your own name — it would make the report identifiable.
          </p>
        </div>

        <SubmitButton pending={pending}>Submit anonymous report</SubmitButton>
      </form>
    </Card>
  )
}
