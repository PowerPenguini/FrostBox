"use client"

import {
  IconDashboard,
  IconHelp,
  IconReceiptDollar,
  IconSettings,
  IconTruck,
  IconSteeringWheel,
  IconBasketDollar
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/manager/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Koszty",
      url: "/manager/costs",
      icon: IconBasketDollar,
    },
    {
      title: "Pojazdy",
      url: "/manager/vehicles",
      icon: IconTruck,
    },
    {
      title: "Kierowcy",
      url: "#",
      icon: IconSteeringWheel,
    },
  ],
  navSecondary: [
    {
      title: "Ustawienia",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Pomoc",
      url: "#",
      icon: IconHelp,
    },
  ],
  documents: [
    {
      name: "Dokumenty kosztowe",
      url: "/manager/documents/costs",
      icon: IconReceiptDollar,
    },
    // {
    //   name: "Faktury przychodowe",
    //   url: "#",
    //   icon: IconReceiptDollar,
    // },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    (<Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="#">
                <span className="text-base font-semibold">FrostBox</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>)
  );
}
