"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormSheet } from "@/components/admin/FormSheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { emailTemplatesService } from "@/lib/api/email-templates";
import { NotificationTemplate } from "@/types/notification-templates";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const columns: Column<NotificationTemplate>[] = [
  { key: "name", label: "Template Name", skeletonWidth: "w-40", render: (t) => <span className="font-medium text-primary">{t.name}</span> },
  { key: "subject", label: "Subject", skeletonWidth: "w-64", render: (t) => <span className="truncate max-w-[200px] inline-block">{t.subject}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-16", render: (t) => <StatusBadge active={t.isActive} /> },
  { key: "updatedAt", label: "Last Updated", skeletonWidth: "w-32", render: (t) => <span className="text-xs text-muted-foreground">{new Date(t.updatedAt).toLocaleDateString()}</span> },
];

export default function EmailTemplatesPage() {
  const [data, setData] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    body: "",
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const templates = await emailTemplatesService.findAll();
      setData(templates.data);
    } catch (error) {
      toast.error("Failed to fetch notification templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => {
    setSelectedTemplate(null);
    setFormData({ name: "", subject: "", body: "", isActive: true });
    setSheetOpen(true);
  };

  const handleEdit = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      isActive: template.isActive,
    });
    setSheetOpen(true);
  };

  const handleDelete = async (template: NotificationTemplate) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await emailTemplatesService.remove(template.id);
      toast.success("Template deleted successfully");
      fetchData();
    } catch { toast.error("Failed to delete template"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedTemplate) {
        await emailTemplatesService.update(selectedTemplate.id, formData);
        toast.success("Template updated successfully");
      } else {
        await emailTemplatesService.create(formData);
        toast.success("Template created successfully");
      }
      setSheetOpen(false);
      fetchData();
    } catch {
      toast.error(selectedTemplate ? "Failed to update template" : "Failed to create template");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Notification Templates" action={{ label: "Add Template", onClick: handleCreate }} />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        keyExtractor={(t) => t.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No templates found"
      />

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Notification Template"
        isEditing={!!selectedTemplate}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name (e.g. invoice_paid)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="invoice_paid"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Your Invoice {{id}} has been paid"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Body (Handlebars Supported)</Label>
            <textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Dear {{user.firstName}}, your invoice was paid..."
              required
            />
            <p className="text-[10px] text-muted-foreground opacity-70">
              Use {"{{variable}}"} syntax for dynamic fields.
            </p>
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
