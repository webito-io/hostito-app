"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { DataTable, Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { invoicesService } from "@/lib/api/invoices";
import { servicesService } from "@/lib/api/services";
import { Invoice } from "@/types/invoices";
import { Service } from "@/types/services";
import { PackageIcon, FileTextIcon, CreditCardIcon, GlobeIcon } from "lucide-react";
import { useEffect, useState } from "react";

const invoiceColumns: Column<Invoice>[] = [
  { key: "id", label: "#", skeletonWidth: "w-8", render: (i) => <span className="font-mono text-xs text-muted-foreground">#{i.id}</span> },
  { key: "total", label: "Amount", skeletonWidth: "w-20", render: (i) => <span className="font-semibold">${i.total}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-20", render: (i) => <StatusBadge status={i.status} /> },
  { key: "dueDate", label: "Due", skeletonWidth: "w-28", render: (i) => <span className="text-xs text-muted-foreground">{i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "—"}</span> },
];

const serviceColumns: Column<Service>[] = [
  { key: "id", label: "#", skeletonWidth: "w-8", render: (s) => <span className="font-mono text-xs text-muted-foreground">#{s.id}</span> },
  { key: "productId", label: "Product", skeletonWidth: "w-24", render: (s) => <span className="text-sm">Product #{s.productId}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-20", render: (s) => <StatusBadge status={s.status} /> },
  { key: "nextDueDate", label: "Next Due", skeletonWidth: "w-28", render: (s) => <span className="text-xs text-muted-foreground">{s.nextDueDate ? new Date(s.nextDueDate).toLocaleDateString() : "—"}</span> },
];

export default function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      invoicesService.findAll(1, 5),
      servicesService.findAll(),
    ]).then(([inv, svc]) => {
      setInvoices(Array.isArray(inv) ? inv : inv.data || []);
      setServices(Array.isArray(svc) ? svc : (svc as any).data || []);
    }).finally(() => setLoading(false));
  }, []);

  const pendingInvoices = invoices.filter((i) => i.status === "PENDING");
  const activeServices = services.filter((s) => s.status === "ACTIVE");

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back. Here's your account overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Services" value={loading ? "—" : activeServices.length} icon={<PackageIcon className="h-4 w-4" />} loading={loading} />
        <StatCard title="Pending Invoices" value={loading ? "—" : pendingInvoices.length} icon={<FileTextIcon className="h-4 w-4" />} loading={loading} />
        <StatCard title="Total Invoices" value={loading ? "—" : invoices.length} icon={<CreditCardIcon className="h-4 w-4" />} loading={loading} />
        <StatCard title="Total Services" value={loading ? "—" : services.length} icon={<GlobeIcon className="h-4 w-4" />} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">Recent Invoices</h2>
          <DataTable columns={invoiceColumns} data={invoices.slice(0, 5)} loading={loading} keyExtractor={(i) => i.id} emptyMessage="No invoices yet" />
        </div>
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase text-muted-foreground tracking-wider">My Services</h2>
          <DataTable columns={serviceColumns} data={services.slice(0, 5)} loading={loading} keyExtractor={(s) => s.id} emptyMessage="No services yet" />
        </div>
      </div>
    </div>
  );
}
