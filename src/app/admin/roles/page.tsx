"use client";

import { DataTable, Column } from "@/components/admin/DataTable";
import { FormSheet } from "@/components/admin/FormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { rolesService } from "@/lib/api/roles";
import { CreateRoleDto, Role, RolesResponse, Permission } from "@/types/roles";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

const columns = (onEdit: (r: Role) => void, onDelete: (r: Role) => void): Column<Role>[] => [
  { key: "name", label: "Name", skeletonWidth: "w-40", render: (r) => <span className="font-medium">{r.name}</span> },
  { 
    key: "permissions", 
    label: "Permissions Overview", 
    skeletonWidth: "w-60", 
    render: (r) => (
      <div className="flex flex-wrap gap-1 max-w-md">
        {r.permissions.map(p => (
          <span key={p.id} className="px-1.5 py-0.5 bg-muted text-[10px] rounded border border-border">
            {p.resource}:{p.action}
          </span>
        ))}
        {r.permissions.length === 0 && <span className="text-muted-foreground text-xs italic">No permissions</span>}
      </div>
    ) 
  },
];

export default function RolesPage() {
  const [data, setData] = useState<RolesResponse | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [formData, setFormData] = useState<CreateRoleDto>({
    name: "",
    permissions: [],
  });

  const fetchData = async (p = page) => {
    setLoading(true);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        rolesService.findAll(),
        rolesService.findAllPermissions(),
      ]);
      setData(rolesData);
      setPermissions(permissionsData);
    } catch (error) {
      toast.error("Failed to fetch roles data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const groupedPermissions = useMemo(() => {
    const groups: { [key: string]: Permission[] } = {};
    permissions.forEach(p => {
      if (!groups[p.resource]) groups[p.resource] = [];
      groups[p.resource].push(p);
    });
    return groups;
  }, [permissions]);

  const handleOpenAdd = () => {
    setEditingRole(null);
    setFormData({ name: "", permissions: [] });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      permissions: role.permissions.map(p => p.id),
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;
    try {
      await rolesService.remove(role.id);
      toast.success("Role deleted successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete role");
    }
  };

  const handlePermissionToggle = (id: number) => {
    setFormData(prev => {
      const isSelected = prev.permissions.includes(id);
      if (isSelected) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== id) };
      }
      return { ...prev, permissions: [...prev.permissions, id] };
    });
  };

  const handleSelectGroup = (resource: string) => {
    const groupPerms = groupedPermissions[resource].map(p => p.id);
    const allSelected = groupPerms.every(id => formData.permissions.includes(id));
    
    setFormData(prev => {
      if (allSelected) {
        return { ...prev, permissions: prev.permissions.filter(id => !groupPerms.includes(id)) };
      } else {
        const uniquePerms = Array.from(new Set([...prev.permissions, ...groupPerms]));
        return { ...prev, permissions: uniquePerms };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingRole) {
        await rolesService.update(editingRole.id, formData);
        toast.success("Role updated successfully");
      } else {
        await rolesService.create(formData);
        toast.success("Role created successfully");
      }
      setIsSheetOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Roles Management" action={{ label: "Add New Role", onClick: handleOpenAdd }} />

      <FormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title="Role"
        description="Configure role name and assign permissions."
        isEditing={!!editingRole}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        <Field>
          <FieldLabel>Role Name</FieldLabel>
          <Input name="name" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Admin, Moderator, etc." required className="bg-muted/50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary" />
        </Field>

        <div className="space-y-4">
          <FieldLabel>Permissions</FieldLabel>
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([resource, perms]) => (
              <div key={resource} className="space-y-2">
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{resource}</span>
                  <button type="button" onClick={() => handleSelectGroup(resource)} className="text-[10px] font-bold text-primary hover:underline uppercase">
                    Select All
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-1 px-1">
                  {perms.map(permission => (
                    <label key={permission.id} className="flex items-center gap-3 p-1 hover:bg-muted/40 rounded-md cursor-pointer transition-colors group">
                      <input type="checkbox" checked={formData.permissions.includes(permission.id)} onChange={() => handlePermissionToggle(permission.id)} className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary shadow-none" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none group-hover:text-primary transition-colors">{permission.action}</span>
                        <span className="text-[10px] text-muted-foreground uppercase opacity-70">Scope: {permission.scope}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </FormSheet>

      <DataTable
        columns={columns(handleOpenEdit, handleDelete)}
        data={data?.data || []}
        loading={loading}
        keyExtractor={(r) => r.id}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        pagination={data ? { page, total: data.total, limit, onPageChange: setPage } : undefined}
        emptyMessage="No roles found"
      />
    </div>
  );
}
