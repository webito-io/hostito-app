"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cartService } from "@/lib/api/cart";
import instance from "@/lib/api/instance";
import { SearchIcon, GlobeIcon, CheckCircleIcon, XCircleIcon, ShoppingCartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface CheckResult {
  domain: string;
  available: boolean;
}

export default function RegisterDomainPage() {
  const [query, setQuery] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setChecking(true);
    setResult(null);
    try {
      const res = await instance.get<CheckResult>("/domains/check", { params: { domain: query.trim() } });
      setResult(res.data);
    } catch {
      toast.error("Failed to check domain");
    } finally {
      setChecking(false);
    }
  };

  const handleAddToCart = async () => {
    if (!result?.domain) return;
    setAdding(true);
    try {
      await cartService.addDomain(result.domain);
      toast.success(`${result.domain} added to cart`, {
        action: { label: "View Cart", onClick: () => router.push("/dashboard/cart") },
      });
    } catch {
      toast.error("Failed to add domain to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      {/* Hero search */}
      <div className="py-12 md:py-20">
        <div className="flex items-center gap-2 mb-3">
          <GlobeIcon className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">Register Domain</p>
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-8">Find your perfect domain</h1>

        <form onSubmit={handleCheck} className="flex gap-0 max-w-2xl">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a domain name..."
              className="h-13 pl-11 text-base font-mono rounded-r-none border-r-0"
            />
          </div>
          <Button type="submit" disabled={checking || !query.trim()} className="h-13 px-8 rounded-l-none font-bold">
            {checking ? "Searching..." : "Search"}
          </Button>
        </form>
      </div>

      <Separator />

      {/* Result */}
      {result && (
        <div className="py-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              {result.available ? (
                <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-400" />
              )}
              <div>
                <p className="font-mono font-bold text-lg">{result.domain}</p>
                <p className={`text-sm ${result.available ? "text-emerald-600" : "text-red-500"}`}>
                  {result.available ? "Available for registration" : "This domain is taken"}
                </p>
              </div>
            </div>
            {result.available && (
              <Button disabled={adding} onClick={handleAddToCart} className="gap-2 font-bold">
                <ShoppingCartIcon className="h-4 w-4" />
                {adding ? "Adding..." : "Add to Cart"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !checking && (
        <div className="py-16 text-center">
          <p className="text-sm text-muted-foreground">Enter a domain name above to check availability</p>
        </div>
      )}
    </div>
  );
}
