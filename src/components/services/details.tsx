import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Service } from "@/types/services";

export function ServiceDetails({ service }: { service: Service }) {
  const rows = [
    { label: "Service ID", value: `#${service.id}` },
    { label: "Product", value: `Product #${service.productId}` },
    { label: "Order", value: `Order #${service.orderId}` },
    { label: "Username", value: service.username || "—" },
    { label: "Server", value: service.serverId ? `Server #${service.serverId}` : "—" },
    { label: "Domain", value: service.domainId ? `Domain #${service.domainId}` : "—" },
    { label: "Next Due Date", value: service.nextDueDate ? new Date(service.nextDueDate).toLocaleDateString(undefined, { dateStyle: "long" }) : "—" },
    { label: "Created", value: new Date(service.createdAt).toLocaleDateString(undefined, { dateStyle: "long" }) },
  ];

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="px-6 py-5 border-b flex items-center justify-between bg-muted/20">
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Service</p>
          <h2 className="text-xl font-black mt-0.5">#{service.id}</h2>
        </div>
        <StatusBadge status={service.status} />
      </div>
      <div className="divide-y">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-center px-6 py-3 text-sm">
            <span className="w-40 text-xs font-bold uppercase text-muted-foreground tracking-wide shrink-0">{label}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
