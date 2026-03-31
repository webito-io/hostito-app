"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormSheet } from "@/components/admin/FormSheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CountryDropdown, Country } from "@/components/ui/country-dropdown";
import { taxesService } from "@/lib/api/taxes";
import { Tax } from "@/types/taxes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const columns: Column<Tax>[] = [
  { key: "name", label: "Name", skeletonWidth: "w-32", render: (t) => <span className="font-medium">{t.name}</span> },
  { key: "rate", label: "Rate", skeletonWidth: "w-20", render: (t) => <span className="font-mono font-bold">{t.rate}%</span> },
  { key: "country", label: "Country", skeletonWidth: "w-16", render: (t) => <span className="text-xs text-muted-foreground">{t.country || "Global"}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-16", render: (t) => <StatusBadge active={t.isActive} /> },
];

export default function TaxesPage() {
  const [data, setData] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Tax | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", rate: 0, country: "", isActive: true });

  const fetchData = async () => {
    setLoading(true);
    try { setData((await taxesService.findAll()).data); }
    catch { toast.error("Failed to fetch taxes"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => { setSelected(null); setFormData({ name: "", rate: 0, country: "", isActive: true }); setSheetOpen(true); };
  const handleEdit = (tax: Tax) => { setSelected(tax); setFormData({ name: tax.name, rate: tax.rate, country: tax.country || "", isActive: tax.isActive }); setSheetOpen(true); };
  const handleDelete = async (tax: Tax) => {
    if (!window.confirm("Delete this tax?")) return;
    try { await taxesService.remove(tax.id); toast.success("Tax deleted"); fetchData(); }
    catch { toast.error("Failed to delete"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { name: formData.name, rate: formData.rate, country: formData.country || undefined, isActive: formData.isActive };
    try {
      if (selected) { await taxesService.update(selected.id, payload); toast.success("Tax updated"); }
      else { await taxesService.create(payload); toast.success("Tax created"); }
      setSheetOpen(false); fetchData();
    } catch { toast.error("Operation failed"); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Taxes" action={{ label: "Add Tax", onClick: handleCreate }} />
      <DataTable columns={columns} data={data} loading={loading} keyExtractor={(t) => t.id} onEdit={handleEdit} onDelete={handleDelete} emptyMessage="No taxes found" />

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title="Tax" isEditing={!!selected} isSubmitting={submitting} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} placeholder="VAT, Sales Tax..." required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Rate (%)</Label>
            <Input id="rate" type="number" step="0.01" min="0" value={formData.rate} onChange={(e) => setFormData((p) => ({ ...p, rate: Number(e.target.value) }))} required />
          </div>
          <div className="space-y-2">
            <Label>Country <span className="text-muted-foreground text-xs">(empty = global)</span></Label>
            <CountryDropdown defaultValue={formData.country} onChange={(c: Country) => setFormData((p) => ({ ...p, country: c.alpha2 }))} placeholder="Global (all countries)" />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))} className="h-4 w-4 rounded border-gray-300" />
            <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
