import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'My results' }

export default function StudentGradesPage() {
  return (
    <ModulePlaceholder
      role="student"
      module="My results"
      description="Scores per assessment with your running subject totals."
    />
  )
}
