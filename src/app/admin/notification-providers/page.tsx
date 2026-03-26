"use client";

import { FormSheet } from "@/components/admin/FormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { notificationsService } from "@/lib/api/notifications";
import { NotificationProvider } from "@/types/notifications";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function NotificationProvidersPage() {
  const [data, setData] = useState<NotificationProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<NotificationProvider | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [configJson, setConfigJson] = useState("{}");

  const fetchData = async () => {
    setLoading(true);
    try {
      const providers = await notificationsService.findAllProviders();
      setData(Array.isArray(providers) ? providers : []);
    } catch {
      toast.error("Failed to fetch notification providers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (provider: NotificationProvider) => {
    setSelected(provider);
    setConfigJson(JSON.stringify(provider.config || {}, null, 2));
    setSheetOpen(true);
  };

  const handleToggleStatus = async (provider: NotificationProvider) => {
    try {
      if (provider.isActive) {
        await notificationsService.deactivateProvider(provider.id);
      } else {
        await notificationsService.activateProvider(provider.id);
      }
      toast.success(`Provider ${provider.isActive ? "deactivated" : "activated"}`);
      fetchData();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      const config = JSON.parse(configJson);
      await notificationsService.setProviderConfig(selected.id, { config });
      toast.success("Provider configuration saved");
      setSheetOpen(false);
      fetchData();
    } catch {
      toast.error("Invalid JSON format in config");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Notification Providers" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="flex flex-col justify-between animate-pulse">
                <CardHeader className="pb-4">
                  <div className="h-4 w-24 bg-muted rounded" />
                </CardHeader>
                <CardFooter className="flex gap-2 pt-4 border-t">
                  <div className="h-8 flex-1 bg-muted rounded" />
                  <div className="h-8 flex-1 bg-muted rounded" />
                </CardFooter>
              </Card>
            ))
          : data.map((provider) => (
              <Card key={provider.id} className="flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-bold uppercase tracking-wide">{provider.name}</CardTitle>
                  <StatusBadge active={provider.isActive} />
                </CardHeader>
                <CardFooter className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(provider)}
                    className="flex-1 h-8 text-xs font-bold uppercase"
                  >
                    Config
                  </Button>
                  <Button
                    variant={provider.isActive ? "destructive" : "default"}
                    size="sm"
                    onClick={() => handleToggleStatus(provider)}
                    className="flex-1 h-8 text-xs font-bold uppercase"
                  >
                    {provider.isActive ? "Disable" : "Enable"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
      </div>

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Notification Provider Config"
        isEditing={true}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
        submitLabel={{ create: "", edit: "Save Config", loading: "Saving..." }}
      >
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-semibold uppercase">{selected?.name}</h3>
          </div>
          <div className="space-y-2">
            <Label htmlFor="config">Provider Config (JSON)</Label>
            <textarea
              id="config"
              value={configJson}
              onChange={(e) => setConfigJson(e.target.value)}
              className="flex min-h-[300px] font-mono w-full rounded-md border border-input bg-background/50 px-3 py-2 text-[13px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            />
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
