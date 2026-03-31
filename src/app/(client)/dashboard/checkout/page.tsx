"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cartService } from "@/lib/api/cart";
import { paymentGatewaysService } from "@/lib/api/payment-gateways";
import { Cart } from "@/types/cart";
import { PaymentGateway } from "@/types/payment-gateways";
import { CreditCardIcon, ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/use-currency";

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [gatewayId, setGatewayId] = useState("");
  const [coupon, setCoupon] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    Promise.all([cartService.getCart(), paymentGatewaysService.findAll()])
      .then(([c, gws]) => { setCart(c); setGateways(gws.filter((g) => g.isActive)); })
      .catch(() => toast.error("Failed to load checkout"))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async () => {
    if (!cart || !cart.items?.length) return;
    setSubmitting(true);
    try {
      const order = await cartService.checkout(gatewayId ? Number(gatewayId) : undefined, coupon || undefined);
      toast.success(`Order #${order.id} created`);
      if (gatewayId && order.id) {
        try {
          const { instance } = await import("@/lib/api/instance");
          const payRes = await instance.post(`/orders/${order.id}/pay`, { gatewayId: Number(gatewayId) });
          if (payRes.data?.url) { window.location.href = payRes.data.url; return; }
        } catch { }
      }
      router.push(`/dashboard/orders/${order.id}`);
    } catch { toast.error("Checkout failed"); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <Skeleton className="h-8 w-48 mb-8" />
      <Skeleton className="h-96 w-full" />
    </div>
  );

  if (!cart || !cart.items?.length) return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <h1 className="text-3xl font-black tracking-tight mb-6">Checkout</h1>
      <div className="py-16 text-center">
        <p className="text-sm text-muted-foreground mb-4">Your cart is empty.</p>
        <Button onClick={() => router.push("/dashboard/order-service")}>Browse Products</Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.push("/dashboard/cart")} className="h-8 w-8 rounded flex items-center justify-center hover:bg-muted">
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCardIcon className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">Checkout</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Complete your order</h1>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: items */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Order Items</p>
          <div className="divide-y">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3.5">
                <div>
                  <p className="text-sm font-medium">{item.product?.name ?? `Product #${item.productId}`}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variant ? `${item.variant.action} · ${item.variant.cycle}` : ""}
                    {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                  </p>
                </div>
                <span className="text-sm font-bold tabular-nums">
                  {item.variant ? formatPrice(item.variant.price * item.quantity) : "—"}
                </span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{formatPrice(cart.subtotal)}</span></div>
            {cart.tax > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="tabular-nums">+{formatPrice(cart.tax)}</span></div>}
            {cart.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span className="tabular-nums">-{formatPrice(cart.discount)}</span></div>}
            <Separator />
            <div className="flex justify-between pt-1"><span className="font-bold text-base">Total</span><span className="text-2xl font-black tabular-nums">{formatPrice(cart.total)}</span></div>
          </div>
        </div>

        {/* Right: payment */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Payment Method</p>
          <div className="space-y-2 mb-6">
            {gateways.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGatewayId(String(g.id))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium transition-all text-left ${gatewayId === String(g.id) ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-muted-foreground/30"
                  }`}
              >
                <span className="capitalize">{g.name}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2 mb-6">
            <Label className="text-xs text-muted-foreground">Coupon Code</Label>
            <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Optional" className="h-10 text-sm font-mono" />
          </div>

          <Button className="w-full h-12 text-base font-bold" disabled={submitting} onClick={handleCheckout}>
            {submitting ? "Processing..." : `Pay ${formatPrice(cart.total)}`}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center mt-3">
            By completing this order you agree to the terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
