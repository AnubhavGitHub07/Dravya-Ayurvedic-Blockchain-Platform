import { BatchesTable } from '@/features/producer/components/BatchesTable'

export default function MyBatchesPage() {
  return (
    <div className="flex-1 space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Batches</h2>
        <p className="text-muted-foreground">All herb batches you've registered</p>
      </div>
      <BatchesTable />
    </div>
  )
}