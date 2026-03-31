"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormSheet } from "@/components/admin/FormSheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { serversService } from "@/lib/api/servers";
import { provisionersService } from "@/lib/api/provisioners";
import { Server } from "@/types/servers";
import { Provisioner } from "@/types/provisioners";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const columns: Column<Server>[] = [
  { key: "name", label: "Name", skeletonWidth: "w-40", render: (s) => <span className="font-medium">{s.name}</span> },
  { key: "hostname", label: "Hostname", skeletonWidth: "w-40", render: (s) => <span className="font-mono text-sm text-muted-foreground">{s.hostname}</span> },
  { key: "ip", label: "IP", skeletonWidth: "w-28", render: (s) => <span className="font-mono text-sm text-muted-foreground">{s.ip || "—"}</span> },
  { key: "port", label: "Port", skeletonWidth: "w-12", render: (s) => <span className="text-xs text-muted-foreground">{s.port}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-20", render: (s) => <StatusBadge active={s.isActive} /> },
];

export default function ServersPage() {
  const [data, setData] = useState<Server[]>([]);
  const [provisioners, setProvisioners] = useState<Provisioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Server | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [credentialsJson, setCredentialsJson] = useState("{}");

  const [formData, setFormData] = useState({
    name: "", hostname: "", ip: "", port: 2087,
    isActive: true, maxAccounts: 100, provisionerId: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [srv, prov] = await Promise.all([
        serversService.findAll(),
        provisionersService.findAll(),
      ]);
      setData(Array.isArray(srv) ? srv : (srv as any).data || []);
      setProvisioners(Array.isArray(prov) ? prov : prov.data || []);
    } catch { toast.error("Failed to fetch servers"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => {
    setSelected(null);
    setFormData({ name: "", hostname: "", ip: "", port: 2087, isActive: true, maxAccounts: 100, provisionerId: provisioners[0]?.id || 0 });
    setCredentialsJson("{}");
    setSheetOpen(true);
  };

  const handleEdit = (server: Server) => {
    setSelected(server);
    setFormData({
      name: server.name, hostname: server.hostname, ip: server.ip || "",
      port: server.port, isActive: server.isActive,
      maxAccounts: server.maxAccounts || 100, provisionerId: server.provisionerId,
    });
    setCredentialsJson(JSON.stringify(server.credentials || {}, null, 2));
    setSheetOpen(true);
  };

  const handleDelete = async (server: Server) => {
    if (!window.confirm("Delete this server?")) return;
    try { await serversService.remove(server.id); toast.success("Server deleted"); fetchData(); }
    catch { toast.error("Failed to delete server"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let credentials: Record<string, any> | undefined;
      try { credentials = JSON.parse(credentialsJson); } catch { toast.error("Invalid JSON in credentials"); setSubmitting(false); return; }
      const payload = { ...formData, credentials };
      if (selected) {
        await serversService.update(selected.id, payload);
        toast.success("Server updated");
      } else {
        await serversService.create(payload);
        toast.success("Server created");
      }
      setSheetOpen(false);
      fetchData();
    } catch { toast.error("Operation failed"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Servers" action={{ label: "Add Server", onClick: handleCreate }} />
      <DataTable columns={columns} data={data} loading={loading} keyExtractor={(s) => s.id} onEdit={handleEdit} onDelete={handleDelete} emptyMessage="No servers found" />

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title="Server" isEditing={!!selected} isSubmitting={submitting} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="Production Server 1" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hostname">Hostname</Label>
            <Input id="hostname" value={formData.hostname} onChange={(e) => setFormData((p) => ({ ...p, hostname: e.target.value }))} placeholder="srv1.hostito.com" className="font-mono" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ip">IP Address</Label>
              <Input id="ip" value={formData.ip} onChange={(e) => setFormData((p) => ({ ...p, ip: e.target.value }))} placeholder="1.2.3.4" className="font-mono" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input id="port" type="number" value={formData.port} onChange={(e) => setFormData((p) => ({ ...p, port: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provisioner</Label>
              <Select value={formData.provisionerId ? String(formData.provisionerId) : ""} onValueChange={(v) => v && setFormData((p) => ({ ...p, provisionerId: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{provisioners.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAccounts">Max Accounts</Label>
              <Input id="maxAccounts" type="number" min="0" value={formData.maxAccounts} onChange={(e) => setFormData((p) => ({ ...p, maxAccounts: Number(e.target.value) }))} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="credentials">Credentials (JSON)</Label>
            <textarea id="credentials" value={credentialsJson} onChange={(e) => setCredentialsJson(e.target.value)} rows={4} placeholder='{ "username": "root", "apiToken": "..." }' className="w-full rounded-md border bg-muted/30 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))} className="h-4 w-4 rounded border-gray-300" />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
