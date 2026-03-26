"use client";

import { DashboardPageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { organizationsService } from "@/lib/api/organizations";
import { currenciesService } from "@/lib/api/currencies";
import { Currency } from "@/types/currencies";
import { Organization } from "@/types/organizations";
import instance from "@/lib/api/instance";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [org, setOrg] = useState<Organization | null>(null);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // profile form
  const [profile, setProfile] = useState({ firstName: "", lastName: "", password: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // org form
  const [orgName, setOrgName] = useState("");
  const [currencyId, setCurrencyId] = useState("");

  useEffect(() => {
    Promise.all([
      instance.get("/auth/me"),
      currenciesService.findAll(1, 100),
    ]).then(async ([meRes, currRes]) => {
      const user = meRes.data;
      setProfile({ firstName: user.firstName || "", lastName: user.lastName || "", password: "" });
      setCurrencies(currRes.data);

      if (user.organizationId) {
        const o = await organizationsService.findOne(user.organizationId);
        setOrg(o);
        setOrgName(o.name);
        setCurrencyId(String(o.currencyId));
      }
    }).catch(() => toast.error("Failed to load settings"))
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
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!org) return;
    setSaving(true);
    try {
      await organizationsService.update(org.id, { name: orgName, currencyId: Number(currencyId) });
      toast.success("Organization updated");
    } catch {
      toast.error("Failed to update organization");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <DashboardPageHeader title="Settings" description="Manage your profile and organization." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} disabled={loading} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} disabled={loading} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  New Password{" "}
                  <span className="text-muted-foreground text-xs">(leave blank to keep current)</span>
                </Label>
                <Input id="password" type="password" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} placeholder="••••••••" disabled={loading} />
              </div>
              <Button type="submit" disabled={savingProfile || loading} className="w-full">
                {savingProfile ? "Saving..." : "Save Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveOrg} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name</Label>
                <Input id="orgName" value={orgName} onChange={(e) => setOrgName(e.target.value)} disabled={loading || !org} required />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currencyId} onValueChange={(v) => v && setCurrencyId(v)} disabled={loading || !org}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name} ({c.symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={saving || loading || !org} className="w-full">
                {saving ? "Saving..." : "Save Organization"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
