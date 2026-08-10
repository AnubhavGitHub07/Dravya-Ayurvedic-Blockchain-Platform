import { DashboardStats } from '@/features/dashboard/components/DashboardStats'
import { DashboardCharts } from '@/features/dashboard/components/DashboardCharts'

export default function DashboardPage() {
  return (
    <div className="flex-1 bg- space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <DashboardStats />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
        <DashboardCharts />
      </div>
    </div>
  )
}
