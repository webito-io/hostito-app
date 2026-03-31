"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  Settings2Icon,
  LayoutDashboardIcon,
  ShoppingCartIcon,
  PackageIcon,
  UsersIcon,
  ShieldCheckIcon,
  BellIcon,
  PlusCircleIcon,
  GlobeIcon
} from "lucide-react"
import { LogoTypo } from "../logo/typo"

// This is sample data.
const data = {
  teams: [
    {
      name: "Hostito",
      logo: (
        <GalleryVerticalEndIcon
        />
      ),
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: (
        <AudioLinesIcon
        />
      ),
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: (
        <TerminalIcon
        />
      ),
      plan: "Free",
    },
  ],
  navMain: {
    admin: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: (
          <LayoutDashboardIcon />
        ),
        isActive: true,
      },
      {
        title: "Sales",
        url: "#",
        icon: (
          <ShoppingCartIcon />
        ),
        items: [
          {
            title: "Orders",
            url: "/admin/orders",
          },
          {
            title: "Invoices",
            url: "/admin/invoices",
          },
          {
            title: "Payments",
            url: "/admin/payments",
          },
          {
            title: "Coupons",
            url: "/admin/coupons",
          },
        ],
      },
      {
        title: "Inventory",
        url: "#",
        icon: (
          <PackageIcon />
        ),
        items: [
          {
            title: "Products",
            url: "/admin/products",
          },
          {
            title: "Categories",
            url: "/admin/products-categories",
          },
          {
            title: "Services",
            url: "/admin/services",
          },
          {
            title: "Servers",
            url: "/admin/servers",
          },
          {
            title: "Domains",
            url: "/admin/domains",
          },
          {
            title: "Registrars",
            url: "/admin/registrars",
          },
          {
            title: "Provisioners",
            url: "/admin/provisioners",
          },
        ],
      },
      {
        title: "Management",
        url: "#",
        icon: (
          <UsersIcon />
        ),
        items: [
          {
            title: "Users",
            url: "/admin/users",
          },
          {
            title: "Roles",
            url: "/admin/roles",
          },
          {
            title: "Organizations",
            url: "/admin/organizations",
          },
        ],
      },
      {
        title: "Configuration",
        url: "#",
        icon: (
          <Settings2Icon />
        ),
        items: [
          {
            title: "Settings",
            url: "/admin/settings",
          },
          {
            title: "Currencies",
            url: "/admin/currencies",
          },
          {
            title: "Taxes",
            url: "/admin/taxes",
          },
          {
            title: "Payment Gateways",
            url: "/admin/payment-gateways",
          },
          {
            title: "Notification Templates",
            url: "/admin/notification-templates",
          },
          {
            title: "Notification Providers",
            url: "/admin/notification-providers",
          },
        ],
      },
      {
        title: "System",
        url: "#",
        icon: (
          <BellIcon />
        ),
        items: [
          {
            title: "Notification Logs",
            url: "/admin/notifications",
          },
          {
            title: "Announcements",
            url: "/admin/announcements",
          },
          {
            title: "Audit Logs",
            url: "/admin/audit-logs",
          },
        ],
      },
    ],
    client: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: (
          <LayoutDashboardIcon />
        ),
        isActive: true,
      },
      {
        title: "Order",
        url: "/dashboard/order-service",
        icon: (
          <PlusCircleIcon />
        ),
      },
      {
        title: "Cart",
        url: "/dashboard/cart",
        icon: (
          <ShoppingCartIcon />
        ),
      },
      {
        title: "Register Domain",
        url: "/dashboard/register-domain",
        icon: (
          <GlobeIcon />
        ),
      },
      {
        title: "My Services",
        url: "/dashboard/services",
        icon: (
          <PackageIcon />
        ),
      },
      {
        title: "Billing",
        url: "#",
        icon: (
          <ShoppingCartIcon />
        ),
        items: [
          {
            title: "My Orders",
            url: "/dashboard/orders",
          },
          {
            title: "Invoices",
            url: "/dashboard/invoices",
          },
          {
            title: "Wallet",
            url: "/dashboard/wallet",
          },
        ],
      },
      {
        title: "My Domains",
        url: "/dashboard/domains",
        icon: (
          <ShieldCheckIcon />
        ),
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: (
          <Settings2Icon />
        ),
      },
    ]
  },
}

export function AppSidebar({ admin, ...props }: React.ComponentProps<typeof Sidebar> & { admin?: boolean }) {
  const navItems = admin ? data.navMain.admin : data.navMain.client

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
