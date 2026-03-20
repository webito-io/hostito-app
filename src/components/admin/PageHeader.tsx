"use client"

import { Button } from "@/components/ui/button";
import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface PageHeaderProps {
  title: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function PageHeader({ title, action }: PageHeaderProps) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const formatSegment = (s: string) => {
    // Basic human-readable conversion: invoices -> Invoices, 2 -> #2
    if (!isNaN(Number(s))) return `#${s}`;
    return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
  };

  return (
    <div className="space-y-4">
      {/* Dynamic Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={(props) => <Link {...props} href="/admin" />}>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          {segments.map((seg, i) => {
            const isLast = i === segments.length - 1;
            const href = `/${segments.slice(0, i + 1).join('/')}`;
            
            // Skip "admin" segment as it's the dashboard
            if (seg === "admin") return null;

            return (
              <React.Fragment key={seg}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="font-medium text-foreground">{formatSegment(seg)}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={(props) => <Link {...props} href={href} />}>
                      {formatSegment(seg)}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight text-foreground">{title}</h1>
        {action && (
          <Button onClick={action.onClick} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm font-semibold">
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
