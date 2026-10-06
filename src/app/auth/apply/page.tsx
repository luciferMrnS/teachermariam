import type { Metadata } from 'next'

import { AuthShell } from '@/components/auth-shell'
import { ApplyForm } from './apply-form'

export const metadata: Metadata = { title: 'Apply to the school' }

export default function ApplyPage() {
  return (
    <AuthShell
      title="Apply to the school"
      subtitle="Applications are reviewed by the admissions team in the order they arrive."
    >
      <ApplyForm />
    </AuthShell>
  )
}
