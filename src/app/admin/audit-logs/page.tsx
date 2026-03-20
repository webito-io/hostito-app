"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { auditLogsService } from "@/lib/api/audit-logs";
import { AuditLog } from "@/types/audit-logs";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const columns: Column<AuditLog>[] = [
  { key: "action", label: "Action", skeletonWidth: "w-32", render: (log) => <span className="font-bold uppercase text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">{log.action}</span> },
  { key: "entity", label: "Entity", skeletonWidth: "w-24", render: (log) => <span className="text-muted-foreground">{log.entity} (#{log.entityId})</span> },
  { key: "user", label: "User", skeletonWidth: "w-24", render: (log) => <span className="text-muted-foreground">User #{log.userId}</span> },
  { key: "ip", label: "IP Address", skeletonWidth: "w-24", render: (log) => <span className="font-mono text-[10px] text-muted-foreground/60">{log.ipAddress || "N/A"}</span> },
  { key: "createdAt", label: "Timestamp", skeletonWidth: "w-48", render: (log) => <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span> },
];

export default function AuditLogsPage() {
  const [data, setData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const logs = await auditLogsService.findAll();
      // Assuming return is array or data field, adapting to array for now as per simple service
      setData(Array.isArray(logs) ? logs : (logs as any).data || []);
    } catch (error) {
      toast.error("Failed to fetch audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Audit Logs" />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        keyExtractor={(l) => l.id}
        emptyMessage="No logs found"
      />
    </div>
  );
}
