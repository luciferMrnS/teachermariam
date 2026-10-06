import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Attendance' }

export default function ParentAttendancePage() {
  return (
    <ModulePlaceholder
      role="parent"
      module="Attendance"
      description="Daily attendance rate per child, term by term."
    />
  )
}
