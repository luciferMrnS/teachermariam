import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Safety reports' }

export default function Page() {
  return (
    <ModulePlaceholder
      role="admin"
      module="Safety reports"
      description="Anonymous reports, triage and investigation outcomes."
    />
  )
}