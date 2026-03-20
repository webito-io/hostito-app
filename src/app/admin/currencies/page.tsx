"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { FormSheet } from "@/components/admin/FormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { currenciesService } from "@/lib/api/currencies";
import { CreateCurrencyDto, Currency, CurrenciesResponse } from "@/types/currencies";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const columns = (onEdit: (c: Currency) => void, onDelete: (c: Currency) => void): Column<Currency>[] => [
  { key: "code", label: "Code", skeletonWidth: "w-16", render: (c) => <span className="font-medium">{c.code}</span> },
  { key: "name", label: "Name", skeletonWidth: "w-32", render: (c) => <span className="text-muted-foreground">{c.name}</span> },
  { key: "symbol", label: "Symbol", skeletonWidth: "w-8", render: (c) => <span className="text-muted-foreground">{c.symbol}</span> },
  { key: "rate", label: "Rate", skeletonWidth: "w-16", render: (c) => <span className="text-muted-foreground">{c.rate}</span> },
  { 
    key: "status", 
    label: "Status", 
    skeletonWidth: "w-16", 
    render: (c) => (
      <div className="flex gap-2">
        {c.isDefault && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
            Default
          </span>
        )}
        <StatusBadge active={!!c.isActive} />
      </div>
    ) 
  },
];

const defaultForm: CreateCurrencyDto = {
  code: "",
  name: "",
  symbol: "",
  rate: 1,
  isDefault: false,
  isActive: true,
};

export default function CurrenciesPage() {
  const [data, setData] = useState<CurrenciesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState<CreateCurrencyDto>({ ...defaultForm });

  const limit = 10;

  const fetchData = async (p: number) => {
    setLoading(true);
    try {
      const result = await currenciesService.findAll(p, limit);
      setData(result);
    } catch (error) {
      toast.error("Failed to fetch currencies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleOpenAdd = () => {
    setEditingCurrency(null);
    setFormData({ ...defaultForm });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (currency: Currency) => {
    setEditingCurrency(currency);
    setFormData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      rate: currency.rate,
      isDefault: currency.isDefault ?? false,
      isActive: currency.isActive ?? true,
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (currency: Currency) => {
    if (!window.confirm("Are you sure you want to delete this currency?")) return;
    try {
      await currenciesService.remove(currency.id);
      toast.success("Currency deleted successfully");
      fetchData(page);
    } catch (error) {
      toast.error("Failed to delete currency");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCurrency) {
        await currenciesService.update(editingCurrency.id, formData);
        toast.success("Currency updated successfully");
      } else {
        await currenciesService.create(formData);
        toast.success("Currency created successfully");
      }
      setIsSheetOpen(false);
      fetchData(page);
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Currencies Management" action={{ label: "Add New Currency", onClick: handleOpenAdd }} />

      <FormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title="Currency"
        description="Configure currency details and exchange rates."
        isEditing={!!editingCurrency}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Code</FieldLabel>
            <Input name="code" value={formData.code} onChange={handleInputChange} placeholder="USD" required className="bg-muted/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary" />
          </Field>
          <Field>
            <FieldLabel>Symbol</FieldLabel>
            <Input name="symbol" value={formData.symbol} onChange={handleInputChange} placeholder="$" required className="bg-muted/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary" />
          </Field>
        </div>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="US Dollar" required className="bg-muted/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary" />
        </Field>
        <Field>
          <FieldLabel>Exchange Rate</FieldLabel>
          <Input name="rate" type="number" step="0.0001" value={formData.rate} onChange={handleInputChange} required className="bg-muted/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary" />
        </Field>
        <div className="flex gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={formData.isDefault ?? false} onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary shadow-none" />
            <span className="text-sm font-medium">Default</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={formData.isActive ?? true} onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary shadow-none" />
            <span className="text-sm font-medium">Active</span>
          </label>
        </div>
      </FormSheet>

      <DataTable
        columns={columns(handleOpenEdit, handleDelete)}
        data={data?.data || []}
        loading={loading}
        keyExtractor={(c) => c.id}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        emptyMessage="No currencies found"
        pagination={data ? { page, total: data.total, limit, onPageChange: setPage } : undefined}
      />
    </div>
  );
}
