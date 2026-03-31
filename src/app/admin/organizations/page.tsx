"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { FormSheet } from "@/components/admin/FormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { currenciesService } from "@/lib/api/currencies";
import { organizationsService } from "@/lib/api/organizations";
import { usersService } from "@/lib/api/users";
import { Currency } from "@/types/currencies";
import {
  CreateOrganizationDto,
  Organization,
  OrganizationsResponse
} from "@/types/organizations";
import { User } from "@/types/users";
import { Plus, Trash, UserPlus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const columns: Column<Organization>[] = [
  { key: "name", label: "Name", skeletonWidth: "w-40", render: (o) => <span className="font-medium">{o.name}</span> },
  { key: "currency", label: "Currency", skeletonWidth: "w-24", render: (o) => <span className="text-muted-foreground">{o.currency?.code || `ID #${o.currencyId}`}</span> },
  { key: "users", label: "Users count", skeletonWidth: "w-20", render: (o) => <span className="text-muted-foreground">{o.users?.length || 0} users</span> },
];

const defaultForm: CreateOrganizationDto = { name: "", currencyId: 1, users: [] };

export default function OrganizationsPage() {
  const [data, setData] = useState<OrganizationsResponse | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState<CreateOrganizationDto>({ ...defaultForm });
  const [userSearch, setUserSearch] = useState("");
  const limit = 10;

  const fetchData = async (p: number) => {
    setLoading(true);
    try {
      const orgsData = await organizationsService.findAll(p, limit);
      setData(orgsData);
    } catch {
      toast.error("Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const [currRes, usersRes] = await Promise.all([
        currenciesService.findAll(1, 25),
        usersService.findAll(1, 100)
      ]);
      setCurrencies(currRes.data);
      setAllUsers(usersRes.data);
    } catch (error) {
      console.error("Failed to fetch auxiliary data", error);
    }
  };

  useEffect(() => {
    fetchData(page);
    fetchAuxiliaryData();
  }, [page]);

  const handleCreate = () => {
    setSelectedOrg(null);
    setFormData({ ...defaultForm });
    setIsSheetOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      currencyId: org.currencyId,
      users: org.users?.map(u => u.id) || [],
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (org: Organization) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await organizationsService.remove(org.id);
      toast.success("Organization deleted successfully");
      fetchData(page);
    } catch {
      toast.error("Failed to delete organization");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedOrg) {
        await organizationsService.update(selectedOrg.id, formData);
        toast.success("Organization updated");
      } else {
        await organizationsService.create(formData);
        toast.success("Organization created");
      }
      setIsSheetOpen(false);
      fetchData(page);
    } catch (error: any) {
      toast.error(error.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addUserToOrg = (userId: number) => {
    const users = formData.users ?? [];
    if (!users.includes(userId))
      setFormData({ ...formData, users: [...users, userId] });
    setUserSearch("");
  };

  const removeUserFromOrg = (userId: number) => {
    setFormData({ ...formData, users: (formData.users ?? []).filter(id => id !== userId) });
  };

  const filteredUsers = useMemo(() => {
    if (!userSearch) return allUsers;
    const search = userSearch.toLowerCase();
    return allUsers.filter(u =>
      u.email.toLowerCase().includes(search) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search)
    );
  }, [allUsers, userSearch]);

  const currentOrgUsers = useMemo(
    () => allUsers.filter(u => (formData.users ?? []).includes(u.id)),
    [allUsers, formData.users]
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Organizations" action={{ label: "Add Organization", onClick: handleCreate }} />

      <FormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        title="Organization"
        isEditing={!!selectedOrg}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Organization Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currencyId">Default Currency</Label>
              <Select
                value={String(formData.currencyId || "1")}
                onValueChange={(val) => setFormData({ ...formData, currencyId: parseInt(val || "1") })}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(curr => (
                    <SelectItem key={curr.id} value={curr.id.toString()}>
                      {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* User Management Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Manage Members
              </h3>
            </div>

            <div className="space-y-3">
              <Combobox
                onValueChange={(val) => addUserToOrg(Number(val))}
              >
                <ComboboxInput
                  placeholder="Invite user by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="h-10"
                />
                <ComboboxContent>
                  <ComboboxList>
                    {filteredUsers.map((user) => {
                      const isSelected = (formData.users ?? []).includes(user.id);
                      return (
                        <ComboboxItem
                          key={user.id}
                          value={user.id.toString()}
                          onClick={(e) => {
                            e.preventDefault();
                            isSelected ? removeUserFromOrg(user.id) : addUserToOrg(user.id);
                          }}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <Checkbox checked={isSelected} />
                            <div className="flex flex-col">
                              <span className="font-medium">{user.firstName} {user.lastName}</span>
                              <span className="text-[10px] text-muted-foreground">{user.email}</span>
                            </div>
                          </div>
                        </ComboboxItem>
                      );
                    })}
                    <ComboboxEmpty>No users found</ComboboxEmpty>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>

              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {currentOrgUsers.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic p-2 text-center border border-dashed rounded">No members added yet</p>
                ) : (
                  currentOrgUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-muted/30 rounded border group transition-colors hover:border-border">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.firstName} {user.lastName}</span>
                        <span className="text-[10px] text-muted-foreground">{user.email}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeUserFromOrg(user.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </FormSheet>

      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={loading}
        keyExtractor={(o) => o.id}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No organizations found"
        pagination={data ? { page, total: data.total, limit, onPageChange: setPage } : undefined}
      />
    </div>
  );
}
