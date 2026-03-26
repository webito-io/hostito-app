"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormSheet } from "@/components/admin/FormSheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { categoriesService } from "@/lib/api/categories";
import { Category, CategoriesResponse } from "@/types/categories";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const columns: Column<Category>[] = [
  { key: "name", label: "Category Name", skeletonWidth: "w-48", render: (c) => <span className="font-medium text-primary">{c.name}</span> },
  { key: "slug", label: "Slug", skeletonWidth: "w-32", render: (c) => <span className="font-mono text-xs text-muted-foreground">{c.slug}</span> },
  { key: "parentId", label: "Parent", skeletonWidth: "w-24", render: (c) => <span className="text-muted-foreground">{c.parentId ? `ID #${c.parentId}` : "None (Root)"}</span> },
  { key: "isActive", label: "Status", skeletonWidth: "w-16", render: (c) => <StatusBadge active={c.isActive} /> },
];

export default function CategoriesPage() {
  const [data, setData] = useState<CategoriesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 15;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: undefined as number | undefined,
    isActive: true,
  });

  const fetchData = async (p: number) => {
    setLoading(true);
    try {
      const result = await categoriesService.findAll(p, limit);
      setData(result);
    } catch (error) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page); }, [page]);

  const handleCreate = () => {
    setSelectedCategory(null);
    setFormData({ name: "", slug: "", description: "", parentId: undefined, isActive: true });
    setSheetOpen(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parentId: category.parentId || undefined,
      isActive: category.isActive,
    });
    setSheetOpen(true);
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await categoriesService.remove(category.id);
      toast.success("Category deleted");
      fetchData(page);
    } catch { toast.error("Failed to delete category"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedCategory) {
        await categoriesService.update(selectedCategory.id, formData);
        toast.success("Category updated");
      } else {
        await categoriesService.create(formData as any);
        toast.success("Category created");
      }
      setSheetOpen(false);
      fetchData(page);
    } catch {
      toast.error(selectedCategory ? "Failed to update" : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Product Categories" action={{ label: "Add Category", onClick: handleCreate }} />
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={loading}
        keyExtractor={(c) => c.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No categories found"
        pagination={data ? { page, total: data.total, limit, onPageChange: setPage } : undefined}
      />

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Category"
        isEditing={!!selectedCategory}
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
              placeholder="e.g. Shared Hosting"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g. shared-hosting"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parentId">Parent Category ID (Optional)</Label>
            <Input
              id="parentId"
              type="number"
              value={formData.parentId || ""}
              onChange={(e) => setFormData({ ...formData, parentId: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="Leave empty for root"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Category description..."
              className="resize-none"
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
