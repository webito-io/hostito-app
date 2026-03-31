"use client";

import { FormSheet } from "@/components/admin/FormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { provisionersService } from "@/lib/api/provisioners";
import { Provisioner } from "@/types/provisioners";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProvisionersPage() {
  const [data, setData] = useState<Provisioner[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Provisioner | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [configValue, setConfigValue] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await provisionersService.findAll();
      setData(res.data);
    } catch {
      toast.error("Failed to fetch provisioners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (provisioner: Provisioner) => {
    setSelected(provisioner);
    setConfigValue(JSON.stringify(provisioner.config || {}, null, 2));
    setSheetOpen(true);
  };

  const handleToggleStatus = async (provisioner: Provisioner) => {
    try {
      if (provisioner.isActive) {
        await provisionersService.deactivate(provisioner.id);
      } else {
        await provisionersService.activate(provisioner.id);
      }
      toast.success(`Provisioner ${provisioner.isActive ? "deactivated" : "activated"}`);
      fetchData();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      const config = JSON.parse(configValue);
      await provisionersService.configure(selected.id, { config });
      toast.success("Provisioner configured successfully");
      setSheetOpen(false);
      fetchData();
    } catch {
      toast.error("Invalid JSON configuration");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Provisioners" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="flex flex-col justify-between animate-pulse">
                <CardHeader className="pb-4">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded mt-1" />
                </CardHeader>
                <CardFooter className="flex gap-2 pt-4 border-t">
                  <div className="h-8 flex-1 bg-muted rounded" />
                  <div className="h-8 flex-1 bg-muted rounded" />
                </CardFooter>
              </Card>
            ))
          : data.map((provisioner) => (
              <Card key={provisioner.id} className="flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wide">
                      {provisioner.name}
                    </CardTitle>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{provisioner.slug}</p>
                  </div>
                  <StatusBadge active={provisioner.isActive} />
                </CardHeader>
                <CardFooter className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(provisioner)}
                    className="flex-1 h-8 text-xs font-bold uppercase"
                  >
                    Config
                  </Button>
                  <Button
                    variant={provisioner.isActive ? "destructive" : "default"}
                    size="sm"
                    onClick={() => handleToggleStatus(provisioner)}
                    className="flex-1 h-8 text-xs font-bold uppercase"
                  >
                    {provisioner.isActive ? "Disable" : "Enable"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
      </div>

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Configure Provisioner"
        isEditing={true}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
        submitLabel={{ create: "", edit: "Save Config", loading: "Saving..." }}
      >
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-semibold">{selected?.name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{selected?.slug}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="config">Configuration (JSON)</Label>
            <Textarea
              id="config"
              value={configValue}
              onChange={(e) => setConfigValue(e.target.value)}
              placeholder='{ "apiUrl": "...", "apiKey": "..." }'
              className="font-mono text-xs h-64"
            />
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
