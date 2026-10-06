import { ModulePlaceholder } from '@/components/module-placeholder'

export const metadata = { title: 'Fees' }

export default function ParentFeesPage() {
  return (
    <ModulePlaceholder
      role="parent"
      module="Fees"
      description="Invoices, payment history and receipts for each child."
    />
  )
}
