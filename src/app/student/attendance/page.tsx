import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'My attendance' }

export default function StudentAttendancePage() {
  return (
    <ModulePlaceholder
      role="student"
      module="My attendance"
      description="Your daily register record and term attendance rate."
    />
  )
}
