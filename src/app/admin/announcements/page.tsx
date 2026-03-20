"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormSheet } from "@/components/admin/FormSheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { announcementsService } from "@/lib/api/announcements";
import { Announcement } from "@/types/announcements";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const columns: Column<Announcement>[] = [
  { key: "title", label: "Title", skeletonWidth: "w-64", render: (a) => <span className="font-medium text-primary">{a.title}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-16", render: (a) => <StatusBadge active={a.isActive} /> },
  { key: "createdAt", label: "Date", skeletonWidth: "w-32", render: (a) => <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</span> },
];

export default function AnnouncementsPage() {
  const [data, setData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    isActive: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const announcements = await announcementsService.findAll();
      setData(announcements);
    } catch (error) {
      toast.error("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => {
    setSelectedAnnouncement(null);
    setFormData({ title: "", content: "", isActive: true });
    setSheetOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      isActive: announcement.isActive,
    });
    setSheetOpen(true);
  };

  const handleDelete = async (announcement: Announcement) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await announcementsService.remove(announcement.id);
      toast.success("Announcement deleted successfully");
      fetchData();
    } catch { toast.error("Failed to delete announcement"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedAnnouncement) {
        await announcementsService.update(selectedAnnouncement.id, formData);
        toast.success("Announcement updated successfully");
      } else {
        await announcementsService.create(formData);
        toast.success("Announcement created successfully");
      }
      setSheetOpen(false);
      fetchData();
    } catch {
      toast.error(selectedAnnouncement ? "Failed to update" : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Announcements" action={{ label: "Add Announcement", onClick: handleCreate }} />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        keyExtractor={(a) => a.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No announcements found"
      />

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Announcement"
        isEditing={!!selectedAnnouncement}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. System Maintenance"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Announce maintenance, new features, etc."
              required
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
