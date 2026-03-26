"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormSheet } from "@/components/admin/FormSheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { servicesService } from "@/lib/api/services";
import { Service, ServiceStatus } from "@/types/services";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const columns: Column<Service>[] = [
  { key: "id", label: "ID", skeletonWidth: "w-12", render: (s) => <span className="font-mono text-muted-foreground">#{s.id}</span> },
  { key: "productId", label: "Product ID", skeletonWidth: "w-24", render: (s) => <span className="font-medium">Prod: {s.productId}</span> },
  { key: "username", label: "Username", skeletonWidth: "w-32", render: (s) => <span>{s.username || "N/A"}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-24", render: (s) => <StatusBadge active={s.status === "ACTIVE"} activeLabel={s.status} inactiveLabel={s.status} /> },
  { key: "nextDueDate", label: "Next Due Date", skeletonWidth: "w-32", render: (s) => <span className="text-xs text-muted-foreground">{s.nextDueDate ? new Date(s.nextDueDate as string).toLocaleDateString() : "N/A"}</span> },
];

export default function ServicesPage() {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    status: "PENDING" as ServiceStatus,
    username: "",
    password: "",
    productId: 0,
    orderId: 0,
    organizationId: 0,
    serverId: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const services = await servicesService.findAll();
      setData(services);
    } catch (error) {
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => {
    setSelectedService(null);
    setFormData({
      status: "PENDING",
      username: "",
      password: "",
      productId: 0,
      orderId: 0,
      organizationId: 1,
      serverId: 0,
    });
    setSheetOpen(true);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setFormData({
      status: service.status,
      username: service.username || "",
      password: service.password || "",
      productId: service.productId,
      orderId: service.orderId,
      organizationId: service.organizationId,
      serverId: service.serverId || 0,
    });
    setSheetOpen(true);
  };

  const handleDelete = async (service: Service) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await servicesService.remove(service.id);
      toast.success("Service deleted successfully");
      fetchData();
    } catch { toast.error("Failed to delete service"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedService) {
        await servicesService.update(selectedService.id, formData);
        toast.success("Service updated successfully");
      } else {
        await servicesService.create(formData);
        toast.success("Service created successfully");
      }
      setSheetOpen(false);
      fetchData();
    } catch {
      toast.error(selectedService ? "Failed to update" : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Services Management" action={{ label: "Add Service", onClick: handleCreate }} />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        keyExtractor={(s) => s.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No services found"
      />

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Service"
        isEditing={!!selectedService}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productId">Product ID</Label>
              <Input
                id="productId"
                type="number"
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                type="number"
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Username"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData({ ...formData, status: val as ServiceStatus })}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
