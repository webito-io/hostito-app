"use client";

import { Button } from "@/components/ui/button";

interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export function DashboardPageHeader({ title, description, action }: DashboardPageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight">{title}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick} className="font-semibold">
          {action.label}
        </Button>
      )}
    </div>
  );
}
