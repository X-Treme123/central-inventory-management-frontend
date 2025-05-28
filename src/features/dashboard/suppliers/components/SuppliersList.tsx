// features/dashboard/suppliers/components/SuppliersList.tsx
"use client";

import { Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SupplierCard } from "./SupplierCard";
import type { Supplier } from "../api/types";

interface SuppliersListProps {
  suppliers: Supplier[];
  loading?: boolean;
  onView: (supplierId: string) => void;
  onEdit: (supplierId: string) => void;
  onDelete: (supplierId: string) => void;
  onCreateSupplier: () => void;
}

export const SuppliersList = ({
  suppliers,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onCreateSupplier
}: SuppliersListProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="h-64">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <Skeleton className="h-4 w-1/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (suppliers.length === 0) {
    return (
      <Card className="col-span-full">
        <CardContent className="text-center py-8">
          <Building2
            size={48}
            className="mx-auto text-muted-foreground mb-4"
          />
          <h3 className="text-lg font-medium">No suppliers found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or create a new supplier
          </p>
          <Button onClick={onCreateSupplier} className="mt-4 gap-2">
            <Plus size={16} />
            Add Supplier
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {suppliers.map((supplier) => (
        <SupplierCard
          key={supplier.id}
          supplier={supplier}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};