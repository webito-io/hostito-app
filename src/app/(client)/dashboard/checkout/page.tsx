"use client";

import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cartService } from "@/lib/api/cart";
import { paymentGatewaysService } from "@/lib/api/payment-gateways";
import { Cart } from "@/types/cart";
import { PaymentGateway } from "@/types/payment-gateways";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CheckoutPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [gatewayId, setGatewayId] = useState("");
  const [coupon, setCoupon] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    Promise.all([
      cartService.getCart(),
      paymentGatewaysService.findAll(),
    ]).then(([c, gws]) => {
      setCart(c);
      setGateways(gws.filter((g) => g.isActive));
    }).catch(() => toast.error("Failed to load checkout"))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return;
    setSubmitting(true);
    try {
      const order = await cartService.checkout(
        gatewayId ? Number(gatewayId) : undefined,
        coupon || undefined,
      );
      toast.success(`Order #${order.id} created`);

      // If gateway selected, initiate payment
      if (gatewayId && order.id) {
        try {
          const { instance } = await import("@/lib/api/instance");
          const payRes = await instance.post(`/orders/${order.id}/pay`, { gatewayId: Number(gatewayId) });
          const payData = payRes.data;
          if (payData?.url) {
            window.location.href = payData.url;
            return;
          }
        } catch {
          // Payment initiation failed but order was created
        }
      }
      router.push(`/dashboard/orders/${order.id}`);
    } catch {
      toast.error("Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <DashboardPageHeader title="Checkout" />
        <Skeleton className="h-96 w-full max-w-2xl rounded-lg" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <DashboardPageHeader title="Checkout" />
        <div className="text-center py-20">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/order-service")}>
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <DashboardPageHeader title="Checkout" action={{ label: "Back to Cart", onClick: () => router.push("/dashboard/cart") }} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
        {/* Items Review */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Order Items</h3>
          <div className="rounded-lg border divide-y">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{item.product?.name ?? `Product #${item.productId}`}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-bold tabular-nums">
                  ${item.product ? (item.product.price * item.quantity).toFixed(2) : "—"}
                </p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="rounded-lg border p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="tabular-nums">${cart.subtotal.toFixed(2)}</span>
            </div>
            {cart.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="tabular-nums">+${cart.tax.toFixed(2)}</span>
              </div>
            )}
            {cart.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span className="tabular-nums">-${cart.discount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between pt-1">
              <span className="font-bold text-base">Total</span>
              <span className="text-2xl font-black tabular-nums">${cart.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Payment</h3>

            <div className="space-y-2">
              <Label>Payment Gateway</Label>
              <Select value={gatewayId} onValueChange={(v) => v && setGatewayId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {gateways.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Coupon Code <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter coupon code"
                className="text-sm"
              />
            </div>
          </div>

          <Button
            className="w-full font-bold"
            size="lg"
            disabled={submitting}
            onClick={handleCheckout}
          >
            {submitting ? "Processing..." : `Pay $${cart.total.toFixed(2)}`}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center">
            By completing this order you agree to the terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
