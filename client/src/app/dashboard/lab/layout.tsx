import { LabSidebar } from '@/components/layouts/LabSidebar'
import { TopNavbar } from '@/components/layouts/TopNavbar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { LabDataProvider } from '@/features/lab/store/LabDataContext'

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <LabDataProvider>
      <SidebarProvider>
        <LabSidebar />
        <SidebarInset>
          <TopNavbar />
          <main className="p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </LabDataProvider>
  )
}