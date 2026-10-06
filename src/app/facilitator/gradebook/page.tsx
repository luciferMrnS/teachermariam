import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Gradebook' }

export default function FacilitatorGradebookPage() {
  return (
    <ModulePlaceholder
      role="facilitator"
      module="Gradebook"
      description="Create assessments, set weightings and record scores. Grade ceilings are enforced in the database."
    />
  )
}
