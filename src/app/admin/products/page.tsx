"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { FormSheet } from "@/components/admin/FormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { productsService } from "@/lib/api/products";
import { currenciesService } from "@/lib/api/currencies";
import { categoriesService } from "@/lib/api/categories";
import { serversService } from "@/lib/api/servers";
import { CreateProductDto, CreateVariantDto, Product, ProductsResponse, ProductType, VariantAction, ProductCycle } from "@/types/products";
import { Currency } from "@/types/currencies";
import { Category } from "@/types/categories";
import { Server } from "@/types/servers";
import { Trash2Icon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/use-currency";

const PRODUCT_TYPES: ProductType[] = ["SERVICE", "DOMAIN"];
const VARIANT_ACTIONS: VariantAction[] = ["RECURRING", "REGISTER", "RENEW", "TRANSFER", "SETUP"];
const VARIANT_CYCLES: ProductCycle[] = ["MONTHLY", "QUARTERLY", "SEMIANNUAL", "ANNUAL", "BIENNIAL", "TRIENNIAL", "ONETIME"];
const PricingCell = ({ product }: { product: Product }) => {
  const { formatPrice } = useCurrency();
  if (!product.variants?.length) return <span className="text-xs text-muted-foreground">No pricing</span>;
  const lowest = Math.min(...product.variants.map((v) => v.price));
  return <span className="font-mono text-sm font-bold">From {formatPrice(lowest)}</span>;
};

const columns: Column<Product>[] = [
  { key: "name", label: "Name", skeletonWidth: "w-40", render: (p) => <span className="font-medium text-primary">{p.name}</span> },
  { key: "type", label: "Type", skeletonWidth: "w-20", render: (p) => <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted border text-muted-foreground">{p.type}</span> },
  {
    key: "variants", label: "Pricing", skeletonWidth: "w-32", render: (p) => <PricingCell product={p} />,
  },
  { key: "variantCount", label: "Variants", skeletonWidth: "w-12", render: (p) => <span className="text-xs text-muted-foreground">{p.variants?.length ?? 0}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-16", render: (p) => <StatusBadge active={p.isActive} /> },
];

const emptyVariant: CreateVariantDto = { action: "RECURRING", cycle: "MONTHLY", price: 0 };

export default function ProductsPage() {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<CreateVariantDto[]>([{ ...emptyVariant }]);
  const limit = 10;

  const [formData, setFormData] = useState({
    name: "", description: "", currencyId: 1, categoryId: undefined as number | undefined,
    type: "SERVICE" as ProductType, isActive: true, serverId: undefined as number | undefined,
    tld: "", config: undefined as Record<string, any> | undefined,
  });

  const fetchData = async (p: number) => {
    setLoading(true);
    try {
      const [prod, curr, cat, srv] = await Promise.all([
        productsService.findAll(p, limit),
        currenciesService.findAll(1, 100),
        categoriesService.findAll(1, 100),
        serversService.findAll(),
      ]);
      setData(prod);
      setCurrencies(curr.data || []);
      setCategories(cat.data || []);
      setServers(Array.isArray(srv) ? srv : (srv as any).data || []);
    } catch { toast.error("Failed to fetch products"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(page); }, [page]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({ name: "", description: "", currencyId: currencies[0]?.id || 1, categoryId: undefined, type: "SERVICE", isActive: true, serverId: undefined, tld: "", config: undefined });
    setVariants([{ ...emptyVariant }]);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name, description: product.description || "",
      currencyId: product.currencyId, categoryId: product.categoryId,
      type: product.type, isActive: product.isActive,
      serverId: product.serverId, tld: product.tld || "", config: product.config,
    });
    setVariants(product.variants?.map((v) => ({ action: v.action, cycle: v.cycle, price: v.price })) || [{ ...emptyVariant }]);
    setIsSheetOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm("Are you sure?")) return;
    try { await productsService.remove(product.id); toast.success("Product deleted"); fetchData(page); }
    catch { toast.error("Failed to delete product"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: CreateProductDto = { ...formData, variants };
      if (editingProduct) {
        await productsService.update(editingProduct.id, payload);
        toast.success("Product updated");
      } else {
        await productsService.create(payload);
        toast.success("Product created");
      }
      setIsSheetOpen(false);
      fetchData(page);
    } catch (error: any) { toast.error(error.message || "Operation failed"); }
    finally { setIsSubmitting(false); }
  };

  const updateVariant = (idx: number, field: keyof CreateVariantDto, value: string | number) => {
    setVariants((prev) => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Products" action={{ label: "Add Product", onClick: handleOpenAdd }} />

      <DataTable columns={columns} data={data?.data || []} loading={loading} keyExtractor={(p) => p.id} onEdit={handleOpenEdit} onDelete={handleDelete} emptyMessage="No products found" pagination={data ? { page, total: data.total, limit, onPageChange: setPage } : undefined} />

      <FormSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} title="Product" isEditing={!!editingProduct} isSubmitting={isSubmitting} onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea id="description" value={formData.description || ""} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full rounded-md border bg-muted/30 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => v && setFormData((p) => ({ ...p, type: v as ProductType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRODUCT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={String(formData.currencyId)} onValueChange={(v) => v && setFormData((p) => ({ ...p, currencyId: Number(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{currencies.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.symbol})</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.categoryId ? String(formData.categoryId) : "none"} onValueChange={(v) => setFormData((p) => ({ ...p, categoryId: v === "none" ? undefined : Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent><SelectItem value="none">None</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Server</Label>
              <Select value={formData.serverId ? String(formData.serverId) : "none"} onValueChange={(v) => setFormData((p) => ({ ...p, serverId: v === "none" ? undefined : Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent><SelectItem value="none">None</SelectItem>{servers.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.hostname})</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {formData.type === "DOMAIN" && (
            <div className="space-y-2">
              <Label htmlFor="tld">TLD</Label>
              <Input id="tld" value={formData.tld || ""} onChange={(e) => setFormData((p) => ({ ...p, tld: e.target.value }))} placeholder=".com" />
              <p className="text-[10px] text-muted-foreground">e.g. .com, .net, .org, .io</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="config">Config (JSON)</Label>
            <textarea id="config" value={formData.config ? JSON.stringify(formData.config, null, 2) : ""} onChange={(e) => { try { setFormData((p) => ({ ...p, config: e.target.value ? JSON.parse(e.target.value) : undefined })); } catch { } }} rows={3} placeholder='{ "package": "starter" }' className="w-full rounded-md border bg-muted/30 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="isActive" checked={formData.isActive ?? true} onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4 rounded border-gray-300" />
            <Label htmlFor="isActive">Active</Label>
          </div>

          {/* Variants */}
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Pricing Variants</Label>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setVariants((p) => [...p, { ...emptyVariant }])}>
                <PlusIcon className="h-3 w-3" /> Add
              </Button>
            </div>
            {variants.map((v, idx) => (
              <div key={idx} className="flex items-end gap-2 bg-muted/20 rounded-lg p-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Action</Label>
                  <Select value={v.action} onValueChange={(val) => val && updateVariant(idx, "action", val)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{VARIANT_ACTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Cycle</Label>
                  <Select value={v.cycle} onValueChange={(val) => val && updateVariant(idx, "cycle", val)}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{VARIANT_CYCLES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Price</Label>
                  <Input type="number" step="0.01" min="0" value={v.price} onChange={(e) => updateVariant(idx, "price", Number(e.target.value))} className="h-8 text-xs font-mono" />
                </div>
                <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive shrink-0" disabled={variants.length <= 1} onClick={() => setVariants((p) => p.filter((_, i) => i !== idx))}>
                  <Trash2Icon className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
