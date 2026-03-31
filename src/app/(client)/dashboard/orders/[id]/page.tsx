"use client";

import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { OrderDetails } from "@/components/orders/details";
import { Skeleton } from "@/components/ui/skeleton";
import { ordersService } from "@/lib/api/orders";
import { Order } from "@/types/orders";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersService.findOne(Number(id))
      .then(setOrder)
      .catch(() => toast.error("Failed to load order"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <DashboardPageHeader title={loading ? "Loading..." : `Order #${id}`} />
      {loading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : order ? (
        <OrderDetails order={order} />
      ) : (
        <p className="text-muted-foreground text-center py-16">Order not found.</p>
      )}
    </div>
  );
}
