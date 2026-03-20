"use client";

import { Column, DataTable } from "@/components/admin/DataTable";
import { FormSheet } from "@/components/admin/FormSheet";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currenciesService } from "@/lib/api/currencies";
import { invoicesService } from "@/lib/api/invoices";
import { organizationsService } from "@/lib/api/organizations";
import { cn } from "@/lib/utils";
import { Currency } from "@/types/currencies";
import { Invoice, InvoicesResponse, InvoiceItem } from "@/types/invoices";
import { Organization } from "@/types/organizations";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const columns: Column<Invoice>[] = [
  { key: "id", label: "Invoice ID", skeletonWidth: "w-16", render: (inv) => <span className="font-mono text-muted-foreground">#{inv.id}</span> },
  { key: "org", label: "Organization", skeletonWidth: "w-32", render: (inv) => <span className="text-muted-foreground">{inv.organization?.name || `ID #${inv.organizationId}`}</span> },
  { key: "total", label: "Total", skeletonWidth: "w-24", render: (inv) => <span className="font-bold text-primary">${inv.total.toFixed(2)}</span> },
  { key: "dueDate", label: "Due Date", skeletonWidth: "w-24", render: (inv) => <span className="text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</span> },
  { key: "status", label: "Status", skeletonWidth: "w-16", render: (inv) => <StatusBadge active={inv.status.toLowerCase() === "paid"} activeLabel={inv.status} inactiveLabel={inv.status} /> },
  { key: "createdAt", label: "Created", skeletonWidth: "w-32", render: (inv) => <span className="text-xs text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</span> },
];

interface LocalInvoiceItem {
  id: string; // React key
  description: string;
  quantity: number;
  unitPrice: number;
}

export default function InvoicesPage() {
  const [data, setData] = useState<InvoicesResponse | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const [orgSearch, setOrgSearch] = useState("");

  const [formData, setFormData] = useState({
    status: "UNPAID",
    total: 0,
    tax: 0,
    subtotal: 0,
    discount: 0,
    shipping: 0,
    currencyId: 0,
    organizationId: 0,
    dueDate: new Date() as Date | undefined,
    cycle: "ONETIME",
  });

  const [items, setItems] = useState<LocalInvoiceItem[]>([
    { id: Math.random().toString(), description: "", quantity: 1, unitPrice: 0 }
  ]);

  useEffect(() => {
    const calculatedSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const calculatedTotal = calculatedSubtotal + formData.tax + formData.shipping - formData.discount;

    setFormData(prev => ({
      ...prev,
      subtotal: calculatedSubtotal,
      total: Math.max(0, calculatedTotal)
    }));
  }, [items, formData.tax, formData.shipping, formData.discount]);

  const fetchData = async (p: number) => {
    setLoading(true);
    try {
      const response = await invoicesService.findAll(p, limit);
      setData(response);
    } catch (error) {
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliaryData = async () => {
    try {
      const [orgsRes, currRes] = await Promise.all([
        organizationsService.findAll(1, 100),
        currenciesService.findAll(1, 100)
      ]);
      setOrganizations(orgsRes.data);
      setCurrencies(currRes.data);
      if (orgsRes.data.length > 0) setFormData(prev => ({ ...prev, organizationId: orgsRes.data[0].id }));
      if (currRes.data.length > 0) setFormData(prev => ({ ...prev, currencyId: currRes.data[0].id }));
    } catch (error) {
      console.error("Failed to fetch auxiliary data", error);
    }
  };

  useEffect(() => {
    fetchData(page);
    fetchAuxiliaryData();
  }, [page]);

  const handleCreate = () => {
    setSelectedInvoice(null);
    setFormData({
      status: "UNPAID",
      total: 0,
      tax: 0,
      subtotal: 0,
      discount: 0,
      shipping: 0,
      currencyId: currencies[0]?.id || 1,
      organizationId: organizations[0]?.id || 1,
      dueDate: new Date(),
      cycle: "ONETIME",
    });
    setOrgSearch("");
    setItems([{ id: Math.random().toString(), description: "", quantity: 1, unitPrice: 0 }]);
    setSheetOpen(true);
  };

  const handleEdit = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setFormData({
      status: inv.status,
      total: inv.total,
      tax: inv.tax,
      subtotal: inv.subtotal,
      discount: inv.discount,
      shipping: inv.shipping,
      currencyId: inv.currencyId,
      organizationId: inv.organizationId,
      dueDate: new Date(inv.dueDate),
      cycle: inv.cycle || "ONETIME",
    });
    const org = organizations.find(o => o.id === inv.organizationId);
    if (org) setOrgSearch(org.name);

    if (inv.items && inv.items.length > 0) {
      setItems(inv.items.map(i => ({
        id: Math.random().toString(),
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice
      })));
    } else {
      setItems([{ id: Math.random().toString(), description: "", quantity: 1, unitPrice: 0 }]);
    }
    setSheetOpen(true);
  };

  const handleView = (inv: Invoice) => router.push(`/admin/invoices/${inv.id}`);

  const handleDelete = async (inv: Invoice) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await invoicesService.remove(inv.id);
      toast.success("Done");
      fetchData(page);
    } catch { toast.error("Error"); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payloadItems: InvoiceItem[] = items
        .filter(i => i.description.trim() !== "")
        .map(i => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.quantity * i.unitPrice
        }));

      if (selectedInvoice) {
        await invoicesService.update(selectedInvoice.id, {
          ...formData,
          dueDate: (formData.dueDate || new Date()).toISOString(),
          items: payloadItems
        });
      } else {
        await invoicesService.create({
          ...formData,
          items: payloadItems,
          dueDate: (formData.dueDate || new Date()).toISOString()
        });
      }
      setSheetOpen(false);
      fetchData(page);
      toast.success("Success");
    } catch { toast.error("Failed"); } finally { setSubmitting(false); }
  };

  const filteredOrgs = useMemo(() => {
    if (!orgSearch) return organizations;
    const search = orgSearch.toLowerCase();
    return organizations.filter(org => org.name.toLowerCase().includes(search));
  }, [organizations, orgSearch]);

  const selectedCurrencyName = currencies.find(c => c.id === formData.currencyId)?.code || "Select...";

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="Invoices" action={{ label: "New Invoice", onClick: handleCreate }} />
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={loading}
        keyExtractor={(inv) => inv.id}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pagination={data ? { page, total: data.total, limit, onPageChange: setPage } : undefined}
      />

      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Invoice"
        isEditing={!!selectedInvoice}
        isSubmitting={submitting}
        onSubmit={handleSubmit}
      >
        <div className="space-y-6 px-1">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Organization</Label>
              <Combobox
                value={formData.organizationId}
                onValueChange={(val) => {
                  const orgId = Number(val);
                  setFormData({ ...formData, organizationId: orgId });
                  const org = organizations.find(o => o.id === orgId);
                  if (org) setOrgSearch(org.name);
                }}
              >
                <ComboboxInput
                  placeholder="Search organization..."
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  className="h-9"
                  showClear
                />
                <ComboboxContent>
                  <ComboboxList>
                    {filteredOrgs.map((org) => (
                      <ComboboxItem key={org.id} value={org.id.toString()}>{org.name}</ComboboxItem>
                    ))}
                    <ComboboxEmpty>Empty</ComboboxEmpty>
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Currency</Label>
                <Select
                  value={String(formData.currencyId || "1")}
                  onValueChange={(val) => setFormData({ ...formData, currencyId: parseInt(val || "1") })}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(curr => <SelectItem key={curr.id} value={curr.id.toString()}>{curr.code}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 flex flex-col">
                <Label className="text-xs font-medium">Due Date</Label>
                <Popover>
                  <PopoverTrigger render={
                    <Button
                      variant="outline"
                      className={cn(
                        "h-9 w-full justify-start text-left font-normal",
                        !formData.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? format(formData.dueDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  } />
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Billing Cycle</Label>
                <Select
                  value={formData.cycle}
                  onValueChange={(val) => setFormData({ ...formData, cycle: val || "ONETIME" })}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONETIME">One-time</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Invoice Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) => setFormData({ ...formData, status: val || "UNPAID" })}
                >
                  <SelectTrigger className="h-9 w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, { id: Math.random().toString(), description: "", quantity: 1, unitPrice: 0 }])} className="h-7 px-2 text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-2 items-start bg-muted/30 p-2 rounded-md border border-border/50">
                    <div className="flex-1 space-y-1">
                      <Input placeholder="Description" value={item.description} onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, description: e.target.value } : i))} className="h-8 text-xs" />
                    </div>
                    <div className="w-16">
                      <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, quantity: parseInt(e.target.value) || 1 } : i))} className="h-8 text-xs" />
                    </div>
                    <div className="w-24">
                      <Input type="number" step="0.01" placeholder="Price" value={item.unitPrice} onChange={(e) => setItems(items.map(i => i.id === item.id ? { ...i, unitPrice: parseFloat(e.target.value) || 0 } : i))} className="h-8 text-xs font-mono" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" disabled={items.length === 1} onClick={() => setItems(items.filter(i => i.id !== item.id))} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tax</Label>
                <Input type="number" step="0.01" value={formData.tax} onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Discount</Label>
                <Input type="number" step="0.01" value={formData.discount} onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Shipping</Label>
                <Input type="number" step="0.01" value={formData.shipping} onChange={(e) => setFormData({ ...formData, shipping: parseFloat(e.target.value) || 0 })} className="h-8" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-md bg-secondary/10">
              <span className="text-sm font-medium">Total Amount</span>
              <span className={cn("text-xl font-bold font-mono tracking-tight text-primary")}>
                ${formData.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </FormSheet>
    </div>
  );
}
