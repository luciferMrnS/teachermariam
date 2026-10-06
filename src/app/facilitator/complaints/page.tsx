import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Complaints' }

export default function FacilitatorComplaintsPage() {
  return (
    <ModulePlaceholder
      role="facilitator"
      module="Complaints"
      description="Assigned complaints, with a full internal-update trail."
    />
  )
}
