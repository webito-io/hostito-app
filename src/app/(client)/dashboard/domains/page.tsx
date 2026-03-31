"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { domainsService } from "@/lib/api/domains";
import { Domain } from "@/types/domains";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { toast } from "sonner";

const columns: Column<Domain>[] = [
  { key: "name", label: "Domain", skeletonWidth: "w-40", render: (d) => <span className="font-medium font-mono">{d.name}</span> },
  { key: "registrar", label: "Registrar", skeletonWidth: "w-24", render: (d) => <span className="text-sm text-muted-foreground capitalize">{d.registrar || "—"}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-20", render: (d) => <StatusBadge status={d.status} /> },
  { key: "expiryDate", label: "Expires", skeletonWidth: "w-28", render: (d) => <span className="text-xs text-muted-foreground">{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : "—"}</span> },
];

export default function DomainsPage() {
  const [data, setData] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    domainsService.findAll()
      .then((res) => setData(Array.isArray(res) ? res : (res as any).data || []))
      .catch(() => toast.error("Failed to load domains"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <DashboardPageHeader
        title="My Domains"
        description="Manage your registered domains."
        action={{ label: "Register Domain", onClick: () => router.push("/dashboard/register-domain") }}
      />
      <DataTable columns={columns} data={data} loading={loading} keyExtractor={(d) => d.id} onView={(d) => router.push(`/dashboard/domains/${d.id}`)} emptyMessage="No domains found" />
    </div>
  );
}
