"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { paymentsService } from "@/lib/api/payments";
import { Payment } from "@/types/payments";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const columns: Column<Payment>[] = [
  { key: "id", label: "Tx ID", skeletonWidth: "w-16", render: (p) => <span className="font-mono text-xs">#{p.id}</span> },
  { key: "transactionId", label: "Gateway Ref", skeletonWidth: "w-48", render: (p) => <span className="text-muted-foreground">{p.transactionId || "Pending"}</span> },
  { key: "amount", label: "Amount", skeletonWidth: "w-24", render: (p) => <span className="font-bold text-primary">${p.amount.toFixed(2)}</span> },
  { key: "gateway", label: "Gateway", skeletonWidth: "w-32", render: (p) => <span className="text-xs uppercase bg-muted px-1.5 py-0.5 rounded">{p.gateway?.name || "N/A"}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-24", render: (p) => <StatusBadge active={p.status === "COMPLETED"} activeLabel={p.status} inactiveLabel={p.status} /> },
  { key: "createdAt", label: "Date", skeletonWidth: "w-32", render: (p) => <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</span> },
];

export default function PaymentsPage() {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const payments = await paymentsService.findAll();
      setData(payments);
    } catch (error) {
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Transactions & Payments" />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        keyExtractor={(p) => p.id}
        emptyMessage="No payments found"
      />
    </div>
  );
}
