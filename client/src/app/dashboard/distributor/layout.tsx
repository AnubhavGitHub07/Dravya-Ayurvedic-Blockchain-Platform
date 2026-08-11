import { DistributorSidebar } from '@/components/layouts/DistributorSidebar'
import { TopNavbar } from '@/components/layouts/TopNavbar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { ShipmentDataProvider } from '@/features/distributor/store/ShipmentDataContext'

export default function DistributorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-theme">
      <ShipmentDataProvider>
        <SidebarProvider>
          <DistributorSidebar />
          <SidebarInset>
            <TopNavbar />
            <main className="p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </ShipmentDataProvider>
    </div>
  )
}