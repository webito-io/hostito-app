"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { usersService } from "@/lib/api/users";
import { User, UsersResponse } from "@/types/users";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const columns: Column<User>[] = [
  { key: "name", label: "Name", skeletonWidth: "w-32", render: (u) => <span className="font-medium">{u.firstName} {u.lastName}</span> },
  { key: "email", label: "Email", skeletonWidth: "w-40", render: (u) => <span className="text-muted-foreground">{u.email}</span> },
  { key: "role", label: "Role", skeletonWidth: "w-24", render: (u) => <span className="text-muted-foreground">{u.role?.name || "N/A"}</span> },
  { key: "organization", label: "Organization", skeletonWidth: "w-24", render: (u) => <span className="text-muted-foreground">{u.organization?.name || "N/A"}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-16", render: (u) => <StatusBadge active={u.status === "active"} activeLabel={u.status} inactiveLabel={u.status} /> },
];

export default function UsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchData = async (p: number) => {
    setLoading(true);
    try {
      const usersData = await usersService.findAll(p, limit);
      setData(usersData);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page); }, [page]);

  const handleDelete = async (user: User) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await usersService.remove(user.id);
      toast.success("User deleted successfully");
      fetchData(page);
    } catch { toast.error("Failed to delete user"); }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Users Management" />
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={loading}
        keyExtractor={(u) => u.id}
        onDelete={handleDelete}
        emptyMessage="No users found"
        pagination={data ? { page, total: data.total, limit, onPageChange: setPage } : undefined}
      />
    </div>
  );
}
