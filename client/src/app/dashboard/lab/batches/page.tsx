'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useLabData, type LabBatchFullStatus } from '@/features/lab/store/LabDataContext'

const statusStyles: Record<LabBatchFullStatus, string> = {
  approved: 'bg-green-100 text-green-800 hover:bg-green-100',
  awaiting_test: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  rejected: 'bg-red-100 text-red-800 hover:bg-red-100',
}

const statusLabels: Record<LabBatchFullStatus, string> = {
  approved: 'Approved',
  awaiting_test: 'Awaiting test',
  rejected: 'Rejected',
}

export default function LabBatchesPage() {
  const { batches } = useLabData()

  return (
    <div className="flex-1 space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Assigned Batches</h2>
        <p className="text-muted-foreground">All batches assigned to your lab, past and present</p>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Herb</TableHead>
              <TableHead>Batch ID</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell className="font-medium">{batch.herbName}</TableCell>
                <TableCell>{batch.id}</TableCell>
                <TableCell>{batch.quantityKg} kg</TableCell>
                <TableCell>{batch.submittedDate}</TableCell>
                <TableCell>
                  <Badge className={statusStyles[batch.status]} variant="secondary">{statusLabels[batch.status]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}