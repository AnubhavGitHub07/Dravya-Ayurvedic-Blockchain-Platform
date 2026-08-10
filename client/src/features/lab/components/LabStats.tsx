import { StatCard } from '@/components/shared/StatCard'
import { FlaskConical, CheckCircle2, Timer } from 'lucide-react'
import { labStats } from '@/features/lab/data/labStats'

export function LabStats() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Pending Tests"
        value={String(labStats.pendingTests)}
        description="Awaiting quality testing"
        icon={FlaskConical}
      />
      <StatCard
        title="Completed Today"
        value={String(labStats.completedToday)}
        description="Reports submitted today"
        icon={CheckCircle2}
      />
      <StatCard
        title="Avg Turnaround"
        value={`${labStats.avgTurnaroundDays} days`}
        description="From assignment to result"
        icon={Timer}
      />
    </div>
  )
}