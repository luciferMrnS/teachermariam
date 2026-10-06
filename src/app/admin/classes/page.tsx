import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Classes' }

export default function Page() {
  return (
    <ModulePlaceholder
      role="admin"
      module="Classes"
      description="Every class in the current session, with capacity and enrolment."
    />
  )
}