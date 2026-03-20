"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormSheet } from "@/components/admin/FormSheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { domainsService } from "@/lib/api/domains";
import { Domain } from "@/types/domains";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const columns: Column<Domain>[] = [
  { key: "name", label: "Domain Name", skeletonWidth: "w-48", render: (d) => <span className="font-medium text-primary">{d.name}</span> },
  { key: "registrar", label: "Registrar", skeletonWidth: "w-24", render: (d) => <span className="text-muted-foreground">{d.registrar || "N/A"}</span> },
  { key: "expiry", label: "Expiry Date", skeletonWidth: "w-32", render: (d) => <span className="text-xs text-muted-foreground">{d.expiryDate ? new Date(d.expiryDate).toLocaleDateString() : "N/A"}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-16", render: (d) => <StatusBadge active={d.status?.toLowerCase() === "active"} activeLabel={d.status} inactiveLabel={d.status} /> },
];

export default function DomainsPage() {
  const [data, setData] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    status: "ACTIVE",
    registrar: "",
    organizationId: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const domains = await domainsService.findAll();
      setData(domains);
    } catch (error) {
      toast.error("Failed to fetch domains");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => {
    setSelectedDomain(null);
    setFormData({ name: "", status: "ACTIVE", registrar: "", organizationId: 1 });
    setSheetOpen(true);
  };

  const handleEdit = (domain: Domain) => {
    setSelectedDomain(domain);
    setFormData({
      name: domain.name,
      status: domain.status,
      registrar: domain.registrar || "",
      organizationId: domain.organizationId,
    });
    setSheetOpen(true);
  };

  const handleDelete = async (domain: Domain) => {
    if (!window.confirm("Are you sure you want to delete this domain?")) return;
    try {
      await domainsService.remove(domain.id);
      toast.success("Domain deleted successfully");
      fetchData();
    } catch { toast.error("Failed to delete domain"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedDomain) {
        await domainsService.update(selectedDomain.id, formData);
        toast.success("Domain updated successfully");
      } else {
        await domainsService.create(formData);
        toast.success("Domain created successfully");
      }
      setSheetOpen(false);
      fetchData();
    } catch {
      toast.error(selectedDomain ? "Failed to update" : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Domains Management" action={{ label: "Add Domain", onClick: handleCreate }} />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        keyExtractor={(d) => d.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No domains found"
      />

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Domain"
        isEditing={!!selectedDomain}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Domain Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrar">Registrar</Label>
            <Input
              id="registrar"
              value={formData.registrar}
              onChange={(e) => setFormData({ ...formData, registrar: e.target.value })}
              placeholder="e.g. GoDaddy, Namecheap"
            />
          </div>
          {!selectedDomain && (
            <div className="space-y-2">
              <Label htmlFor="organizationId">Organization ID</Label>
              <Input
                id="organizationId"
                type="number"
                value={formData.organizationId}
                onChange={(e) => setFormData({ ...formData, organizationId: parseInt(e.target.value) })}
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              required
            >
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
