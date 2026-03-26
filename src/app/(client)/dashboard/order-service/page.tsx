"use client";

import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { productsService } from "@/lib/api/products";
import { cartService } from "@/lib/api/cart";
import { Product } from "@/types/products";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const cycleLabel: Record<string, string> = {
  MONTHLY: "/mo", QUARTERLY: "/qtr", SEMIANNUAL: "/6mo",
  ANNUAL: "/yr", BIENNIAL: "/2yr", TRIENNIAL: "/3yr", ONETIME: "",
};

export default function OrderServicePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    productsService.findAll(1, 50)
      .then((res) => setProducts(res.data.filter((p) => p.isActive)))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (product: Product) => {
    setAdding(product.id);
    try {
      await cartService.addItem({ productId: product.id, config: {}, quantity: 1 });
      toast.success(`${product.name} added to cart`, {
        action: { label: "View Cart", onClick: () => router.push("/dashboard/cart") },
      });
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <DashboardPageHeader
        title="Order Service"
        description="Choose a product to add to your cart."
        action={{ label: "View Cart", onClick: () => router.push("/dashboard/cart") }}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
                <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3 mt-2" /></CardContent>
                <CardFooter><Skeleton className="h-9 w-full" /></CardFooter>
              </Card>
            ))
          : products.map((product) => (
              <Card key={product.id} className="flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-bold">{product.name}</CardTitle>
                    <StatusBadge status={product.type} />
                  </div>
                  {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                  )}
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-2xl font-black">
                    ${product.price}
                    <span className="text-sm font-normal text-muted-foreground">{cycleLabel[product.cycle] ?? ""}</span>
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    size="sm"
                    disabled={adding === product.id}
                    onClick={() => handleAddToCart(product)}
                  >
                    {adding === product.id ? "Adding..." : "Add to Cart"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
        {!loading && products.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-3 py-8 text-center">No products available</p>
        )}
      </div>
    </div>
  );
}
