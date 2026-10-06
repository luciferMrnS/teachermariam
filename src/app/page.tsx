import Link from 'next/link'
import {
  BookOpen,
  CreditCard,
  GraduationCap,
  MessageSquare,
  Scale,
  ShieldCheck,
} from 'lucide-react'

import { getContext } from '@/lib/dal/auth'
import { ROLE_HOME, ROLE_LABELS, type Role } from '@/lib/rbac'

const MODULES = [
  {
    icon: BookOpen,
    title: 'Academics',
    body: 'Classes, subjects, enrolment, attendance and gradebooks in one place.',
  },
  {
    icon: CreditCard,
    title: 'Fees & payments',
    body: 'Fee structures, invoices, receipts and arrears tracking per student.',
  },
  {
    icon: MessageSquare,
    title: 'Communication',
    body: 'Announcements, targeted messages and a paper trail for every channel.',
  },
  {
    icon: GraduationCap,
    title: 'Registration',
    body: 'Online applications with review queues and admission decisions.',
  },
  {
    icon: Scale,
    title: 'Complaints & discipline',
    body: 'Ticketing for complaints, and a documented discipline workflow.',
  },
  {
    icon: ShieldCheck,
    title: 'Anonymous reporting',
    body: 'A protected channel so students can report safety concerns safely.',
  },
]

const PORTALS: Role[] = ['admin', 'facilitator', 'parent', 'student', 'applicant']

export default async function LandingPage() {
  const context = await getContext()

  return (
    <div className="min-h-dvh bg-white">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden
              className="bg-brand-gradient grid size-8 place-items-center rounded-lg text-sm font-bold text-white shadow-md shadow-brand-600/30"
            >
              M
            </span>
            <span className="font-semibold tracking-tight">Teacher Mariam</span>
          </div>
          <Link
            href={context ? ROLE_HOME[context.profile.role] : '/auth/sign-in'}
            className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            {context ? 'Open dashboard' : 'Sign in'}
          </Link>
        </div>
      </header>

      <main>
        <section className="bg-mesh text-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-accent-300 ring-1 ring-inset ring-white/15">
            Comprehensive School Management
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            One platform for the{' '}
            <span className="bg-gradient-to-r from-accent-300 to-accent-500 bg-clip-text text-transparent">
              whole school community.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-100/85">
            Administrators, facilitators, parents, students and applicants each get
            their own portal — sharing one source of truth for records, academics,
            fees and communication.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {context ? (
              <Link
                href={ROLE_HOME[context.profile.role]}
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-900 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-brand-50"
              >
                Go to your {ROLE_LABELS[context.profile.role].toLowerCase()} portal
              </Link>
            ) : (
              <Link
                href="/auth/sign-in"
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-brand-900 shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-brand-50"
              >
                Sign in
              </Link>
            )}
            <Link
              href="/auth/apply"
              className="rounded-lg border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Apply to the school
            </Link>
          </div>
          </div>
        </section>

        <section className="border-t border-gray-200 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              What the platform covers
            </h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map(({ icon: Icon, title, body }) => (
                <li key={title} className="card card-hover p-5">
                  <span
                    aria-hidden
                    className="bg-brand-gradient grid size-9 place-items-center rounded-lg text-white shadow-md shadow-brand-600/25"
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-3.5 font-semibold text-gray-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-gray-200">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Five portals, one system
            </h2>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {PORTALS.map((role) => (
                <li
                  key={role}
                  className="rounded-full border border-brand-200 bg-white px-3.5 py-1.5 text-sm font-medium text-brand-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
                >
                  {ROLE_LABELS[role]}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500 sm:px-6">
          Teacher Mariam — Comprehensive School Management Platform.
        </div>
      </footer>
    </div>
  )
}
