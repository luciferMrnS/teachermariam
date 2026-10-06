import Link from 'next/link'

import { SubmitButton } from '@/components/ui'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="bg-mesh-light flex min-h-dvh flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2.5 justify-center"
        >
          <span
            aria-hidden
            className="bg-brand-gradient grid size-9 place-items-center rounded-lg text-sm font-bold text-white shadow-md shadow-brand-600/30"
          >
            M
          </span>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            Teacher Mariam
          </span>
        </Link>

        <div className="card p-6 sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
      </div>
    </div>
  )
}

export function Divider() {
  return <div className="my-6 h-px bg-gray-200" />
}

export { SubmitButton }
