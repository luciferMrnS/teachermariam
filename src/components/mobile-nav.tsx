'use client'

import { useEffect, useState } from 'react'
import { LogOut, Menu, X } from 'lucide-react'

import { signOutAction } from '@/app/auth/actions'
import { PortalNavLinks } from '@/components/portal-nav-links'
import { ROLE_LABELS, type Role } from '@/lib/rbac'

/**
 * Small-screen navigation. The desktop sidebar is `hidden lg:flex`, so without
 * this the sidebar items would be unreachable on a phone.
 */
export function MobileNav({
  role,
  fullName,
  email,
  initials: avatarInitials,
}: {
  role: Role
  fullName: string
  email: string
  initials: string
}) {
  const [open, setOpen] = useState(false)

  // Close on route change, and keep the page behind the drawer from scrolling.
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        className="-ml-1 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 lg:hidden"
      >
        <Menu className="size-5" aria-hidden />
        <span className="sr-only">Open navigation menu</span>
      </button>

      {open && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-gray-900/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl"
          >
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden
                  className="bg-brand-gradient grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold text-white shadow-md shadow-brand-600/25"
                >
                  M
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">Teacher Mariam</p>
                  <p className="truncate text-xs text-gray-500">{ROLE_LABELS[role]}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <X className="size-5" aria-hidden />
                <span className="sr-only">Close navigation menu</span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
              <PortalNavLinks role={role} variant="drawer" onNavigate={() => setOpen(false)} />
            </nav>

            <div className="shrink-0 border-t border-gray-200 p-3">
              <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
                <span
                  aria-hidden
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700"
                >
                  {avatarInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{fullName}</p>
                  <p className="truncate text-xs text-gray-500">{email}</p>
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
          </div>
        </div>
      )}
    </>
  )
}
