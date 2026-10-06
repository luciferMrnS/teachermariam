import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Discipline' }

export default function FacilitatorDisciplinePage() {
  return (
    <ModulePlaceholder
      role="facilitator"
      module="Discipline"
      description="Record incidents for students in your classes and track actions taken."
    />
  )
}
