"use client";

import { PageHeader } from "@/components/admin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { settingsService } from "@/lib/api/settings";
import { Setting } from "@/types/system-settings";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Detect value type for smart rendering
type ValueType = "boolean" | "number" | "json" | "string";

function detectType(value: unknown): ValueType {
  if (value === "true" || value === "false") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "object" && value !== null) return "json";
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "object" && parsed !== null) return "json";
      if (typeof parsed === "number") return "number";
    } catch {}
  }
  return "string";
}

function toEditString(value: unknown): string {
  if (typeof value === "object" && value !== null) return JSON.stringify(value, null, 2);
  return String(value ?? "");
}

function parseValue(raw: string, type: ValueType): string | number | object {
  if (type === "json") {
    try { return JSON.parse(raw); } catch { throw new Error("Invalid JSON"); }
  }
  if (type === "number") {
    const n = Number(raw);
    if (isNaN(n)) throw new Error("Invalid number");
    return n;
  }
  return raw;
}

// Per-row editor component
function SettingRow({ setting, onSaved }: { setting: Setting; onSaved: () => void }) {
  const type = detectType(setting.value);
  const [raw, setRaw] = useState(toEditString(setting.value));
  const [saving, setSaving] = useState(false);
  const [jsonError, setJsonError] = useState(false);

  const isDirty = raw !== toEditString(setting.value);

  const handleSave = async () => {
    setSaving(true);
    setJsonError(false);
    try {
      const parsed = parseValue(raw, type);
      await settingsService.update(setting.key, { value: parsed });
      toast.success(`"${setting.key}" updated`);
      onSaved();
    } catch (e: any) {
      if (e.message === "Invalid JSON") {
        setJsonError(true);
        toast.error("Invalid JSON format");
      } else if (e.message === "Invalid number") {
        toast.error("Value must be a valid number");
      } else {
        toast.error("Failed to update setting");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-5 py-4 flex gap-4 items-start">
      {/* Key + badges */}
      <div className="w-56 shrink-0 pt-1 space-y-1">
        <p className="text-xs font-mono font-semibold text-foreground">{setting.key}</p>
        <div className="flex gap-1 flex-wrap">
          {setting.isPublic && (
            <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
              Public
            </span>
          )}
          <span className="text-[10px] font-bold uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {type}
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-w-0">
        {type === "boolean" ? (
          <div className="flex items-center gap-3 pt-1">
            {["true", "false"].map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name={setting.key}
                  value={opt}
                  checked={raw === opt}
                  onChange={() => setRaw(opt)}
                  className="accent-primary"
                />
                <span className="text-sm capitalize">{opt}</span>
              </label>
            ))}
          </div>
        ) : type === "number" ? (
          <Input
            type="number"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className="h-8 text-sm w-40"
          />
        ) : type === "json" ? (
          <textarea
            value={raw}
            onChange={(e) => { setRaw(e.target.value); setJsonError(false); }}
            rows={Math.min(Math.max(raw.split("\n").length, 3), 10)}
            className={`w-full font-mono text-xs rounded-md border bg-background/50 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none ${
              jsonError ? "border-destructive" : "border-input"
            }`}
          />
        ) : (
          <Input
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            className="h-8 text-sm"
          />
        )}
        {jsonError && <p className="text-xs text-destructive mt-1">Invalid JSON — please fix before saving.</p>}
      </div>

      {/* Save button */}
      <div className="shrink-0 pt-0.5">
        <Button
          size="sm"
          variant={isDirty ? "default" : "outline"}
          className="h-8 text-xs min-w-16"
          disabled={saving || !isDirty}
          onClick={handleSave}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [data, setData] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const settings = await settingsService.findAll();
      setData(Array.isArray(settings) ? settings : (settings as any).data || []);
    } catch {
      toast.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
        <PageHeader title="System Settings" />
        <div className="rounded-lg border divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex gap-4 items-start animate-pulse">
              <div className="w-56 space-y-2">
                <div className="h-3 w-32 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
              <div className="flex-1 h-8 bg-muted rounded" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
      <PageHeader title="System Settings" />
      <div className="rounded-lg border divide-y">
        {data.map((setting) => (
          <SettingRow key={setting.key} setting={setting} onSaved={fetchData} />
        ))}
        {data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">No settings found</p>
        )}
      </div>
    </div>
  );
}
