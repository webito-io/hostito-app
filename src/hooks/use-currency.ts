"use client";

import { useAuthContext } from "@/providers/auth/AuthContext";

export function useCurrency() {
  const { user } = useAuthContext();
  const c = user?.organization?.currency;

  const formatPrice = (amount: number | undefined | null): string => {
    if (amount == null) return "—";
    return `${c?.symbol ?? "$"}${amount.toFixed(2)}`;
  };

  return { symbol: c?.symbol ?? "$", code: c?.code ?? "USD", formatPrice };
}
