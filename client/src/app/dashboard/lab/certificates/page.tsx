'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { useLabData } from '@/features/lab/store/LabDataContext'

export default function CertificatesPage() {
  const { batches } = useLabData()
  const issued = batches.filter((b) => b.status === 'approved')

  function downloadFile(file: File) {
    const url = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Certificates</h2>
        <p className="text-muted-foreground">Quality certificates issued by your lab</p>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Herb</TableHead>
              <TableHead>Batch ID</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Issued</TableHead>
              <TableHead className="text-right">Certificate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issued.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">No certificates issued yet</TableCell>
              </TableRow>
            ) : (
              issued.map((batch) => (
                <TableRow key={batch.id}>
                  <TableCell className="font-medium">{batch.herbName}</TableCell>
                  <TableCell>{batch.id}</TableCell>
                  <TableCell>{batch.quantityKg} kg</TableCell>
                  <TableCell>{batch.submittedDate}</TableCell>
                  <TableCell className="text-right">
                    {batch.certFile ? (
                      <Button variant="ghost" size="sm" onClick={() => downloadFile(batch.certFile as File)}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">No file</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}