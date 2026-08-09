import { LabSidebar } from './_components/LabSidebar'
import { TopNavbar } from '@/components/layouts/TopNavbar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { LabDataProvider } from './_store/LabDataContext'
import './lab-theme.css'

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lab-theme">
      <LabDataProvider>
        <SidebarProvider>
          <LabSidebar />
          <SidebarInset>
            <TopNavbar />
            <main className="p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </LabDataProvider>
    </div>
  )
}