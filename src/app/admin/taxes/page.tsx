"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormSheet } from "@/components/admin/FormSheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { taxesService } from "@/lib/api/taxes";
import { Tax } from "@/types/taxes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const columns: Column<Tax>[] = [
  { key: "name", label: "Name", skeletonWidth: "w-32", render: (t) => <span className="font-medium">{t.name}</span> },
  { key: "rate", label: "Rate", skeletonWidth: "w-24", render: (t) => <span className="text-muted-foreground">{t.rate}%</span> },
  { key: "status", label: "Status", skeletonWidth: "w-16", render: (t) => <StatusBadge active={t.isActive} /> },
  { key: "createdAt", label: "Created At", skeletonWidth: "w-32", render: (t) => <span className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleDateString()}</span> },
];

export default function TaxesPage() {
  const [data, setData] = useState<Tax[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    rate: 0,
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const taxes = await taxesService.findAll();
      setData(taxes.data);
    } catch (error) {
      toast.error("Failed to fetch taxes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => {
    setSelectedTax(null);
    setFormData({ name: "", rate: 0, isActive: true });
    setSheetOpen(true);
  };

  const handleEdit = (tax: Tax) => {
    setSelectedTax(tax);
    setFormData({ name: tax.name, rate: tax.rate, isActive: tax.isActive });
    setSheetOpen(true);
  };

  const handleDelete = async (tax: Tax) => {
    if (!window.confirm("Are you sure you want to delete this tax?")) return;
    try {
      await taxesService.remove(tax.id);
      toast.success("Tax deleted successfully");
      fetchData();
    } catch { toast.error("Failed to delete tax"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedTax) {
        await taxesService.update(selectedTax.id, formData);
        toast.success("Tax updated successfully");
      } else {
        await taxesService.create(formData);
        toast.success("Tax created successfully");
      }
      setSheetOpen(false);
      fetchData();
    } catch {
      toast.error(selectedTax ? "Failed to update tax" : "Failed to create tax");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Taxes Management" action={{ label: "Add Tax", onClick: handleCreate }} />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        keyExtractor={(t) => t.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No taxes found"
      />

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Tax"
        isEditing={!!selectedTax}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VAT, Sales Tax, etc."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Rate (%)</Label>
            <Input
              id="rate"
              type="number"
              step="0.01"
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div className="flex items-center space-x-3 pt-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: !!checked })}
            />
            <Label htmlFor="isActive" className="text-sm font-medium leading-none cursor-pointer">
              Active Status
            </Label>
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
