import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Learning resources' }

export default function Page() {
  return (
    <ModulePlaceholder
      role="admin"
      module="Learning resources"
      description="Materials shared with classes, with visibility and access control."
    />
  )
}