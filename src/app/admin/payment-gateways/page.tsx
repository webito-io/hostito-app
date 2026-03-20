"use client";

import { FormSheet } from "@/components/admin/FormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { paymentGatewaysService } from "@/lib/api/payment-gateways";
import { PaymentGateway } from "@/types/payment-gateways";
import { useEffect, useState } from "react";
import { toast } from "sonner";



export default function PaymentGatewaysPage() {
  const [data, setData] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    configJson: "{}",
    isActive: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const gws = await paymentGatewaysService.findAll();
      setData(gws);
    } catch (error) {
      toast.error("Failed to fetch payment gateways");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleEdit = (gw: PaymentGateway) => {
    setSelectedGateway(gw);
    setFormData({
      configJson: JSON.stringify(gw.config, null, 2),
      isActive: gw.isActive,
    });
    setSheetOpen(true);
  };

  const handleToggleStatus = async (gw: PaymentGateway) => {
    try {
      if (gw.isActive) {
        await paymentGatewaysService.deactivate(gw.id);
      } else {
        await paymentGatewaysService.activate(gw.id);
      }
      toast.success(`Gateway ${gw.isActive ? "deactivated" : "activated"}`);
      fetchData();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGateway) return;
    setSubmitting(true);
    try {
      const configObj = JSON.parse(formData.configJson);
      await paymentGatewaysService.setConfig(selectedGateway.id, { config: configObj });
      toast.success("Gateway configuration saved");
      setSheetOpen(false);
      fetchData();
    } catch (e) {
      toast.error("Invalid JSON format in config");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Payment Gateways" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((gw) => (
          <Card key={gw.id} className="flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wide">{gw.name}</CardTitle>
              <StatusBadge active={gw.isActive} />
            </CardHeader>
            <CardFooter className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(gw)}
                className="flex-1 h-8 text-xs font-bold uppercase"
              >
                Config
              </Button>
              <Button
                variant={gw.isActive ? "destructive" : "default"}
                size="sm"
                onClick={() => handleToggleStatus(gw)}
                className="flex-1 h-8 text-xs font-bold uppercase"
              >
                {gw.isActive ? "Disable" : "Enable"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Payment Gateway Config"
        isEditing={true}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
        submitLabel={{ create: "", edit: "Save Config", loading: "Saving..." }}
      >
        <div className="space-y-2">
          <Label htmlFor="config">Gateway Config (JSON)</Label>
          <textarea
            id="config"
            value={formData.configJson}
            onChange={(e) => setFormData({ ...formData, configJson: e.target.value })}
            className="flex min-h-[300px] font-mono w-full rounded-md border border-input bg-background/50 px-3 py-2 text-[13px] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            required
          />
        </div>
      </FormSheet>
    </div>
  );
}
