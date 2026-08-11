'use client'

import { useVerificationData } from '@/features/verification-authority/store/VerificationDataContext'
import { ProducerVerificationCard } from '@/features/verification-authority/components/ProducerVerificationCard'

export default function VerificationAuthorityDashboardPage() {
  const { producers } = useVerificationData()
  const inReview = producers.filter((p) => p.status === 'in_review')

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Verification Authority Dashboard</h2>
        <p className="text-muted-foreground">Producer identity and farm verification</p>
      </div>
      <div className="space-y-3">
        {inReview.map((producer) => (
          <ProducerVerificationCard key={producer.id} producer={producer} />
        ))}
      </div>
    </div>
  )
}
