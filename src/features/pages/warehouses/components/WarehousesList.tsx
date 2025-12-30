// features/dashboard/warehouses/components/WarehousesList.tsx
"use client";

import { Plus, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WarehouseCard } from "./WarehouseCard";
import type { Warehouses, Container, Rack } from "../api/types";

interface WarehousesListProps {
  warehouses: Warehouses[];
  containers: { [warehouseId: string]: Container[] };
  racks: { [containerId: string]: Rack[] };
  onViewDetails: (warehouseId: string) => void;
  onEdit: (warehouseId: string) => void;
  onDelete: (warehouseId: string) => void;
  onAddContainer: (warehouseId: string) => void;
  onCreateWarehouse: () => void;
}

export const WarehousesList = ({
  warehouses,
  containers,
  racks,
  onViewDetails,
  onEdit,
  onDelete,
  onAddContainer,
  onCreateWarehouse
}: WarehousesListProps) => {
  if (warehouses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Warehouse
            size={48}
            className="mx-auto text-muted-foreground mb-4"
          />
          <h3 className="text-lg font-medium">No warehouses found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or create a new warehouse
          </p>
          <Button className="mt-4" onClick={onCreateWarehouse}>
            <Plus size={16} className="mr-2" />
            Create Warehouse
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {warehouses.map((warehouse, index) => (
        <WarehouseCard
          key={warehouse.id}
          warehouse={warehouse}
          containers={containers[warehouse.id]}
          racks={racks}
          index={index}
          onViewDetails={onViewDetails}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddContainer={onAddContainer}
        />
      ))}
    </div>
  );
};