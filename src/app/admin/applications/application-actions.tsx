'use client'

import { useActionState } from 'react'

import { initialAuthState } from '@/app/auth/state'
import { FieldError, FormAlert, SubmitButton } from '@/components/ui'
import { enrolApplicantAction, reviewApplicationAction } from '@/app/admin/applications/actions'

export type ClassOption = { id: string; name: string; stream: string | null }

const PENDING = ['submitted', 'under_review', 'interview']

/** Per-application review + enrol controls for the admin queue. */
export function ApplicationActions({
  applicationId,
  status,
  classes,
}: {
  applicationId: string
  status: string
  classes: ClassOption[]
}) {
  const [reviewState, reviewAction, reviewPending] = useActionState(
    reviewApplicationAction,
    initialAuthState,
  )
  const [enrolState, enrolAction, enrolPending] = useActionState(
    enrolApplicantAction,
    initialAuthState,
  )

  if (!PENDING.includes(status)) return null

  return (
    <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
      <FormAlert status={reviewState.status === 'error' ? 'error' : 'idle'}>
        {reviewState.status === 'error' ? reviewState.message : undefined}
      </FormAlert>
      <FormAlert status={enrolState.status === 'error' ? 'error' : 'idle'}>
        {enrolState.status === 'error' ? enrolState.message : undefined}
      </FormAlert>
      {enrolState.status === 'success' && (
        <p className="text-xs font-medium text-emerald-700">{enrolState.message}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {status === 'submitted' && (
          <PlainPost action={reviewAction} applicationId={applicationId} status="under_review" label="Start review" pending={reviewPending} />
        )}
        {status === 'under_review' && (
          <PlainPost action={reviewAction} applicationId={applicationId} status="interview" label="Invite to interview" pending={reviewPending} />
        )}
        <details className="text-xs">
          <summary className="cursor-pointer font-medium text-red-700 hover:text-red-800">
            Reject…
          </summary>
          <form action={reviewAction} className="mt-2 space-y-2">
            <input type="hidden" name="applicationId" value={applicationId} />
            <input type="hidden" name="status" value="rejected" />
            <label className="block">
              <span className="sr-only">Decision note</span>
              <textarea
                name="decisionNote"
                rows={2}
                placeholder="Reason (shown to the applicant)"
                className="block w-64 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </label>
            <FieldError errors={reviewState.fieldErrors?.decisionNote} />
            <SubmitButton pending={reviewPending} className="w-auto px-3 py-1.5 text-xs">
              Reject application
            </SubmitButton>
          </form>
        </details>
      </div>

      <form action={enrolAction} className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="applicationId" value={applicationId} />
        <label className="block">
          <span className="block text-xs font-medium text-gray-600">Enrol into</span>
          <select
            name="classId"
            required
            defaultValue=""
            className="mt-1 block w-48 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.stream ? ` — ${c.stream}` : ''}
              </option>
            ))}
          </select>
        </label>
        <FieldError errors={enrolState.fieldErrors?.classId} />
        <SubmitButton pending={enrolPending} className="w-auto px-3 py-1.5 text-xs">
          Accept & enrol
        </SubmitButton>
      </form>
    </div>
  )
}

function PlainPost({
  action,
  applicationId,
  status,
  label,
  pending,
}: {
  action: (payload: FormData) => void
  applicationId: string
  status: 'under_review' | 'interview' | 'rejected'
  label: string
  pending: boolean
}) {
  return (
    <form action={action}>
      <input type="hidden" name="applicationId" value={applicationId} />
      <input type="hidden" name="status" value={status} />
      <SubmitButton pending={pending} className="w-auto bg-white px-3 py-1.5 text-xs text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
        {label}
      </SubmitButton>
    </form>
  )
}
