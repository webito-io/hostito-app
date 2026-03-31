"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { walletsService, WalletBalance } from "@/lib/api/wallets";
import { paymentGatewaysService } from "@/lib/api/payment-gateways";
import { paymentsService } from "@/lib/api/payments";
import { PaymentGateway } from "@/types/payment-gateways";
import { Payment } from "@/types/payments";
import { PlusIcon, ArrowDownIcon, WalletIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCurrency } from "@/hooks/use-currency";

const presets = [10, 25, 50, 100, 250];

export default function WalletPage() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const limit = 10;
  const [loading, setLoading] = useState(true);
  const [depositing, setDepositing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [gatewayId, setGatewayId] = useState("");

  const { formatPrice, code } = useCurrency();

  useEffect(() => {
    Promise.all([
      walletsService.balance(),
      paymentGatewaysService.findAll(),
      paymentsService.findAll(),
    ]).then(([bal, gws, pay]) => {
      setBalance(bal);
      setGateways(gws.filter((g) => g.isActive));
      const arr = Array.isArray(pay) ? pay : (pay as any).data || [];
      setPayments(arr.slice(0, limit));
      setTotalPayments(Array.isArray(pay) ? pay.length : (pay as any).total || arr.length);
    }).catch(() => toast.error("Failed to load wallet"))
      .finally(() => setLoading(false));
  }, []);

  const handleDeposit = async () => {
    if (!amount || Number(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (!gatewayId) { toast.error("Select a payment gateway"); return; }
    setDepositing(true);
    try {
      const res = await walletsService.deposit({ amount: Number(amount), gatewayId: Number(gatewayId) });
      if (res.payment?.url) { window.location.href = res.payment.url; return; }
      toast.success("Deposit initiated");
      setDialogOpen(false);
      setAmount("");
      const bal = await walletsService.balance();
      setBalance(bal);
    } catch { toast.error("Failed to initiate deposit"); }
    finally { setDepositing(false); }
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      {/* Balance header */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <WalletIcon className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">Balance</p>
          </div>
          {loading ? (
            <Skeleton className="h-12 w-48" />
          ) : (
            <p className="text-5xl font-black tabular-nums tracking-tight">
              {balance?.balance?.toFixed(2) ?? "0.00"}
              <span className="text-lg font-bold text-muted-foreground ml-2">{code}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button onClick={() => setDialogOpen(true)} className="flex flex-col items-center gap-1.5 group">
            <span className="h-10 w-10 rounded-full border-2 border-muted-foreground/20 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
              <PlusIcon className="h-4 w-4" />
            </span>
            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors">Add</span>
          </button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Transactions */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold">Transactions</h2>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
        </div>
      ) : payments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12 text-center">No transactions yet</p>
      ) : (
        <div className="divide-y">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center gap-3 py-3.5">
              <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <ArrowDownIcon className="h-3.5 w-3.5 text-muted-foreground" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Payment #{p.id}</p>
                <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`text-sm font-bold tabular-nums ${p.status === "PAID" || p.status === "completed" ? "text-emerald-600" : "text-muted-foreground"}`}>
                {p.amount > 0 ? "+" : ""}{p.amount?.toFixed(2) ?? "—"}
              </span>
            </div>
          ))}
        </div>
      )}

      {totalPayments > limit && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-muted-foreground">Page {page} of {Math.ceil(totalPayments / limit)}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" className="h-8" disabled={page >= Math.ceil(totalPayments / limit)} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Deposit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-2">
            <div className="grid grid-cols-5 gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className={`py-2 rounded-lg text-sm font-bold transition-all ${amount === String(p) ? "bg-foreground text-background" : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
                >
                  ${p}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
              <Input
                type="number" min="1" step="0.01"
                value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="Custom amount" className="pl-7 h-11 text-lg font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Payment Method</Label>
              <div className="space-y-2">
                {gateways.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setGatewayId(String(g.id))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left ${gatewayId === String(g.id)
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:border-muted-foreground/30"
                      }`}
                  >
                    <span className="capitalize">{g.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full h-11 font-bold" disabled={depositing || !amount || Number(amount) <= 0 || !gatewayId} onClick={handleDeposit}>
              {depositing ? "Processing..." : amount && Number(amount) > 0 ? `Deposit ${formatPrice(Number(amount))}` : "Deposit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
