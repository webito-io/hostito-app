"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { servicesService } from "@/lib/api/services";
import { Service } from "@/types/services";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const columns: Column<Service>[] = [
  { key: "id", label: "#", skeletonWidth: "w-8", render: (s) => <span className="font-mono text-xs text-muted-foreground">#{s.id}</span> },
  { key: "productId", label: "Product", skeletonWidth: "w-32", render: (s) => <span className="text-sm font-medium">Product #{s.productId}</span> },
  { key: "username", label: "Username", skeletonWidth: "w-28", render: (s) => <span className="font-mono text-xs">{s.username || "—"}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-20", render: (s) => <StatusBadge status={s.status} /> },
  { key: "nextDueDate", label: "Next Due", skeletonWidth: "w-28", render: (s) => <span className="text-xs text-muted-foreground">{s.nextDueDate ? new Date(s.nextDueDate).toLocaleDateString() : "—"}</span> },
];

export default function ServicesPage() {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    servicesService.findAll()
      .then((res) => setData(Array.isArray(res) ? res : (res as any).data || []))
      .catch(() => toast.error("Failed to load services"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <DashboardPageHeader title="My Services" description="All your active and pending hosting services." />
      <DataTable columns={columns} data={data} loading={loading} keyExtractor={(s) => s.id} onView={(s) => router.push(`/dashboard/services/${s.id}`)} emptyMessage="No services found" />
    </div>
  );
}
