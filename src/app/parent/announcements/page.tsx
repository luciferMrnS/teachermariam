import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Announcements' }

export default function ParentAnnouncementsPage() {
  return (
    <ModulePlaceholder
      role="parent"
      module="Announcements"
      description="School notices addressed to parents, including class-specific messages."
    />
  )
}
