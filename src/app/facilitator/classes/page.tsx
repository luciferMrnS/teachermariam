import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'My classes' }

export default function FacilitatorClassesPage() {
  return (
    <ModulePlaceholder
      role="facilitator"
      module="My classes"
      description="The classes and subjects assigned to you this session, with enrolment counts."
    />
  )
}
