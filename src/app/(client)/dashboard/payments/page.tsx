"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { paymentsService } from "@/lib/api/payments";
import { Payment } from "@/types/payments";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const columns: Column<Payment>[] = [
  { key: "id", label: "#", skeletonWidth: "w-8", render: (p) => <span className="font-mono text-xs text-muted-foreground">#{p.id}</span> },
  { key: "amount", label: "Amount", skeletonWidth: "w-20", render: (p) => <span className="font-semibold">${p.amount}</span> },
  { key: "gateway", label: "Gateway", skeletonWidth: "w-24", render: (p) => <span className="text-sm capitalize">{typeof p.gateway === "object" ? (p.gateway as any)?.name : p.gateway || "—"}</span> },
  { key: "transactionId", label: "Transaction ID", skeletonWidth: "w-40", render: (p) => <span className="font-mono text-xs text-muted-foreground">{p.transactionId || "—"}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-20", render: (p) => <StatusBadge status={p.status} /> },
  { key: "createdAt", label: "Date", skeletonWidth: "w-28", render: (p) => <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</span> },
];

export default function PaymentsPage() {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsService.findAll()
      .then((res) => setData(Array.isArray(res) ? res : (res as any).data || []))
      .catch(() => toast.error("Failed to load payments"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <DashboardPageHeader title="My Payments" description="History of all your transactions." />
      <DataTable columns={columns} data={data} loading={loading} keyExtractor={(p) => p.id} emptyMessage="No payments found" />
    </div>
  );
}
