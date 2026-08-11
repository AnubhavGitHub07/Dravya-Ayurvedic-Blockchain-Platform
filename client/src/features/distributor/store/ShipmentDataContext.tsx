'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type ShipmentStatus = 'created' | 'dispatched' | 'delivered'

export interface Shipment {
  id: string
  batchId: string
  herbName: string
  quantityKg: number
  route: string
  status: ShipmentStatus
}

const initialShipments: Shipment[] = [
  { id: 'SH-101', batchId: 'HB-001', herbName: 'Ashwagandha', quantityKg: 500, route: 'Sehore → Indore', status: 'dispatched' },
  { id: 'SH-102', batchId: 'HB-002', herbName: 'Neem', quantityKg: 300, route: 'Indore → Pune', status: 'created' },
  { id: 'SH-103', batchId: 'HB-003', herbName: 'Tulsi', quantityKg: 250, route: 'Sehore → Bhopal', status: 'delivered' },
]

interface ShipmentDataContextValue {
  shipments: Shipment[]
  updateShipmentStatus: (id: string, status: ShipmentStatus) => void
  addShipment: (shipment: Omit<Shipment, 'status'>) => void
}

const ShipmentDataContext = createContext<ShipmentDataContextValue | null>(null)

export function ShipmentDataProvider({ children }: { children: ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments)

  function updateShipmentStatus(id: string, status: ShipmentStatus) {
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
  }

  function addShipment(shipment: Omit<Shipment, 'status'>) {
    setShipments((prev) => [...prev, { ...shipment, status: 'created' }])
  }

  return (
    <ShipmentDataContext.Provider value={{ shipments, updateShipmentStatus, addShipment }}>
      {children}
    </ShipmentDataContext.Provider>
  )
}

export function useShipmentData() {
  const ctx = useContext(ShipmentDataContext)
  if (!ctx) throw new Error('useShipmentData must be used within ShipmentDataProvider')
  return ctx
}