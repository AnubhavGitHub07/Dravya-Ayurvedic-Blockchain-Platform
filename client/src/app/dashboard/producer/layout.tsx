import { ProducerSidebar } from '@/components/layouts/ProducerSidebar'
import { TopNavbar } from '@/components/layouts/TopNavbar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function ProducerLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ProducerSidebar />
      <SidebarInset>
        <TopNavbar />
        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}