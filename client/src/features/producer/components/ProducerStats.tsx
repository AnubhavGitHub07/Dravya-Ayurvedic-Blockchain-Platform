import { StatCard } from '@/components/shared/StatCard'
import { Package, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { mockBatches } from '../data/batches'

export function ProducerStats() {
  const total = mockBatches.length
  const pending = mockBatches.filter((b) => b.status === 'pending').length
  const verified = mockBatches.filter((b) => b.status === 'verified').length
  const rejected = mockBatches.filter((b) => b.status === 'rejected').length

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Batches" value={String(total)} description="All registered batches" icon={Package} />
      <StatCard title="Pending Review" value={String(pending)} description="Awaiting lab or authority" icon={Clock} />
      <StatCard title="Verified" value={String(verified)} description="Cleared by authority" icon={CheckCircle2} />
      <StatCard title="Rejected" value={String(rejected)} description="Needs resubmission" icon={XCircle} />
    </div>
  )
}