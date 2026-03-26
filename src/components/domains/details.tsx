import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Domain } from "@/types/domains";

export function DomainDetails({ domain }: { domain: Domain }) {
  const rows = [
    { label: "Domain Name", value: domain.name },
    { label: "Registrar", value: domain.registrar || "—" },
    { label: "Expires", value: domain.expiryDate ? new Date(domain.expiryDate).toLocaleDateString(undefined, { dateStyle: "long" }) : "—" },
    { label: "Registered", value: new Date(domain.createdAt).toLocaleDateString(undefined, { dateStyle: "long" }) },
  ];

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="px-6 py-5 border-b flex items-center justify-between bg-muted/20">
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Domain</p>
          <h2 className="text-xl font-black font-mono mt-0.5">{domain.name}</h2>
        </div>
        <StatusBadge status={domain.status} />
      </div>
      <div className="divide-y">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center px-6 py-3 text-sm">
            <span className="w-40 text-xs font-bold uppercase text-muted-foreground tracking-wide shrink-0">{label}</span>
            <span className="font-medium font-mono">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
