"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import React from "react";

interface FormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  isEditing: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  submitLabel?: { create: string; edit: string; loading: string };
}

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  isEditing,
  isSubmitting,
  onSubmit,
  children,
  submitLabel,
}: FormSheetProps) {
  const labels = submitLabel || { create: "Create", edit: "Update", loading: "Processing..." };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-semibold">{isEditing ? `Edit ${title}` : `Create ${title}`}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <form onSubmit={onSubmit} className="space-y-4 py-2 px-4 text-foreground">
          {children}
          <SheetFooter className="pt-4 border-t mt-6">
            <Button type="submit" disabled={isSubmitting} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {isSubmitting ? labels.loading : isEditing ? labels.edit : labels.create}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
