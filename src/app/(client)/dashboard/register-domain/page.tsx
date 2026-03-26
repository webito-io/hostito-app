"use client";

import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { domainsService } from "@/lib/api/domains";
import { useState } from "react";
import { toast } from "sonner";
import instance from "@/lib/api/instance";

interface CheckResult {
  domain: string;
  available: boolean;
}

export default function RegisterDomainPage() {
  const [query, setQuery] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setChecking(true);
    setResult(null);
    try {
      const res = await instance.get<CheckResult>("/domains/check", { params: { domain: query.trim() } });
      setResult(res.data);
    } catch {
      toast.error("Failed to check domain availability");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <DashboardPageHeader title="Register Domain" description="Check availability and register a new domain." />

      <div className="max-w-xl space-y-6">
        <form onSubmit={handleCheck} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="example.com"
            className="font-mono"
          />
          <Button type="submit" disabled={checking} className="shrink-0">
            {checking ? "Checking..." : "Check"}
          </Button>
        </form>

        {result && (
          <div className={`rounded-lg border p-4 flex items-center justify-between ${result.available ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
            <div>
              <p className="font-mono font-semibold">{result.domain}</p>
              <p className={`text-sm mt-0.5 ${result.available ? "text-emerald-700" : "text-red-600"}`}>
                {result.available ? "Available for registration" : "Not available"}
              </p>
            </div>
            {result.available && (
              <Button size="sm" onClick={() => toast.info("Redirect to checkout coming soon")}>
                Register
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
