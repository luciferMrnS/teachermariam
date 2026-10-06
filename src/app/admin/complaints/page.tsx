import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Complaints' }

export default function Page() {
  return (
    <ModulePlaceholder
      role="admin"
      module="Complaints"
      description="Complaints and feedback, with assignment and resolution."
    />
  )
}