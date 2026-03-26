"use client";

import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cartService } from "@/lib/api/cart";
import { Cart } from "@/types/cart";
import { Trash2Icon, MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [applying, setApplying] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const router = useRouter();

  const fetchCart = async (couponCode?: string) => {
    try {
      const data = await cartService.getCart(couponCode);
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const handleRemove = async (itemId: number) => {
    setRemoving(itemId);
    try {
      await cartService.removeItem(itemId);
      toast.success("Item removed");
      fetchCart(coupon || undefined);
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setRemoving(null);
    }
  };

  const handleQuantity = async (itemId: number, productId: number, config: Record<string, any>, qty: number) => {
    if (qty < 1) return;
    setUpdating(itemId);
    try {
      await cartService.updateItem(itemId, { productId, config, quantity: qty });
      fetchCart(coupon || undefined);
    } catch {
      toast.error("Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) return;
    setApplying(true);
    try {
      await fetchCart(coupon.trim());
      toast.success("Coupon applied");
    } catch {
      toast.error("Invalid coupon");
    } finally {
      setApplying(false);
    }
  };

  const isEmpty = !cart || cart.items.length === 0;

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <DashboardPageHeader title="Shopping Cart" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <DashboardPageHeader
        title="Shopping Cart"
        description={isEmpty ? undefined : `${cart.items.length} item(s) in your cart`}
        action={{ label: "Continue Shopping", onClick: () => router.push("/dashboard/order-service") }}
      />

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShoppingCartIcon className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-semibold text-muted-foreground">Your cart is empty</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Browse products and add them to your cart.</p>
          <Button className="mt-6" onClick={() => router.push("/dashboard/order-service")}>
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 rounded-lg border p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {item.product?.name ?? `Product #${item.productId}`}
                  </p>
                  {item.product && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ${item.product.price} × {item.quantity}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={updating === item.id || item.quantity <= 1}
                    onClick={() => handleQuantity(item.id, item.productId, item.config, item.quantity - 1)}
                  >
                    <MinusIcon className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={updating === item.id}
                    onClick={() => handleQuantity(item.id, item.productId, item.config, item.quantity + 1)}
                  >
                    <PlusIcon className="h-3 w-3" />
                  </Button>
                </div>
                <p className="font-bold text-sm tabular-nums w-20 text-right">
                  ${item.product ? (item.product.price * item.quantity).toFixed(2) : "—"}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  disabled={removing === item.id}
                  onClick={() => handleRemove(item.id)}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="rounded-lg border p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">${cart.subtotal.toFixed(2)}</span>
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
                    <span className="font-medium tabular-nums">-${cart.discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between pt-1">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-black tabular-nums">${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="flex gap-2">
              <Input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Coupon code"
                className="h-9 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-9 shrink-0"
                disabled={applying || !coupon.trim()}
                onClick={handleApplyCoupon}
              >
                {applying ? "..." : "Apply"}
              </Button>
            </div>

            {/* Checkout */}
            <Button
              className="w-full font-bold"
              size="lg"
              onClick={() => router.push("/dashboard/checkout")}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
