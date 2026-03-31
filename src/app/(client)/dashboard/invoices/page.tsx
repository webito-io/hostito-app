"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { invoicesService } from "@/lib/api/invoices";
import { paymentGatewaysService } from "@/lib/api/payment-gateways";
import { Invoice } from "@/types/invoices";
import { PaymentGateway } from "@/types/payment-gateways";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function InvoicesPage() {
  const [data, setData] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [payDialog, setPayDialog] = useState(false);
  const [selected, setSelected] = useState<Invoice | null>(null);
  const [gatewayId, setGatewayId] = useState("");
  const [paying, setPaying] = useState(false);
  const router = useRouter();

  const columns: Column<Invoice>[] = [
    { key: "id", label: "#", skeletonWidth: "w-8", render: (i) => <span className="font-mono text-xs text-muted-foreground">#{i.id}</span> },
    { key: "total", label: "Amount", skeletonWidth: "w-20", render: (i) => <span className="font-semibold">${i.total}</span> },
    { key: "status", label: "Status", skeletonWidth: "w-20", render: (i) => <StatusBadge status={i.status} /> },
    { key: "dueDate", label: "Due Date", skeletonWidth: "w-28", render: (i) => <span className="text-xs text-muted-foreground">{i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "—"}</span> },
    {
      key: "actions", label: "", skeletonWidth: "w-16",
      render: (i) => i.status === "PENDING" ? (
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelected(i); setPayDialog(true); }}>
          Pay Now
        </Button>
      ) : null,
    },
  ];

  useEffect(() => {
    Promise.all([
      invoicesService.findAll(1, 50),
      paymentGatewaysService.findAll(),
    ]).then(([inv, gws]) => {
      setData(Array.isArray(inv) ? inv : inv.data || []);
      setGateways(gws.filter((g) => g.isActive));
    }).catch(() => toast.error("Failed to load invoices"))
      .finally(() => setLoading(false));
  }, []);

  const handlePay = async () => {
    if (!selected || !gatewayId) return;
    setPaying(true);
    try {
      await invoicesService.pay(selected.id, Number(gatewayId));
      toast.success("Payment initiated");
      setPayDialog(false);
    } catch {
      toast.error("Payment failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <DashboardPageHeader title="My Invoices" description="View and pay your invoices." />
      <DataTable columns={columns} data={data} loading={loading} keyExtractor={(i) => i.id} onView={(i) => router.push(`/dashboard/invoices/${i.id}`)} emptyMessage="No invoices found" />

      <Dialog open={payDialog} onOpenChange={setPayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Invoice #{selected?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold">${selected?.total}</span>
            </div>
            <div className="space-y-2">
              <Label>Payment Gateway</Label>
              <Select value={gatewayId} onValueChange={(v) => v && setGatewayId(v)}>
                <SelectTrigger><SelectValue placeholder="Select gateway" /></SelectTrigger>
                <SelectContent>
                  {gateways.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" disabled={!gatewayId || paying} onClick={handlePay}>
              {paying ? "Processing..." : "Confirm Payment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
