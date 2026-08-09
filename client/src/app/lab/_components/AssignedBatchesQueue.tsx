'use client'

import { useLabData } from '../_store/LabDataContext'
import { AssignedBatchCard } from './AssignedBatchCard'

export function AssignedBatchesQueue() {
  const { batches } = useLabData()
  const pending = batches.filter((b) => b.status === 'awaiting_test')

  return (
    <div className="space-y-3">
      {pending.map((batch) => (
        <AssignedBatchCard key={batch.id} batch={batch} />
      ))}
    </div>
  )
}