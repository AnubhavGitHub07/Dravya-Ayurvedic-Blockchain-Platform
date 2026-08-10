import { ProducerStats } from '@/features/producer/components/ProducerStats'
import { BatchesTable } from '@/features/producer/components/BatchesTable'

export default function ProducerDashboardPage() {
  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Producer Dashboard</h2>
        <p className="text-muted-foreground">Overview of your registered herb batches</p>
      </div>
      <ProducerStats />
      <div>
        <h3 className="text-lg font-semibold mb-3">My Batches</h3>
        <BatchesTable />
      </div>
    </div>
  )
}