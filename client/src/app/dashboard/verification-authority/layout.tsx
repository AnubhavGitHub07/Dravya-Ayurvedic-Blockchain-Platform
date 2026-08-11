import { VerificationAuthoritySidebar } from '@/components/layouts/VerificationAuthoritySidebar'
import { TopNavbar } from '@/components/layouts/TopNavbar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { VerificationDataProvider } from '@/features/verification-authority/store/VerificationDataContext'

export default function VerificationAuthorityLayout({ children }: { children: React.ReactNode }) {
  return (
    <VerificationDataProvider>
      <SidebarProvider>
        <VerificationAuthoritySidebar />
        <SidebarInset>
          <TopNavbar />
          <main className="p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </VerificationDataProvider>
  )
}