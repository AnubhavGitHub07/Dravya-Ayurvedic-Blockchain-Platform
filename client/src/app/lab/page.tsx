import { LabStats } from './_components/LabStats'
import { AssignedBatchesQueue } from './_components/AssignedBatchesQueue'

export default function LabDashboardPage() {
  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Laboratory Dashboard</h2>
        <p className="text-muted-foreground">Testing activity overview</p>
      </div>
      <LabStats />
      <div>
        <h3 className="text-lg font-semibold mb-3">Awaiting Review</h3>
        <AssignedBatchesQueue />
      </div>
    </div>
  )
}