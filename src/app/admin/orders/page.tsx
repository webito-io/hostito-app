"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormSheet } from "@/components/admin/FormSheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ordersService } from "@/lib/api/orders";
import { Order, OrderStatus } from "@/types/orders";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const columns: Column<Order>[] = [
  { key: "id", label: "Order ID", skeletonWidth: "w-16", render: (o) => <span className="font-mono text-muted-foreground">#{o.id}</span> },
  { key: "organization", label: "Org ID", skeletonWidth: "w-24", render: (o) => <span className="text-muted-foreground">{o.organizationId}</span> },
  { key: "total", label: "Total", skeletonWidth: "w-24", render: (o) => <span className="font-bold text-primary">${o.total.toFixed(2)}</span> },
  { key: "subtotal", label: "Subtotal", skeletonWidth: "w-24", render: (o) => <span className="text-xs text-muted-foreground">${o.subtotal.toFixed(2)}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-16", render: (o) => <StatusBadge active={o.status === "ACTIVE"} activeLabel={o.status} inactiveLabel={o.status} /> },
  { key: "createdAt", label: "Date", skeletonWidth: "w-32", render: (o) => <span className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</span> },
];

export default function OrdersPage() {
  const [data, setData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    status: "PENDING" as OrderStatus,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const orders = await ordersService.findAll();
      setData(orders);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setFormData({ status: order.status });
    setSheetOpen(true);
  };

  const handleView = (order: Order) => {
    router.push(`/admin/orders/${order.id}`);
  };

  const handleDelete = async (order: Order) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await ordersService.remove(order.id);
      toast.success("Order deleted successfully");
      fetchData();
    } catch { toast.error("Failed to delete order"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSubmitting(true);
    try {
      await ordersService.update(selectedOrder.id, formData);
      toast.success("Order status updated");
      setSheetOpen(false);
      fetchData();
    } catch {
      toast.error("Failed to update order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Orders Management" />
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        keyExtractor={(o) => o.id}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No orders found"
      />

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Order"
        isEditing={true}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-mono font-medium">#{selectedOrder?.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-primary">${selectedOrder?.total.toFixed(2)}</span>
              </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(val) => setFormData({ ...formData, status: val as OrderStatus })}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="FRAUD">Fraud</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
