"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormSheet } from "@/components/admin/FormSheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { couponsService } from "@/lib/api/coupons";
import { Coupon, CouponType } from "@/types/coupons";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const columns: Column<Coupon>[] = [
  { key: "code", label: "Code", skeletonWidth: "w-32", render: (c) => <span className="font-mono font-bold text-primary">{c.code}</span> },
  { key: "type", label: "Type", skeletonWidth: "w-24", render: (c) => <span className="text-muted-foreground">{c.type}</span> },
  { key: "value", label: "Value", skeletonWidth: "w-24", render: (c) => <span className="text-muted-foreground">{c.value}{c.type === "PERCENTAGE" ? "%" : ""}</span> },
  { key: "maxUses", label: "Max Uses", skeletonWidth: "w-16", render: (c) => <span className="text-muted-foreground">{c.maxUses || "Unlimited"}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-16", render: (c) => <StatusBadge active={c.isActive} /> },
  { key: "createdAt", label: "Created", skeletonWidth: "w-32", render: (c) => <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span> },
];

export default function CouponsPage() {
  const [data, setData] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE" as CouponType,
    value: 0,
    isActive: true,
    maxUses: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const coupons = await couponsService.findAll();
      setData(coupons);
    } catch (error) {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => {
    setSelectedCoupon(null);
    setFormData({ code: "", type: "PERCENTAGE", value: 0, isActive: true, maxUses: 0 });
    setSheetOpen(true);
  };

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      isActive: coupon.isActive,
      maxUses: coupon.maxUses || 0,
    });
    setSheetOpen(true);
  };

  const handleDelete = async (coupon: Coupon) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await couponsService.remove(coupon.id);
      toast.success("Coupon deleted successfully");
      fetchData();
    } catch { toast.error("Failed to delete coupon"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...formData,
      maxUses: formData.maxUses > 0 ? formData.maxUses : undefined,
    };
    try {
      if (selectedCoupon) {
        await couponsService.update(selectedCoupon.id, payload);
        toast.success("Coupon updated successfully");
      } else {
        await couponsService.create(payload);
        toast.success("Coupon created successfully");
      }
      setSheetOpen(false);
      fetchData();
    } catch {
      toast.error(selectedCoupon ? "Failed to update coupon" : "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Coupons Management" onAdd={handleCreate} addLabel="Add Coupon" />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        keyExtractor={(c) => c.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No coupons found"
      />

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Coupon"
        isEditing={!!selectedCoupon}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. SUMMER20"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CouponType })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED">Fixed Amount</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Value ({formData.type === "PERCENTAGE" ? "%" : "Amount"})</Label>
            <Input
              id="value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxUses">Max Uses (0 for unlimited)</Label>
            <Input
              id="maxUses"
              type="number"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) })}
            />
          </div>
          <div className="flex items-center space-x-2 pt-2 cursor-pointer">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-input bg-background"
            />
            <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
