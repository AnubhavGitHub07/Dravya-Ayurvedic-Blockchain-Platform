'use client'

import { useVerificationData } from '@/features/verification-authority/store/VerificationDataContext'
import { ProducerVerificationCard } from '@/features/verification-authority/components/ProducerVerificationCard'

export default function VerificationRequestsPage() {
  const { producers } = useVerificationData()
  const pending = producers.filter((p) => p.status === 'in_review')

  return (
    <div className="flex-1 space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Verification Requests</h2>
        <p className="text-muted-foreground">Pending identity and farm verifications</p>
      </div>
      {pending.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending requests right now.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((producer) => (
            <ProducerVerificationCard key={producer.id} producer={producer} />
          ))}
        </div>
      )}
    </div>
  )
}