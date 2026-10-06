import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Discipline' }

export default function Page() {
  return (
    <ModulePlaceholder
      role="admin"
      module="Discipline"
      description="Discipline cases, actions taken, appeals and parent notification."
    />
  )
}