// features/dashboard/warehouses/components/CreateContainerDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import type { Warehouses } from "../api/types";

interface CreateContainerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (warehouseId: string, name: string, description: string) => Promise<void>;
  warehouses: Warehouses[];
  isLoading: boolean;
  error?: string;
  onClearError?: () => void;
  preselectedWarehouseId?: string;
}

export const CreateContainerDialog = ({
  open,
  onOpenChange,
  onSubmit,
  warehouses,
  isLoading,
  error,
  onClearError,
  preselectedWarehouseId
}: CreateContainerDialogProps) => {
  const [warehouseId, setWarehouseId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Set preselected warehouse when prop changes
  useEffect(() => {
    if (preselectedWarehouseId) {
      setWarehouseId(preselectedWarehouseId);
    }
  }, [preselectedWarehouseId]);

  const handleSubmit = async () => {
    if (!name.trim() || !warehouseId) {
      return;
    }
    
    await onSubmit(warehouseId, name.trim(), description.trim());
    
    // Reset form if successful (dialog will close)
    if (!error) {
      setWarehouseId(preselectedWarehouseId || "");
      setName("");
      setDescription("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setWarehouseId(preselectedWarehouseId || "");
      setName("");
      setDescription("");
      if (onClearError) {
        onClearError();
      }
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Container</DialogTitle>
          <DialogDescription>
            Add a new container to one of your warehouses
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded flex justify-between items-center mb-4">
            <span>{error}</span>
            {onClearError && (
              <button onClick={onClearError}>
                <X size={16} />
              </button>
            )}
          </div>
        )}

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="warehouse_id">Select Warehouse *</Label>
            <Select
              value={warehouseId}
              onValueChange={setWarehouseId}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="container-name">Container Name *</Label>
            <Input
              id="container-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter container name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="container-description">Description</Label>
            <Textarea
              id="container-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter container description (optional)"
              rows={3}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim() || !warehouseId}
          >
            {isLoading ? "Creating..." : "Create Container"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};