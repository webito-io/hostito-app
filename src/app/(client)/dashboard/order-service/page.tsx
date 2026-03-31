"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { productsService } from "@/lib/api/products";
import { cartService } from "@/lib/api/cart";
import { Product, ProductVariant } from "@/types/products";
import { PackageIcon, ShoppingCartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/use-currency";

const cycleLabel: Record<string, string> = {
  MONTHLY: "/mo", QUARTERLY: "/qtr", SEMIANNUAL: "/6mo",
  ANNUAL: "/yr", BIENNIAL: "/2yr", TRIENNIAL: "/3yr", ONETIME: "",
};

export default function OrderServicePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({});
  const router = useRouter();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    productsService.findAll(1, 50)
      .then((res) => {
        const active = res.data.filter((p) => p.isActive);
        setProducts(active);
        const defaults: Record<number, number> = {};
        active.forEach((p) => { if (p.variants?.length) defaults[p.id] = p.variants[0].id; });
        setSelectedVariants(defaults);
      })
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const getVariant = (product: Product): ProductVariant | undefined =>
    product.variants?.find((v) => v.id === selectedVariants[product.id]);

  const handleAdd = async (product: Product) => {
    const variant = getVariant(product);
    if (!variant) { toast.error("Select a plan"); return; }
    const key = `${product.id}-${variant.id}`;
    setAdding(key);
    try {
      await cartService.addItem({ productId: product.id, variantId: variant.id, config: {}, quantity: 1 });
      toast.success(`${product.name} added to cart`, {
        action: { label: "View Cart", onClick: () => router.push("/dashboard/cart") },
      });
    } catch { toast.error("Failed to add to cart"); }
    finally { setAdding(null); }
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      {/* Header */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <PackageIcon className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">Products</p>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Order a Service</h1>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => router.push("/dashboard/cart")}>
          <ShoppingCartIcon className="h-4 w-4" /> Cart
        </Button>
      </div>

      <Separator className="my-6" />

      {/* Product list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground py-16 text-center">No products available</p>
      ) : (
        <div className="divide-y">
          {products.map((product) => {
            const variant = getVariant(product);
            return (
              <div key={product.id} className="flex items-center gap-4 py-5">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{product.name}</p>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{product.type}</span>
                  </div>
                  {product.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.description}</p>
                  )}
                </div>

                {/* Variant selector */}
                {product.variants?.length > 1 && (
                  <select
                    value={selectedVariants[product.id] ?? ""}
                    onChange={(e) => setSelectedVariants((s) => ({ ...s, [product.id]: Number(e.target.value) }))}
                    className="h-8 rounded-md border bg-background px-2 text-xs font-medium shrink-0"
                  >
                    {product.variants.map((v) => (
                      <option key={v.id} value={v.id}>{v.cycle} — {formatPrice(v.price)}</option>
                    ))}
                  </select>
                )}

                {/* Price */}
                <div className="w-24 text-right shrink-0">
                  {variant ? (
                    <p className="font-black tabular-nums">
                      {formatPrice(variant.price)}
                      <span className="text-xs font-normal text-muted-foreground">{cycleLabel[variant.cycle] ?? ""}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">—</p>
                  )}
                </div>

                {/* Add */}
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 font-bold"
                  disabled={adding === `${product.id}-${variant?.id}` || !variant}
                  onClick={() => handleAdd(product)}
                >
                  {adding === `${product.id}-${variant?.id}` ? "..." : "Add"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
