import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Complaints' }

export default function ParentComplaintsPage() {
  return (
    <ModulePlaceholder
      role="parent"
      module="Complaints"
      description="Raise a concern confidentially and follow the school's response."
    />
  )
}
