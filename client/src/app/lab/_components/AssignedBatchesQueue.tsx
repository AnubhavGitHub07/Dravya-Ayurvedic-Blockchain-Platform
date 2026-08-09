import { mockAssignedBatches } from '../_data/assignedBatches'
import { AssignedBatchCard } from './AssignedBatchCard'

export function AssignedBatchesQueue() {
  return (
    <div className="space-y-3">
      {mockAssignedBatches.map((batch) => (
        <AssignedBatchCard key={batch.id} batch={batch} />
      ))}
    </div>
  )
}