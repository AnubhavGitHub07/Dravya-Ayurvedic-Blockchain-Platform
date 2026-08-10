'use client'

import { Button } from '@/components/ui/button'
import { useShipmentData, type Shipment } from '../_store/ShipmentDataContext'

const steps: Shipment['status'][] = ['created', 'dispatched', 'delivered']
const stepLabels: Record<Shipment['status'], string> = {
  created: 'Created',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
}

export function ShipmentCard({ shipment }: { shipment: Shipment }) {
  const { updateShipmentStatus } = useShipmentData()
  const currentIndex = steps.indexOf(shipment.status)

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div>
        <p className="font-medium">
          {shipment.id} · {shipment.batchId} {shipment.herbName}
        </p>
        <p className="text-sm text-muted-foreground">
          {shipment.route} · {shipment.quantityKg} kg
        </p>
      </div>
      <div className="flex items-start">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`h-5 w-5 rounded-full border-2 ${
                  i <= currentIndex ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                }`}
              />
              <p className={`text-xs mt-1.5 ${i === currentIndex ? 'font-medium' : 'text-muted-foreground'}`}>
                {stepLabels[step]}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px flex-1 -mt-4 ${i < currentIndex ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={shipment.status !== 'created'}
          onClick={() => updateShipmentStatus(shipment.id, 'dispatched')}
        >
          Record dispatch
        </Button>
        <Button
          disabled={shipment.status !== 'dispatched'}
          onClick={() => updateShipmentStatus(shipment.id, 'delivered')}
        >
          Record delivery
        </Button>
      </div>
    </div>
  )
}