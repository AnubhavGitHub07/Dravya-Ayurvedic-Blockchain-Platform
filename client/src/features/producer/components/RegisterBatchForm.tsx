'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function RegisterBatchForm() {
  const [submitted, setSubmitted] = useState(false)
  const [cultivationFile, setCultivationFile] = useState<File | null>(null)
  const [harvestFiles, setHarvestFiles] = useState<File[]>([])
  const [form, setForm] = useState({
    herbName: '',
    botanicalName: '',
    harvestDate: '',
    farmLocation: '',
    description: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: replace with real API call once the batch + file upload endpoints exist on the server
    console.log('Submitting batch:', form, { cultivationFile, harvestFiles })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="font-medium">Batch submitted for verification</p>
        <p className="text-sm text-muted-foreground mt-1">
          You&apos;ll see it under My Batches once processing begins.
        </p>
        <Button className="mt-4" variant="outline" onClick={() => setSubmitted(false)}>
          Register another batch
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="herbName">Herb name</Label>
          <Input id="herbName" name="herbName" placeholder="Ashwagandha" value={form.herbName} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="botanicalName">Botanical name</Label>
          <Input id="botanicalName" name="botanicalName" placeholder="Withania somnifera" value={form.botanicalName} onChange={handleChange} required />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="harvestDate">Harvest date</Label>
          <Input id="harvestDate" name="harvestDate" type="date" value={form.harvestDate} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="farmLocation">Farm location</Label>
          <Input id="farmLocation" name="farmLocation" placeholder="Sehore, Madhya Pradesh" value={form.farmLocation} onChange={handleChange} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" placeholder="Any additional notes" value={form.description} onChange={handleChange} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cultivationFile">Cultivation details</Label>
          <label
            htmlFor="cultivationFile"
            className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground hover:bg-muted/50"
          >
            {cultivationFile ? cultivationFile.name : 'Click to upload or drag and drop'}
          </label>
          <input
            id="cultivationFile"
            type="file"
            accept=".pdf,.doc,.docx,image/*"
            className="hidden"
            onChange={(e) => setCultivationFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="harvestFiles">Harvest images</Label>
          <label
            htmlFor="harvestFiles"
            className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground hover:bg-muted/50"
          >
            {harvestFiles.length > 0 ? `${harvestFiles.length} file(s) selected` : 'Click to upload or drag and drop'}
          </label>
          <input
            id="harvestFiles"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => setHarvestFiles(e.target.files ? Array.from(e.target.files) : [])}
          />
        </div>
      </div>
      <Button type="submit">Submit batch</Button>
    </form>
  )
}