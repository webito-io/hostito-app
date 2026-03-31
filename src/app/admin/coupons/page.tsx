"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormSheet } from "@/components/admin/FormSheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { couponsService } from "@/lib/api/coupons";
import { currenciesService } from "@/lib/api/currencies";
import { Coupon, CouponType } from "@/types/coupons";
import { Currency } from "@/types/currencies";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const columns: Column<Coupon>[] = [
  { key: "code", label: "Code", skeletonWidth: "w-32", render: (c) => <span className="font-mono font-bold text-primary">{c.code}</span> },
  { key: "type", label: "Type", skeletonWidth: "w-24", render: (c) => <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted border text-muted-foreground">{c.type}</span> },
  { key: "value", label: "Value", skeletonWidth: "w-20", render: (c) => <span className="font-mono font-bold">{c.type === "PERCENTAGE" ? `${c.value}%` : `$${c.value}`}</span> },
  { key: "maxUses", label: "Max Uses", skeletonWidth: "w-16", render: (c) => <span className="text-muted-foreground">{c.maxUses || "∞"}</span> },
  { key: "expiresAt", label: "Expires", skeletonWidth: "w-28", render: (c) => <span className="text-xs text-muted-foreground">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-16", render: (c) => <StatusBadge active={c.isActive} /> },
];

export default function CouponsPage() {
  const [data, setData] = useState<Coupon[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE" as CouponType,
    value: 0,
    currencyId: undefined as number | undefined,
    maxUses: 0,
    expiresAt: "",
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [coupons, curr] = await Promise.all([
        couponsService.findAll(),
        currenciesService.findAll(1, 100),
      ]);
      setData(coupons.data);
      setCurrencies(curr.data || []);
    } catch {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => {
    setSelected(null);
    setFormData({ code: "", type: "PERCENTAGE", value: 0, currencyId: undefined, maxUses: 0, expiresAt: "", isActive: true });
    setSheetOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setSelected(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      currencyId: coupon.currencyId,
      maxUses: coupon.maxUses || 0,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
      isActive: coupon.isActive,
    });
    setSheetOpen(true);
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!window.confirm("Delete this coupon?")) return;
    try { await couponsService.remove(coupon.id); toast.success("Coupon deleted"); fetchData(); }
    catch { toast.error("Failed to delete coupon"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      code: formData.code,
      type: formData.type,
      value: formData.value,
      currencyId: formData.type === "FIXED" ? formData.currencyId : undefined,
      maxUses: formData.maxUses > 0 ? formData.maxUses : undefined,
      expiresAt: formData.expiresAt || undefined,
      isActive: formData.isActive,
    };
    try {
      if (selected) {
        await couponsService.update(selected.id, payload);
        toast.success("Coupon updated");
      } else {
        await couponsService.create(payload);
        toast.success("Coupon created");
      }
      setSheetOpen(false);
      fetchData();
    } catch {
      toast.error(selected ? "Failed to update" : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Coupons" action={{ label: "Add Coupon", onClick: handleCreate }} />
      <DataTable columns={columns} data={data} loading={loading} keyExtractor={(c) => c.id} onEdit={handleEdit} onDelete={handleDelete} emptyMessage="No coupons found" />

      <FormSheet open={sheetOpen} onOpenChange={setSheetOpen} title="Coupon" isEditing={!!selected} isSubmitting={submitting} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" value={formData.code} onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" className="font-mono" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => v && setFormData((p) => ({ ...p, type: v as CouponType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                  <SelectItem value="FIXED">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value {formData.type === "PERCENTAGE" ? "(%)" : ""}</Label>
              <Input id="value" type="number" step="0.01" min="0" value={formData.value} onChange={(e) => setFormData((p) => ({ ...p, value: Number(e.target.value) }))} required />
            </div>
          </div>
          {formData.type === "FIXED" && (
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={formData.currencyId ? String(formData.currencyId) : "none"} onValueChange={(v) => setFormData((p) => ({ ...p, currencyId: v === "none" ? undefined : Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {currencies.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.symbol})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUses">Max Uses <span className="text-muted-foreground text-xs">(0 = unlimited)</span></Label>
              <Input id="maxUses" type="number" min="0" value={formData.maxUses} onChange={(e) => setFormData((p) => ({ ...p, maxUses: Number(e.target.value) }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expires At</Label>
              <Input id="expiresAt" type="date" value={formData.expiresAt} onChange={(e) => setFormData((p) => ({ ...p, expiresAt: e.target.value }))} />
            </div>
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
