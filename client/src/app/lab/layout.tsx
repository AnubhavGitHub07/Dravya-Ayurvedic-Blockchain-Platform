import { LabSidebar } from './_components/LabSidebar'
import { TopNavbar } from '@/components/layouts/TopNavbar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import './lab-theme.css'

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lab-theme">
      <SidebarProvider>
        <LabSidebar />
        <SidebarInset>
          <TopNavbar />
          <main className="p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}