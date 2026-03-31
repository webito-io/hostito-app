"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cartService } from "@/lib/api/cart";
import { Cart, CartItem } from "@/types/cart";
import { Trash2Icon, MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/use-currency";

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [applying, setApplying] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const router = useRouter();
  const { formatPrice } = useCurrency();

  const fetchCart = async (code?: string) => {
    try { setCart(await cartService.getCart(code)); }
    catch { setCart(null); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCart(); }, []);
  useEffect(() => { if (cart?.couponCode) setCoupon(cart.couponCode); }, [cart?.couponCode]);

  const handleRemove = async (id: number) => {
    setRemoving(id);
    try { await cartService.removeItem(id); toast.success("Removed"); fetchCart(coupon || undefined); }
    catch { toast.error("Failed"); }
    finally { setRemoving(null); }
  };

  const handleQty = async (item: CartItem, qty: number) => {
    if (qty < 1) return;
    setUpdating(item.id);
    try { await cartService.updateItem(item.id, { productId: item.productId, variantId: item.variantId ?? 0, config: item.config, quantity: qty }); fetchCart(coupon || undefined); }
    catch { toast.error("Failed"); }
    finally { setUpdating(null); }
  };

  const isEmpty = !cart || !cart.items?.length;

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShoppingCartIcon className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">Cart</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            {isEmpty ? "Your cart is empty" : `${cart.items.length} item${cart.items.length > 1 ? "s" : ""}`}
          </h1>
        </div>
        {!isEmpty && (
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/order-service")}>
            Continue Shopping
          </Button>
        )}
      </div>

      <Separator className="my-6" />

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : isEmpty ? (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">Browse products and add them to your cart.</p>
          <Button onClick={() => router.push("/dashboard/order-service")}>Browse Products</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 divide-y">
            {cart.items.map((item) => {
              const isDomain = item.product?.type === "DOMAIN";
              const configs = item.config ? Object.entries(item.config).filter(([k]) => k !== "domain") : [];
              return (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{item.product?.name ?? `Product #${item.productId}`}</p>
                    {item.config?.domain && <p className="text-xs font-mono text-primary mt-0.5">{item.config.domain}</p>}
                    {item.variant && <p className="text-[10px] text-muted-foreground mt-0.5">{item.variant.action} · {item.variant.cycle}</p>}
                    {configs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {configs.map(([k, v]) => <span key={k} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{k}: {String(v)}</span>)}
                      </div>
                    )}
                  </div>
                  {!isDomain && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button disabled={updating === item.id || item.quantity <= 1} onClick={() => handleQty(item, item.quantity - 1)} className="h-7 w-7 rounded border flex items-center justify-center hover:bg-muted disabled:opacity-30"><MinusIcon className="h-3 w-3" /></button>
                      <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                      <button disabled={updating === item.id} onClick={() => handleQty(item, item.quantity + 1)} className="h-7 w-7 rounded border flex items-center justify-center hover:bg-muted disabled:opacity-30"><PlusIcon className="h-3 w-3" /></button>
                    </div>
                  )}
                  <p className="font-bold text-sm tabular-nums w-20 text-right shrink-0">
                    {item.variant ? formatPrice(item.variant.price * item.quantity) : "—"}
                  </p>
                  <button disabled={removing === item.id} onClick={() => handleRemove(item.id)} className="h-8 w-8 flex items-center justify-center rounded hover:bg-destructive/10 text-destructive shrink-0 disabled:opacity-30">
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Summary</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{formatPrice(cart.subtotal)}</span></div>
              {cart.tax > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="tabular-nums">+{formatPrice(cart.tax)}</span></div>}
              {cart.discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount</span><span className="tabular-nums">-{formatPrice(cart.discount)}</span></div>}
              <Separator />
              <div className="flex justify-between"><span className="font-bold">Total</span><span className="text-2xl font-black tabular-nums">{formatPrice(cart.total)}</span></div>
            </div>

            {/* Coupon */}
            <div className="mt-6">
              {cart.couponCode ? (
                <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5">
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">Coupon applied</p>
                    <p className="font-mono font-bold text-sm text-emerald-700">{cart.couponCode}</p>
                  </div>
                  <button disabled={applying} onClick={async () => { setApplying(true); try { await fetchCart(""); setCoupon(""); } finally { setApplying(false); } }} className="text-xs text-destructive font-medium hover:underline">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="h-9 text-sm font-mono" />
                  <Button variant="outline" size="sm" className="h-9 shrink-0" disabled={applying || !coupon.trim()} onClick={async () => { setApplying(true); try { await fetchCart(coupon.trim()); toast.success("Applied"); } catch { toast.error("Invalid"); } finally { setApplying(false); } }}>Apply</Button>
                </div>
              )}
            </div>

            <Button className="w-full mt-6 h-11 font-bold" onClick={() => router.push("/dashboard/checkout")}>
              Checkout · {formatPrice(cart.total)}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
