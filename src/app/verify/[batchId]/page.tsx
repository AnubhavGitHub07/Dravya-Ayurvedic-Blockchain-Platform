import { use } from 'react'

export default function VerifyBatchPage({ params }: { params: Promise<{ batchId: string }> }) {
  const resolvedParams = use(params)
  return (
    <div className="p-8">
      <h1>Verify Batch: {resolvedParams.batchId}</h1>
    </div>
  )
}
