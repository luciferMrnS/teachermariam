import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Announcements' }

export default function Page() {
  return (
    <ModulePlaceholder
      role="admin"
      module="Announcements"
      description="School-wide and audience-targeted notices, with scheduling."
    />
  )
}