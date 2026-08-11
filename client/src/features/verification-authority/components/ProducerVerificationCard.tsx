'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useVerificationData, type ProducerVerification } from '../store/VerificationDataContext'

export function ProducerVerificationCard({ producer }: { producer: ProducerVerification }) {
  const { updateProducer } = useVerificationData()
  const [remarks, setRemarks] = useState('')
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)

  if (producer.status !== 'in_review') {
    return (
      <div className="rounded-lg border p-4 flex items-center justify-between">
        <div>
          <p className="font-medium">{producer.producerName}</p>
          <p className="text-sm text-muted-foreground">{producer.location}</p>
        </div>
        <span className={producer.status === 'approved' ? 'text-sm font-medium text-green-700' : 'text-sm font-medium text-red-700'}>
          {producer.status === 'approved' ? 'Verification approved' : 'Verification rejected'}
        </span>
      </div>
    )
  }

  function markInspectionDone() {
    updateProducer(producer.id, { inspectionDone: true, evidenceFile: evidenceFile ?? undefined })
  }

  function approve() {
    updateProducer(producer.id, { status: 'approved', remarks })
  }

  function reject() {
    updateProducer(producer.id, { status: 'rejected', remarks })
  }

  const canDecide = producer.identityVerified && producer.farmVerified && producer.inspectionDone

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div>
        <p className="font-medium">{producer.producerName}</p>
        <p className="text-sm text-muted-foreground">{producer.location}</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Identity verified</span>
          <Badge variant="secondary" className={producer.identityVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
            {producer.identityVerified ? 'Confirmed' : 'Pending'}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Farm/location verified</span>
          <Badge variant="secondary" className={producer.farmVerified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
            {producer.farmVerified ? 'Confirmed' : 'Pending'}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">On-ground inspection</span>
          <Badge variant="secondary" className={producer.inspectionDone ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
            {producer.inspectionDone ? 'Done' : 'Pending'}
          </Badge>
        </div>
      </div>

      {!producer.inspectionDone && (
        <div className="space-y-2 border-t pt-3">
          <label
            htmlFor={`evidence-${producer.id}`}
            className="flex h-9 cursor-pointer items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground hover:bg-muted/50"
          >
            {evidenceFile ? evidenceFile.name : 'Upload inspection evidence'}
          </label>
          <input
            id={`evidence-${producer.id}`}
            type="file"
            className="hidden"
            onChange={(e) => setEvidenceFile(e.target.files?.[0] ?? null)}
          />
          <Button variant="outline" size="sm" onClick={markInspectionDone}>
            Mark inspection complete
          </Button>
        </div>
      )}

      <div className="space-y-1 border-t pt-3">
        <label className="text-sm text-muted-foreground">Official remarks</label>
        <Textarea
          placeholder="Notes from verification..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="text-red-700" disabled={!canDecide} onClick={reject}>
          Reject verification
        </Button>
        <Button disabled={!canDecide} onClick={approve}>
          Approve verification
        </Button>
      </div>
    </div>
  )
}