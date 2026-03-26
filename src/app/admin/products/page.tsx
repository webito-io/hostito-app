"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { FormSheet } from "@/components/admin/FormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { productsService } from "@/lib/api/products";
import { currenciesService } from "@/lib/api/currencies";
import { categoriesService } from "@/lib/api/categories";
import { CreateProductDto, Product, ProductsResponse, ProductType, ProductCycle } from "@/types/products";
import { Currency } from "@/types/currencies";
import { Category } from "@/types/categories";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const PRODUCT_TYPES: ProductType[] = ["HOSTING", "VPS", "DOMAIN", "LICENSE", "OTHER"];
const PRODUCT_CYCLES: ProductCycle[] = ["MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL", "BIENNIAL", "TRIENNIAL", "ONETIME"];

const columns = (onEdit: (p: Product) => void, onDelete: (p: Product) => void): Column<Product>[] => [
  { key: "name", label: "Name", skeletonWidth: "w-40", render: (p) => <span className="font-medium text-primary">{p.name}</span> },
  { key: "type", label: "Type", skeletonWidth: "w-20", render: (p) => <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted border text-muted-foreground">{p.type}</span> },
  { key: "cycle", label: "Cycle", skeletonWidth: "w-24", render: (p) => <span className="text-muted-foreground">{p.cycle}</span> },
  { key: "price", label: "Price", skeletonWidth: "w-16", render: (p) => <span className="font-mono text-sm font-bold">{p.price} {p.currency.symbol}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-16", render: (p) => <StatusBadge active={p.isActive} /> },
];

export default function ProductsPage() {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState<CreateProductDto>({
    name: "",
    description: "",
    price: 0,
    currencyId: 1,
    categoryId: undefined,
    type: "HOSTING",
    cycle: "MONTHLY",
    isActive: true,
    module: "",
  });

  const limit = 10;

  const fetchData = async (p: number) => {
    setLoading(true);
    try {
      const [productsData, currenciesData, categoriesData] = await Promise.all([
        productsService.findAll(p, limit),
        currenciesService.findAll(1, 100),
        categoriesService.findAll(1, 100),
      ]);
      setData(productsData);
      setCurrencies(currenciesData.data || []);
      setCategories(categoriesData.data || []);
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
    setFormData({
      name: "",
      description: "",
      price: 0,
      currencyId: currencies[0]?.id || 1,
      categoryId: undefined,
      type: "HOSTING",
      cycle: "MONTHLY",
      isActive: true,
      module: "",
    });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      currencyId: product.currencyId,
      categoryId: product.categoryId,
      type: product.type,
      cycle: product.cycle,
      isActive: product.isActive,
      module: product.module || "",
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm("Are you sure?")) return;
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
      <PageHeader title="Products" action={{ label: "Add Product", onClick: handleOpenAdd }} />

      <FormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title="Product"
        isEditing={!!editingProduct}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Shared Hosting Gold" required />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category">Category</Label>
            </div>
            <Select
              value={formData.categoryId ? String(formData.categoryId) : "none"}
              onValueChange={(val) => setFormData(p => ({ ...p, categoryId: val === "none" ? undefined : Number(val) }))}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" value={formData.description || ""} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Brief product description..." rows={3} className="w-full rounded-md border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => setFormData(p => ({ ...p, price: Number(e.target.value) }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={String(formData.currencyId)}
                onValueChange={(val) => setFormData(p => ({ ...p, currencyId: Number(val) }))}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.code} ({c.symbol})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(val) => setFormData(p => ({ ...p, type: val as ProductType }))}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cycle">Cycle</Label>
              <Select value={formData.cycle} onValueChange={(val) => setFormData(p => ({ ...p, cycle: val as ProductCycle }))}>
                <SelectTrigger id="cycle">
                  <SelectValue placeholder="Cycle" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CYCLES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="module">module</Label>
            <Input id="module" value={formData.module || ""} onChange={(e) => setFormData(p => ({ ...p, module: e.target.value }))} placeholder="cpanel, directadmin, etc." />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input type="checkbox" id="isActive" checked={formData.isActive ?? true} onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <Label htmlFor="isActive" className="text-sm font-medium">Active Status</Label>
          </div>
        </div>
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
