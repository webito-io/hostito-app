"use client";

import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { ServiceDetails } from "@/components/services/details";
import { Skeleton } from "@/components/ui/skeleton";
import { servicesService } from "@/lib/api/services";
import { Service } from "@/types/services";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ServiceDetailPage() {
  const { id } = useParams();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    servicesService.findOne(Number(id))
      .then(setService)
      .catch(() => toast.error("Failed to load service"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <DashboardPageHeader title={loading ? "Loading..." : `Service #${id}`} />
      {loading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : service ? (
        <ServiceDetails service={service} />
      ) : (
        <p className="text-muted-foreground text-center py-16">Service not found.</p>
      )}
    </div>
  );
}
