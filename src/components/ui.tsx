import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function Card({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={cn('card p-5 sm:p-6', className)}>{children}</div>
}

export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null
  return (
    <p className="mt-1.5 text-sm text-red-600" role="alert">
      {errors[0]}
    </p>
  )
}

export function FormAlert({
  status,
  children,
}: {
  status: 'idle' | 'error' | 'success'
  children?: ReactNode
}) {
  if (status === 'idle' || !children) return null

  const isError = status === 'error'

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={cn(
        'rounded-lg border px-3.5 py-2.5 text-sm',
        isError
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-emerald-200 bg-emerald-50 text-emerald-800',
      )}
    >
      {children}
    </div>
  )
}

export function SubmitButton({
  pending,
  children,
  className,
}: {
  pending: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        'inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white',
        'transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      {pending && (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      {children}
    </button>
  )
}
