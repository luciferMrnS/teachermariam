/**
 * Seeds one auto-confirmed test user per role in the linked Supabase project.
 *
 * Localhost testing convenience ONLY. Every user gets a known password so you
 * can sign in at /auth/sign-in and click through each portal. Requires
 * migrations 0001–0006 applied (the handle_new_user trigger must exist).
 *
 * Usage: npm run db:seed
 * Reads connection values from .env.local. Never commit that file.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const env = {}
for (const line of readFileSync(resolve('.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.+?)\s*$/)
  if (m && !line.trim().startsWith('#')) env[m[1]] = m[2]
}

const url = env.NEXT_PUBLIC_SUPABASE_URL
const secret = env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !secret) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
if (!url.includes('localhost') && !url.includes('127.0.0.1')) {
  console.warn(`Targeting remote project: ${url}`)
}

const { createClient } = await import('@supabase/supabase-js')
const supabase = createClient(url, secret, { auth: { persistSession: false } })

const USERS = [
  { role: 'admin', first: 'Test', last: 'Admin', email: 'admin@mariam.test' },
  { role: 'facilitator', first: 'Test', last: 'Facilitator', email: 'facilitator@mariam.test' },
  { role: 'parent', first: 'Test', last: 'Parent', email: 'parent@mariam.test' },
  { role: 'student', first: 'Test', last: 'Student', email: 'student@mariam.test' },
  { role: 'applicant', first: 'Test', last: 'Applicant', email: 'applicant@mariam.test' },
]
const PASSWORD = 'mariam-test-1234'

for (const u of USERS) {
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { first_name: u.first, last_name: u.last },
  })
  if (error && !error.message.toLowerCase().includes('already')) {
    console.error(`${u.role}: create failed — ${error.message}`)
    continue
  }
  const id =
    data?.user?.id ??
    (await supabase.auth.admin.listUsers()).data.users.find((x) => x.email === u.email)?.id
  if (!id) {
    console.error(`${u.role}: could not resolve user id`)
    continue
  }
  if (u.role !== 'applicant') {
    const { error: roleError } = await supabase
      .from('profiles')
      .update({ role: u.role, is_active: true })
      .eq('id', id)
    if (roleError) {
      console.error(`${u.role}: role update failed — ${roleError.message}`)
      continue
    }
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', id)
    .maybeSingle()
  if (!profile) {
    console.error(`${u.role}: NO profiles row — the handle_new_user trigger (migration 0001) is missing. Apply migrations first.`)
    continue
  }
  console.log(`${u.role.padEnd(12)} ${u.email} / ${PASSWORD} (profile role: ${profile.role})`)
}
console.log('\nSign in at /auth/sign-in. Test data only — never use these in production.')
