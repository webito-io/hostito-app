const colorMap: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  SUSPENDED: "bg-orange-100 text-orange-700",
  OVERDUE: "bg-red-100 text-red-700",
  REFUNDED: "bg-blue-100 text-blue-700",
  FRAUD: "bg-red-100 text-red-700",
  EXPIRED: "bg-gray-100 text-gray-600",
  TRANSFERRED: "bg-blue-100 text-blue-700",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = colorMap[status?.toUpperCase()] ?? "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${cls}`}>
      {status}
    </span>
  );
}
