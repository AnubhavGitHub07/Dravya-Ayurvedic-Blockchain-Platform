'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useVerificationData, type VerificationStatus } from '@/features/verification-authority/store/VerificationDataContext'

const statusStyles: Record<VerificationStatus, string> = {
  approved: 'bg-green-100 text-green-800 hover:bg-green-100',
  in_review: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  rejected: 'bg-red-100 text-red-800 hover:bg-red-100',
}

const statusLabels: Record<VerificationStatus, string> = {
  approved: 'Approved',
  in_review: 'In review',
  rejected: 'Rejected',
}

export default function AssignedProducersPage() {
  const { producers } = useVerificationData()

  return (
    <div className="flex-1 space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Assigned Producers</h2>
        <p className="text-muted-foreground">All producers assigned to you for verification</p>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producer</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {producers.map((producer) => (
              <TableRow key={producer.id}>
                <TableCell className="font-medium">{producer.producerName}</TableCell>
                <TableCell>{producer.location}</TableCell>
                <TableCell>
                  <Badge className={statusStyles[producer.status]} variant="secondary">
                    {statusLabels[producer.status]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}