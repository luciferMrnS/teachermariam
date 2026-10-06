import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Results' }

export default function ParentGradesPage() {
  return (
    <ModulePlaceholder
      role="parent"
      module="Results"
      description="Assessment scores and teacher comments for each child."
    />
  )
}
