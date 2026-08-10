'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useLabData, type LabBatchRecord } from '@/features/lab/store/LabDataContext'

export function AssignedBatchCard({ batch }: { batch: LabBatchRecord }) {
  const { resolveBatch } = useLabData()
  const [purity, setPurity] = useState('')
  const [reportFile, setReportFile] = useState<File | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)

  function approve() {
    resolveBatch(batch.id, {
      status: 'approved',
      purity,
      reportFile: reportFile ?? undefined,
      certFile: certFile ?? undefined,
    })
  }

  function reject() {
    resolveBatch(batch.id, { status: 'rejected' })
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div>
        <p className="font-medium">{batch.herbName} · {batch.id}</p>
        <p className="text-sm text-muted-foreground">{batch.quantityKg} kg · Submitted {batch.submittedDate}</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor={`purity-${batch.id}`}>Purity (%)</Label>
          <Input id={`purity-${batch.id}`} placeholder="98.2" value={purity} onChange={(e) => setPurity(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`report-${batch.id}`}>Lab report</Label>
          <label htmlFor={`report-${batch.id}`} className="flex h-9 cursor-pointer items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground hover:bg-muted/50">
            {reportFile ? reportFile.name : 'Upload file'}
          </label>
          <input id={`report-${batch.id}`} type="file" className="hidden" onChange={(e) => setReportFile(e.target.files?.[0] ?? null)} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`cert-${batch.id}`}>Certificate</Label>
        <label htmlFor={`cert-${batch.id}`} className="flex h-9 cursor-pointer items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground hover:bg-muted/50">
          {certFile ? certFile.name : 'Upload file'}
        </label>
        <input id={`cert-${batch.id}`} type="file" className="hidden" onChange={(e) => setCertFile(e.target.files?.[0] ?? null)} />
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="outline" className="text-red-700" onClick={reject}>Reject batch</Button>
        <Button onClick={approve}>Approve lab result</Button>
      </div>
    </div>
  )
}