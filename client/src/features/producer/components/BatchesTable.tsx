import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { mockBatches, type BatchStatus } from '../data/batches'

const statusStyles: Record<BatchStatus, string> = {
  verified: 'bg-green-100 text-green-800 hover:bg-green-100',
  pending: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  rejected: 'bg-red-100 text-red-800 hover:bg-red-100',
}

const statusLabels: Record<BatchStatus, string> = {
  verified: 'Verified',
  pending: 'Pending',
  rejected: 'Rejected',
}

export function BatchesTable() {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Herb</TableHead>
            <TableHead>Batch ID</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Harvest Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockBatches.map((batch) => (
            <TableRow key={batch.id}>
              <TableCell className="font-medium">{batch.herbName}</TableCell>
              <TableCell>{batch.id}</TableCell>
              <TableCell>{batch.quantityKg} kg</TableCell>
              <TableCell>{batch.harvestDate}</TableCell>
              <TableCell>
                <Badge className={statusStyles[batch.status]} variant="secondary">
                  {statusLabels[batch.status]}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}