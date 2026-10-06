import { requireRole } from '@/lib/dal/auth'
import { signOutAction } from '@/app/auth/actions'
import { MobileNav } from '@/components/mobile-nav'
import { PortalNavLinks } from '@/components/portal-nav-links'
import { ROLE_LABELS, type Role } from '@/lib/rbac'
import { initials } from '@/lib/utils'
import { LogOut, ShieldCheck } from 'lucide-react'

export async function PortalShell({
  role,
  title,
  description,
  actions,
  children,
}: {
  role: Role
  title: string
  description: string
  actions?: React.ReactNode
  children: React.ReactNode
}) {
  await requireRole(role)

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <PortalSidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <PortalTopbar role={role} title={title} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  {title}
                </h1>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              </div>
              {actions}
            </div>
            <div className="mt-6">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}

async function PortalSidebar({ role }: { role: Role }) {
  const context = await requireRole(role)

  return (
    <aside className="hidden w-64 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-200 px-5">
        <span
          aria-hidden
          className="bg-brand-gradient grid size-8 place-items-center rounded-lg text-sm font-bold text-white shadow-md shadow-brand-600/25"
        >
          M
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">Teacher Mariam</p>
          <p className="truncate text-xs text-gray-500">
            {ROLE_LABELS[role]}
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <PortalNavLinks role={role} />
      </nav>
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700"
          >
            {initials(context.profile.fullName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {context.profile.fullName}
            </p>
            <p className="truncate text-xs text-gray-500">{context.profile.email}</p>
          </div>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}

async function PortalTopbar({ role, title }: { role: Role; title: string }) {
  const context = await requireRole(role)

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2.5">
        <MobileNav
          role={role}
          fullName={context.profile.fullName}
          email={context.profile.email}
          initials={initials(context.profile.fullName)}
        />
          <span
            aria-hidden
            className="bg-brand-gradient grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold text-white shadow-md shadow-brand-600/25 lg:hidden"
          >
            M
          </span>
        <p className="truncate text-sm font-semibold text-gray-900 lg:hidden">
          {title}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-50 to-accent-50 px-2.5 py-1 text-xs font-medium text-brand-800 ring-1 ring-inset ring-brand-600/15 sm:inline-flex">
          <ShieldCheck className="size-3.5" aria-hidden />
          {ROLE_LABELS[role]}
        </span>
        <span
          aria-hidden
          className="grid size-8 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 lg:hidden"
        >
          {initials(context.profile.fullName)}
        </span>
      </div>
    </header>
  )
}
