import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Learning resources' }

export default function StudentResourcesPage() {
  return (
    <ModulePlaceholder
      role="student"
      module="Learning resources"
      description="Materials your teachers have shared with your class."
    />
  )
}
