import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Attendance' }

export default function FacilitatorAttendancePage() {
  return (
    <ModulePlaceholder
      role="facilitator"
      module="Attendance"
      description="Take daily register for your classes and correct earlier entries."
    />
  )
}
