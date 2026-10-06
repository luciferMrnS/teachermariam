import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Announcements' }

export default function ApplicantAnnouncementsPage() {
  return (
    <ModulePlaceholder
      role="applicant"
      module="Announcements"
      description="Public notices for applicants, such as deadlines and interview dates."
    />
  )
}
