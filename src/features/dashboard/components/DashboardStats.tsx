import { StatCard } from '@/components/shared/StatCard'
import { Package, Users, Truck, CheckCircle } from 'lucide-react'

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Batches"
        value="1,245"
        description="+20.1% from last month"
        icon={Package}
      />
      <StatCard title="Active Farmers" value="850" description="+180 new this week" icon={Users} />
      <StatCard
        title="Pending Verification"
        value="32"
        description="12 urgent requests"
        icon={CheckCircle}
      />
      <StatCard title="Shipments" value="124" description="+19% from last month" icon={Truck} />
    </div>
  )
}
