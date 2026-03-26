"use client";

import { FormSheet } from "@/components/admin/FormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registrarsService } from "@/lib/api/registrars";
import { Registrar } from "@/types/registrars";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function RegistrarsPage() {
  const [data, setData] = useState<Registrar[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<Registrar | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [configValue, setConfigValue] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await registrarsService.findAll();
      setData(Array.isArray(res) ? res : res.data || []);
    } catch {
      toast.error("Failed to fetch registrars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (registrar: Registrar) => {
    setSelected(registrar);
    setConfigValue(JSON.stringify(registrar.config || {}, null, 2));
    setSheetOpen(true);
  };

  const handleToggleStatus = async (registrar: Registrar) => {
    try {
      if (registrar.isActive) {
        await registrarsService.deactivate(registrar.id);
      } else {
        await registrarsService.activate(registrar.id);
      }
      toast.success(`Registrar ${registrar.isActive ? "deactivated" : "activated"}`);
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
      await registrarsService.configure(selected.id, { config });
      toast.success("Registrar configured successfully");
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
      <PageHeader title="Domain Registrars" />

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
          : data.map((registrar) => (
              <Card key={registrar.id} className="flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wide">
                      {registrar.name}
                    </CardTitle>
                    <p className="text-xs font-mono text-muted-foreground mt-0.5">{registrar.slug}</p>
                  </div>
                  <StatusBadge active={registrar.isActive} />
                </CardHeader>
                <CardFooter className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(registrar)}
                    className="flex-1 h-8 text-xs font-bold uppercase"
                  >
                    Config
                  </Button>
                  <Button
                    variant={registrar.isActive ? "destructive" : "default"}
                    size="sm"
                    onClick={() => handleToggleStatus(registrar)}
                    className="flex-1 h-8 text-xs font-bold uppercase"
                  >
                    {registrar.isActive ? "Disable" : "Enable"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
      </div>

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Configure Registrar"
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
              placeholder='{ "apiKey": "...", "secret": "..." }'
              className="font-mono text-xs h-64"
            />
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
