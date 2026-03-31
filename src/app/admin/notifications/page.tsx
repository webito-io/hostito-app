"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { notificationsService } from "@/lib/api/notifications";
import { NotificationLog } from "@/types/notifications";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  sent: "text-green-600 bg-green-100",
  failed: "text-red-600 bg-red-100",
  pending: "text-yellow-600 bg-yellow-100",
};

const columns: Column<NotificationLog>[] = [
  {
    key: "type",
    label: "Type",
    skeletonWidth: "w-16",
    render: (log) => (
      <span className="font-bold uppercase text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
        {log.type}
      </span>
    ),
  },
  {
    key: "to",
    label: "Recipient",
    skeletonWidth: "w-48",
    render: (log) => <span className="text-sm">{log.to}</span>,
  },
  {
    key: "subject",
    label: "Subject",
    skeletonWidth: "w-64",
    render: (log) => (
      <span className="text-sm text-muted-foreground truncate max-w-[200px] inline-block">
        {log.subject || "—"}
      </span>
    ),
  },
  {
    key: "status",
    label: "Status",
    skeletonWidth: "w-20",
    render: (log) => (
      <span
        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
          statusColors[log.status] ?? "text-muted-foreground bg-muted"
        }`}
      >
        {log.status}
      </span>
    ),
  },
  {
    key: "error",
    label: "Error",
    skeletonWidth: "w-40",
    render: (log) => (
      <span className="text-xs text-red-500 truncate max-w-[160px] inline-block">
        {log.error || "—"}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Sent At",
    skeletonWidth: "w-36",
    render: (log) => (
      <span className="text-xs text-muted-foreground">
        {new Date(log.createdAt).toLocaleString()}
      </span>
    ),
  },
];

export default function NotificationLogsPage() {
  const [data, setData] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await notificationsService.findAllLogs({ page: 1, limit: 50 });
      setData(Array.isArray(res) ? res : res.data || []);
    } catch {
      toast.error("Failed to fetch notification logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Notification Logs" />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        keyExtractor={(l) => l.id}
        emptyMessage="No notification logs found"
      />
    </div>
  );
}
