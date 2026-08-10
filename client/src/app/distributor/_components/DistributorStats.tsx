import { StatCard } from '@/components/shared/StatCard'
import { Truck, Navigation, PackageCheck, AlertTriangle } from 'lucide-react'
import { shipmentStats } from '../_data/shipmentStats'

export function DistributorStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Active Shipments"
        value={String(shipmentStats.activeShipments)}
        description="Currently in your network"
        icon={Truck}
      />
      <StatCard
        title="In Transit"
        value={String(shipmentStats.inTransit)}
        description="On the way to destination"
        icon={Navigation}
      />
      <StatCard
        title="Delivered"
        value={String(shipmentStats.delivered)}
        description="Completed shipments"
        icon={PackageCheck}
      />
      <StatCard
        title="Delayed"
        value={String(shipmentStats.delayed)}
        description="Needs attention"
        icon={AlertTriangle}
      />
    </div>
  )
}