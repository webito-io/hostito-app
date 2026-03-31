"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { PageHeader } from "@/components/admin/PageHeader";
import { FormSheet } from "@/components/admin/FormSheet";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { usersService } from "@/lib/api/users";
import { rolesService } from "@/lib/api/roles";
import { organizationsService } from "@/lib/api/organizations";
import { User, UsersResponse, CreateUserDto } from "@/types/users";
import { Role } from "@/types/roles";
import { Organization } from "@/types/organizations";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const columns: Column<User>[] = [
  { key: "name", label: "Name", skeletonWidth: "w-32", render: (u) => <span className="font-medium text-primary">{u.firstName} {u.lastName}</span> },
  { key: "email", label: "Email", skeletonWidth: "w-40", render: (u) => <span className="text-muted-foreground">{u.email}</span> },
  { key: "role", label: "Role", skeletonWidth: "w-24", render: (u) => <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted border text-muted-foreground">{u.role?.name || "N/A"}</span> },
  { key: "organization", label: "Organization", skeletonWidth: "w-32", render: (u) => <span className="text-muted-foreground">{u.organization?.name || "N/A"}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-16", render: (u) => <StatusBadge active={u.status === "active"} activeLabel="Active" inactiveLabel={u.status} /> },
];

export default function UsersPage() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [roles, setRoles] = useState<Role[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const limit = 10;

  const [formData, setFormData] = useState<CreateUserDto>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    organizationName: "",
    organizationId: 1,
    status: "active",
    roleId: 2,
  });

  const fetchData = async (p: number) => {
    setLoading(true);
    try {
      const [usersData, rolesData, orgsData] = await Promise.all([
        usersService.findAll(p, limit),
        rolesService.findAll(),
        organizationsService.findAll(1, 100),
      ]);
      setData(usersData);
      setRoles(rolesData.data);
      setOrgs(orgsData.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(page); }, [page]);

  const handleCreate = () => {
    setSelectedUser(null);
    setFormData({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      organizationName: "",
      organizationId: 1,
      status: "active",
      roleId: 2,
    });
    setSheetOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || "",
      organizationName: user.organization?.name || "",
      organizationId: user.organizationId,
      status: user.status,
      roleId: user.roleId,
    });
    setSheetOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await usersService.remove(user.id);
      toast.success("User deleted");
      fetchData(page);
    } catch { toast.error("Failed to delete user"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedUser) {
        await usersService.update(selectedUser.id, formData);
        toast.success("User updated successfully");
      } else {
        await usersService.create(formData);
        toast.success("User created successfully");
      }
      setSheetOpen(false);
      fetchData(page);
    } catch {
      toast.error(selectedUser ? "Failed to update" : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Users Management" action={{ label: "Add User", onClick: handleCreate }} />
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={loading}
        keyExtractor={(u) => u.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No users found"
        pagination={data ? { page, total: data.total, limit, onPageChange: setPage } : undefined}
      />

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="User"
        isEditing={!!selectedUser}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{selectedUser ? "New Password (optional)" : "Password"}</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              required={!selectedUser}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={String(formData.roleId)}
              onValueChange={(val) => setFormData({ ...formData, roleId: Number(val) })}
            >
              <SelectTrigger id="role" className="h-10">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles?.map(role => (
                  <SelectItem key={role.id} value={String(role.id)}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="org">Organization</Label>
            <Select
              value={String(formData.organizationId)}
              onValueChange={(val) => setFormData({ ...formData, organizationId: Number(val) })}
            >
              <SelectTrigger id="org" className="h-10">
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {orgs.map(org => (
                  <SelectItem key={org.id} value={String(org.id)}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
