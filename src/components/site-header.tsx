"use client"

import { usePathname } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const PAGE_TITLES: { pathPrefix: string; title: string }[] = [
  { pathPrefix: "/dashboard/quotes", title: "Quotes" },
  { pathPrefix: "/dashboard", title: "Dashboard" },
]

function titleForPath(pathname: string): string {
  return PAGE_TITLES.find((page) => pathname.startsWith(page.pathPrefix))?.title ?? "Dashboard"
}

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{titleForPath(pathname)}</h1>
      </div>
    </header>
  )
}
