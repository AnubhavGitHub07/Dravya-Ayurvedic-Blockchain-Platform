'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { usePathname } from 'next/navigation'
import { Fragment } from 'react'

export function TopNavbar() {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb className="hidden sm:block">
        <BreadcrumbList>
          {paths.map((path, index) => {
            const isLast = index === paths.length - 1
            const href = `/${paths.slice(0, index + 1).join('/')}`
            const title = path.charAt(0).toUpperCase() + path.slice(1)

            return (
              <Fragment key={path}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={href}>{title}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        <UserAvatar />
      </div>
    </header>
  )
}
