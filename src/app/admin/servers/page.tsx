"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormSheet } from "@/components/admin/FormSheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { serversService } from "@/lib/api/servers";
import { Server } from "@/types/servers";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const columns: Column<Server>[] = [
  { key: "name", label: "Server Name", skeletonWidth: "w-48", render: (s) => <span className="font-medium">{s.name}</span> },
  { key: "hostname", label: "Hostname", skeletonWidth: "w-48", render: (s) => <span className="text-muted-foreground">{s.hostname}</span> },
  { key: "ip", label: "IP Address", skeletonWidth: "w-32", render: (s) => <span className="text-muted-foreground">{s.ip || "N/A"}</span> },
  { key: "isActive", label: "Status", skeletonWidth: "w-24", render: (s) => <StatusBadge active={s.isActive} activeLabel="Active" inactiveLabel="Inactive" /> },
];

export default function ServersPage() {
  const [data, setData] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    hostname: "",
    ip: "",
    port: 2087,
    isActive: true,
    maxAccounts: 100,
    provisionerId: 1,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const servers = await serversService.findAll();
      setData(servers);
    } catch (error) {
      toast.error("Failed to fetch servers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => {
    setSelectedServer(null);
    setFormData({ name: "", hostname: "", ip: "", port: 2087, isActive: true, maxAccounts: 100, provisionerId: 1 });
    setSheetOpen(true);
  };

  const handleEdit = (server: Server) => {
    setSelectedServer(server);
    setFormData({
      name: server.name,
      hostname: server.hostname,
      ip: server.ip || "",
      port: server.port,
      isActive: server.isActive,
      maxAccounts: server.maxAccounts || 100,
      provisionerId: server.provisionerId,
    });
    setSheetOpen(true);
  };

  const handleDelete = async (server: Server) => {
    if (!window.confirm("Are you sure you want to delete this server?")) return;
    try {
      await serversService.remove(server.id);
      toast.success("Server deleted successfully");
      fetchData();
    } catch { toast.error("Failed to delete server"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedServer) {
        await serversService.update(selectedServer.id, formData);
        toast.success("Server updated successfully");
      } else {
        await serversService.create(formData);
        toast.success("Server created successfully");
      }
      setSheetOpen(false);
      fetchData();
    } catch {
      toast.error(selectedServer ? "Failed to update" : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Servers Management" action={{ label: "Add Server", onClick: handleCreate }} />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        keyExtractor={(s) => s.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No servers found"
      />

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Server"
        isEditing={!!selectedServer}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Server Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Internal Server Name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hostname">Hostname</Label>
            <Input
              id="hostname"
              value={formData.hostname}
              onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
              placeholder="srv1.hostito.com"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ip">IP Address</Label>
              <Input
                id="ip"
                value={formData.ip}
                onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
                placeholder="1.2.3.4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">API Port</Label>
              <Input
                id="port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxAccounts">Max Accounts</Label>
              <Input
                id="maxAccounts"
                type="number"
                value={formData.maxAccounts}
                onChange={(e) => setFormData({ ...formData, maxAccounts: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provisionerId">Provisioner ID</Label>
              <Input
                id="provisionerId"
                type="number"
                value={formData.provisionerId}
                onChange={(e) => setFormData({ ...formData, provisionerId: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
