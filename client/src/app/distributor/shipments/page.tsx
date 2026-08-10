'use client'

import { useShipmentData } from '../_store/ShipmentDataContext'
import { ShipmentCard } from '../_components/ShipmentCard'

export default function AssignedShipmentsPage() {
  const { shipments } = useShipmentData()

  return (
    <div className="flex-1 space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Assigned Shipments</h2>
        <p className="text-muted-foreground">Track and update shipments assigned to you</p>
      </div>
      <div className="space-y-3">
        {shipments.map((shipment) => (
          <ShipmentCard key={shipment.id} shipment={shipment} />
        ))}
      </div>
    </div>
  )
}