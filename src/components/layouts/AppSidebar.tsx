'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import {
  Home,
  Package,
  FlaskConical,
  Factory,
  Truck,
  Store,
  LineChart,
  Settings,
} from 'lucide-react'
import Link from 'next/link'

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: Home },
  { title: 'Herb Batches', url: '/dashboard/batches', icon: Package },
  { title: 'Laboratories', url: '/dashboard/laboratories', icon: FlaskConical },
  { title: 'Manufacturers', url: '/dashboard/manufacturers', icon: Factory },
  { title: 'Distributors', url: '/dashboard/distributors', icon: Truck },
  { title: 'Retailers', url: '/dashboard/retailers', icon: Store },
  { title: 'Analytics', url: '/dashboard/analytics', icon: LineChart },
  { title: 'Settings', url: '/dashboard/settings', icon: Settings },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-bold">
            D
          </div>
          <span className="text-lg font-bold">Dravya</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <Link href={item.url}>
                    <SidebarMenuButton>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
