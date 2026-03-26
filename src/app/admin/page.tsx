"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import {
  Users,
  ShoppingCart,
  Server,
  Globe,
  CreditCard,
  Box,
  LayoutDashboard,
  ShieldAlert,
  Settings
} from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Users", value: "...", icon: Users, color: "bg-blue-500/10 text-blue-500", href: "/admin/users" },
  { label: "Orders", value: "...", icon: ShoppingCart, color: "bg-green-500/10 text-green-500", href: "/admin/orders" },
  { label: "Services", value: "...", icon: Box, color: "bg-purple-500/10 text-purple-500", href: "/admin/services" },
  { label: "Domains", value: "...", icon: Globe, color: "bg-orange-500/10 text-orange-500", href: "/admin/domains" },
  { label: "Servers", value: "...", icon: Server, color: "bg-red-500/10 text-red-500", href: "/admin/servers" },
  { label: "Payments", value: "...", icon: CreditCard, color: "bg-cyan-500/10 text-cyan-500", href: "/admin/payments" },
];

const quickActions = [
  { label: "Add User", href: "/admin/users", icon: Users },
  { label: "View Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Manage Servers", href: "/admin/servers", icon: Server },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert },
  { label: "Settings", href: "/admin/organizations", icon: Settings },
];

export default function AdminDashboard() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Admin Dashboard" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group relative flex flex-col gap-2 rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold">{stat.value}</span>
              <span className="text-xs text-muted-foreground">Manage {stat.label.toLowerCase()} here</span>
            </div>
          </Link>
        ))}
      </div>

    </div>
  );
}