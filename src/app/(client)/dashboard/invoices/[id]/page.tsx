"use client";

import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { InvoiceDetails } from "@/components/invoices/details";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { invoicesService } from "@/lib/api/invoices";
import { paymentGatewaysService } from "@/lib/api/payment-gateways";
import { Invoice } from "@/types/invoices";
import { PaymentGateway } from "@/types/payment-gateways";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [payDialog, setPayDialog] = useState(false);
  const [gatewayId, setGatewayId] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    Promise.all([
      invoicesService.findOne(Number(id)),
      paymentGatewaysService.findAll(),
    ]).then(([inv, gws]) => {
      setInvoice(inv);
      setGateways(gws.filter((g) => g.isActive));
    }).catch(() => toast.error("Failed to load invoice"))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePay = async () => {
    if (!invoice || !gatewayId) return;
    setPaying(true);
    try {
      await invoicesService.pay(invoice.id, Number(gatewayId));
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
      <DashboardPageHeader
        title={loading ? "Loading..." : `Invoice #${id}`}
        action={invoice?.status === "PENDING" ? { label: "Pay Now", onClick: () => setPayDialog(true) } : undefined}
      />
      {loading ? (
        <Skeleton className="h-96 w-full rounded-lg" />
      ) : invoice ? (
        <InvoiceDetails invoice={invoice} />
      ) : (
        <p className="text-muted-foreground text-center py-16">Invoice not found.</p>
      )}

      <Dialog open={payDialog} onOpenChange={setPayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Invoice #{id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold">${invoice?.total}</span>
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
