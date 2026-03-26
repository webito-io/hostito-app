"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { ordersService } from "@/lib/api/orders";
import { Order } from "@/types/orders";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const columns: Column<Order>[] = [
  { key: "id", label: "#", skeletonWidth: "w-8", render: (o) => <span className="font-mono text-xs text-muted-foreground">#{o.id}</span> },
  { key: "total", label: "Total", skeletonWidth: "w-20", render: (o) => <span className="font-semibold">${o.total}</span> },
  { key: "subtotal", label: "Subtotal", skeletonWidth: "w-20", render: (o) => <span className="text-sm text-muted-foreground">${o.subtotal}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-20", render: (o) => <StatusBadge status={o.status} /> },
  { key: "createdAt", label: "Date", skeletonWidth: "w-28", render: (o) => <span className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</span> },
];

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    ordersService.findAll()
      .then((res) => setData(Array.isArray(res) ? res : (res as any).data || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <DashboardPageHeader title="My Orders" description="View all your orders and their status." />
      <DataTable columns={columns} data={data} loading={loading} keyExtractor={(o) => o.id} onView={(o) => router.push(`/dashboard/orders/${o.id}`)} emptyMessage="No orders found" />
    </div>
  );
}
