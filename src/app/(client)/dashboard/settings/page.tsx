"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { organizationsService } from "@/lib/api/organizations";
import { currenciesService } from "@/lib/api/currencies";
import { Currency } from "@/types/currencies";
import { Organization } from "@/types/organizations";
import { CountryDropdown, Country } from "@/components/ui/country-dropdown";
import { Settings2Icon } from "lucide-react";
import instance from "@/lib/api/instance";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ firstName: "", lastName: "", password: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [orgForm, setOrgForm] = useState({ name: "", currencyId: "", phone: "", address: "", city: "", state: "", zip: "", country: "" });
  const [savingOrg, setSavingOrg] = useState(false);

  useEffect(() => {
    Promise.all([instance.get("/auth/me"), currenciesService.findAll(1, 100)])
      .then(async ([meRes, currRes]) => {
        const user = meRes.data;
        setProfile({ firstName: user.firstName || "", lastName: user.lastName || "", password: "" });
        setCurrencies(currRes.data);
        if (user.organizationId) {
          const o = await organizationsService.findOne(user.organizationId);
          setOrg(o);
          setOrgForm({ name: o.name || "", currencyId: String(o.currencyId), phone: o.phone || "", address: o.address || "", city: o.city || "", state: o.state || "", zip: o.zip || "", country: o.country || "" });
        }
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const payload: Record<string, string> = { firstName: profile.firstName, lastName: profile.lastName };
      if (profile.password) payload.password = profile.password;
      await instance.patch("/users/me", payload);
      toast.success("Profile updated");
      setProfile((p) => ({ ...p, password: "" }));
    } catch { toast.error("Failed to update profile"); }
    finally { setSavingProfile(false); }
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setSavingOrg(true);
    try {
      await organizationsService.update(org.id, {
        name: orgForm.name, currencyId: Number(orgForm.currencyId),
        phone: orgForm.phone || undefined, address: orgForm.address || undefined,
        city: orgForm.city || undefined, state: orgForm.state || undefined,
        zip: orgForm.zip || undefined, country: orgForm.country || undefined,
      });
      toast.success("Organization updated");
    } catch { toast.error("Failed to update"); }
    finally { setSavingOrg(false); }
  };

  if (loading) return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <Skeleton className="h-8 w-32 mb-6" />
      <Skeleton className="h-10 w-64 mb-8" />
      <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
    </div>
  );

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8">
      <div className="flex items-center gap-2 mb-1">
        <Settings2Icon className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground font-medium">Settings</p>
      </div>
      <h1 className="text-3xl font-black tracking-tight mb-6">Account Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <form onSubmit={handleSaveProfile} className="max-w-2xl">
            <p className="text-xs text-muted-foreground mb-6">Update your personal information and password.</p>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">First Name</Label>
                  <Input value={profile.firstName} onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Last Name</Label>
                  <Input value={profile.lastName} onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))} required />
                </div>
              </div>
              <Separator />
              <div className="space-y-1.5 max-w-sm">
                <Label className="text-xs text-muted-foreground">New Password</Label>
                <Input type="password" value={profile.password} onChange={(e) => setProfile((p) => ({ ...p, password: e.target.value }))} placeholder="Leave blank to keep current" />
              </div>
              <Button type="submit" disabled={savingProfile} className="font-bold">
                {savingProfile ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="organization">
          {org ? (
            <form onSubmit={handleSaveOrg} className="max-w-2xl">
              <p className="text-xs text-muted-foreground mb-6">Manage your organization details and billing currency.</p>
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Organization Name</Label>
                    <Input value={orgForm.name} onChange={(e) => setOrgForm((p) => ({ ...p, name: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Currency</Label>
                    <Select value={orgForm.currencyId} onValueChange={(v) => v && setOrgForm((p) => ({ ...p, currencyId: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{currencies.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name} ({c.symbol})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <Input value={orgForm.phone} onChange={(e) => setOrgForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+1234567890" />
                </div>
                <Button type="submit" disabled={savingOrg} className="font-bold">
                  {savingOrg ? "Saving..." : "Save Organization"}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground py-8">No organization linked to your account.</p>
          )}
        </TabsContent>

        <TabsContent value="address">
          {org ? (
            <form onSubmit={handleSaveOrg} className="max-w-2xl">
              <p className="text-xs text-muted-foreground mb-6">Your billing address for invoices and tax purposes.</p>
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Street Address</Label>
                  <Input value={orgForm.address} onChange={(e) => setOrgForm((p) => ({ ...p, address: e.target.value }))} placeholder="123 Main St" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">City</Label>
                    <Input value={orgForm.city} onChange={(e) => setOrgForm((p) => ({ ...p, city: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">State / Province</Label>
                    <Input value={orgForm.state} onChange={(e) => setOrgForm((p) => ({ ...p, state: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">ZIP / Postal Code</Label>
                    <Input value={orgForm.zip} onChange={(e) => setOrgForm((p) => ({ ...p, zip: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Country</Label>
                    <CountryDropdown defaultValue={orgForm.country} onChange={(c: Country) => setOrgForm((p) => ({ ...p, country: c.alpha2 }))} placeholder="Select country" />
                  </div>
                </div>
                <Button type="submit" disabled={savingOrg} className="font-bold">
                  {savingOrg ? "Saving..." : "Save Address"}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground py-8">No organization linked to your account.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
