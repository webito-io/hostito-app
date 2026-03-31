"use client";

import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { DomainDetails } from "@/components/domains/details";
import { Skeleton } from "@/components/ui/skeleton";
import { domainsService } from "@/lib/api/domains";
import { Domain } from "@/types/domains";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DomainDetailPage() {
  const { id } = useParams();
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    domainsService.findOne(Number(id))
      .then(setDomain)
      .catch(() => toast.error("Failed to load domain"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <DashboardPageHeader title={loading ? "Loading..." : (domain?.name ?? `Domain #${id}`)} />
      {loading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : domain ? (
        <DomainDetails domain={domain} />
      ) : (
        <p className="text-muted-foreground text-center py-16">Domain not found.</p>
      )}
    </div>
  );
}
