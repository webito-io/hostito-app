"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  skeletonWidth?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading: boolean;
  keyExtractor: (item: T) => string | number;
  onEdit?: (item: T) => void;
  onView?: (item: T) => void;
  onDelete?: (item: T) => void;
  emptyMessage?: string;
  pagination?: {
    page: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({
  columns,
  data,
  loading,
  keyExtractor,
  onEdit,
  onView,
  onDelete,
  emptyMessage = "No data found",
  pagination,
}: DataTableProps<T>) {
  const hasActions = onEdit || onDelete || onView;
  const totalColumns = columns.length + (hasActions ? 1 : 0);

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  return (
    <Card className="border-none shadow-sm ring-1 ring-border rounded-sm overflow-hidden py-0">
      <CardHeader className="p-0 border-b">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/30 text-muted-foreground uppercase text-[11px] font-bold tracking-wider">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={`px-6 py-4 ${col.className || ""}`}>
                    {col.label}
                  </th>
                ))}
                {hasActions && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-6 py-4">
                        <Skeleton className={`h-4 ${col.skeletonWidth || "w-32"}`} />
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-6 py-4">
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </td>
                    )}
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((item) => (
                  <tr key={keyExtractor(item)} className="hover:bg-muted/20 transition-colors">
                    {columns.map((col) => (
                      <td key={col.key} className={`px-6 py-4 ${col.className || ""}`}>
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </td>
                    ))}
                    {hasActions && (
                      <td className="px-6 py-4 text-right space-x-1">
                        {onView && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 hover:bg-muted font-medium text-primary"
                            onClick={() => onView(item)}
                          >
                            View
                          </Button>
                        )}
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 hover:bg-muted font-medium"
                            onClick={() => onEdit(item)}
                          >
                            Edit
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10 font-medium"
                            onClick={() => onDelete(item)}
                          >
                            Delete
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={totalColumns} className="px-6 py-12 text-center text-muted-foreground text-base">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardHeader>
      {pagination && totalPages > 1 && (
        <CardContent className="flex items-center justify-between px-6 py-4 bg-muted/10">
          <div className="text-sm text-muted-foreground font-medium">
            Page {pagination.page} of {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-none bg-muted/50 hover:bg-muted shadow-none"
              disabled={pagination.page <= 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-none bg-muted/50 hover:bg-muted shadow-none"
              disabled={pagination.page >= totalPages}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
