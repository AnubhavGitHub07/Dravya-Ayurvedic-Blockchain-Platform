import { DistributorStats } from '@/features/distributor/components/DistributorStats'

export default function DistributorDashboardPage() {
  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Distributor Dashboard</h2>
        <p className="text-muted-foreground">Shipment activity overview</p>
      </div>
      <DistributorStats />
    </div>
  )
}