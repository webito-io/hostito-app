"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { FormSheet } from "@/components/admin/FormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { productsService } from "@/lib/api/products";
import { currenciesService } from "@/lib/api/currencies";
import { CreateProductDto, Product, ProductsResponse, ProductType, ProductCycle } from "@/types/products";
import { Currency } from "@/types/currencies";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PRODUCT_TYPES: ProductType[] = ["HOSTING", "VPS", "DOMAIN", "LICENSE", "OTHER"];
const PRODUCT_CYCLES: ProductCycle[] = ["MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL", "BIENNIAL", "TRIENNIAL", "ONETIME"];

const defaultForm: CreateProductDto = {
  name: "",
  description: "",
  price: 0,
  currencyId: 1,
  type: "HOSTING",
  cycle: "MONTHLY",
  isActive: true,
  module: "",
};

const columns = (onEdit: (p: Product) => void, onDelete: (p: Product) => void): Column<Product>[] => [
  { key: "name", label: "Name", skeletonWidth: "w-40", render: (p) => <span className="font-medium">{p.name}</span> },
  { key: "type", label: "Type", skeletonWidth: "w-20", render: (p) => <span className="text-muted-foreground">{p.type}</span> },
  { key: "cycle", label: "Cycle", skeletonWidth: "w-24", render: (p) => <span className="text-muted-foreground">{p.cycle}</span> },
  { key: "price", label: "Price", skeletonWidth: "w-16", render: (p) => <span className="text-muted-foreground">{p.price} {p.currency.symbol}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-16", render: (p) => <StatusBadge active={p.isActive} /> },
];

export default function ProductsPage() {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductDto>({ ...defaultForm });

  const limit = 10;

  const fetchData = async (p: number) => {
    setLoading(true);
    try {
      const [productsData, currenciesData] = await Promise.all([
        productsService.findAll(p, limit),
        currenciesService.findAll(1, 25),
      ]);
      setData(productsData);
      setCurrencies(currenciesData.data || []);
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({ ...defaultForm });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      currencyId: product.currencyId,
      type: product.type,
      cycle: product.cycle,
      isActive: product.isActive,
      module: product.module || "",
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await productsService.remove(product.id);
      toast.success("Product deleted successfully");
      fetchData(page);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await productsService.update(editingProduct.id, formData);
        toast.success("Product updated successfully");
      } else {
        await productsService.create(formData);
        toast.success("Product created successfully");
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
      <PageHeader title="Products Management" action={{ label: "Add New Product", onClick: handleOpenAdd }} />

      <FormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title="Product"
        description="Configure your service or product details."
        isEditing={!!editingProduct}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        <Field>
          <FieldLabel>Name</FieldLabel>
          <Input name="name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Product name" required className="bg-muted/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary" />
        </Field>
        <Field>
          <FieldLabel>Description</FieldLabel>
          <textarea name="description" value={formData.description || ""} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" rows={3} className="w-full rounded-md bg-muted/50 border-none shadow-none px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Price</FieldLabel>
            <Input name="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData(p => ({ ...p, price: Number(e.target.value) }))} required className="bg-muted/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary" />
          </Field>
          <Field>
            <FieldLabel>Currency</FieldLabel>
            <select name="currencyId" value={formData.currencyId} onChange={(e) => setFormData(p => ({ ...p, currencyId: Number(e.target.value) }))} className="w-full h-9 rounded-md bg-muted/50 border-none shadow-none px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
              {currencies.map(c => <option key={c.id} value={c.id}>{c.symbol} {c.code} - {c.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Type</FieldLabel>
            <select name="type" value={formData.type} onChange={(e) => setFormData(p => ({ ...p, type: e.target.value as ProductType }))} className="w-full h-9 rounded-md bg-muted/50 border-none shadow-none px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
              {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field>
            <FieldLabel>Billing Cycle</FieldLabel>
            <select name="cycle" value={formData.cycle} onChange={(e) => setFormData(p => ({ ...p, cycle: e.target.value as ProductCycle }))} className="w-full h-9 rounded-md bg-muted/50 border-none shadow-none px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
              {PRODUCT_CYCLES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <Field>
          <FieldLabel>Module</FieldLabel>
          <Input name="module" value={formData.module || ""} onChange={(e) => setFormData(p => ({ ...p, module: e.target.value }))} placeholder="cpanel, directadmin, vps..." className="bg-muted/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary" />
        </Field>
        <label className="flex items-center gap-3 p-2 cursor-pointer">
          <input type="checkbox" checked={formData.isActive ?? true} onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary shadow-none" />
          <span className="text-sm font-medium">Active</span>
        </label>
      </FormSheet>

      <DataTable
        columns={columns(handleOpenEdit, handleDelete)}
        data={data?.data || []}
        loading={loading}
        keyExtractor={(p) => p.id}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        emptyMessage="No products found"
        pagination={data ? { page, total: data.total, limit, onPageChange: setPage } : undefined}
      />
    </div>
  );
}
