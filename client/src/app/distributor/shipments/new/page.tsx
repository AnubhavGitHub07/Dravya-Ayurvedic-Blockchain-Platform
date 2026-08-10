'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useShipmentData } from '../../_store/ShipmentDataContext'

export default function CreateShipmentPage() {
  const router = useRouter()
  const { addShipment } = useShipmentData()
  const [form, setForm] = useState({
    id: '',
    batchId: '',
    herbName: '',
    quantityKg: '',
    origin: '',
    destination: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    addShipment({
      id: form.id,
      batchId: form.batchId,
      herbName: form.herbName,
      quantityKg: Number(form.quantityKg),
      route: `${form.origin} → ${form.destination}`,
    })
    router.push('/distributor/shipments')
  }

  return (
    <div className="flex-1 space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Shipment</h2>
        <p className="text-muted-foreground">Register a new shipment for a verified batch</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-6 max-w-2xl">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="id">Shipment ID</Label>
            <Input id="id" name="id" placeholder="SH-104" value={form.id} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="batchId">Batch ID</Label>
            <Input id="batchId" name="batchId" placeholder="HB-004" value={form.batchId} onChange={handleChange} required />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="herbName">Herb name</Label>
            <Input id="herbName" name="herbName" placeholder="Amla" value={form.herbName} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantityKg">Quantity (kg)</Label>
            <Input id="quantityKg" name="quantityKg" type="number" placeholder="200" value={form.quantityKg} onChange={handleChange} required />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="origin">Origin</Label>
            <Input id="origin" name="origin" placeholder="Sehore, MP" value={form.origin} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input id="destination" name="destination" placeholder="Bhopal, MP" value={form.destination} onChange={handleChange} required />
          </div>
        </div>
        <Button type="submit">Create shipment</Button>
      </form>
    </div>
  )
}