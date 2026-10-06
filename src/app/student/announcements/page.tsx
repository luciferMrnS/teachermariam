import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Announcements' }

export default function StudentAnnouncementsPage() {
  return (
    <ModulePlaceholder
      role="student"
      module="Announcements"
      description="Notices from staff addressed to students or your class."
    />
  )
}
