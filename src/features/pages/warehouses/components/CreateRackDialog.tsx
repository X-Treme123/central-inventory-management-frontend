// features/dashboard/warehouses/components/CreateRackDialog.tsx
"use client";

import { useState, useMemo } from "react";
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
import type { Warehouses, Container } from "../api/types";

interface CreateRackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (containerId: string, name: string, description: string) => Promise<void>;
  warehouses: Warehouses[];
  containers: { [warehouseId: string]: Container[] };
  isLoading: boolean;
  error?: string;
  onClearError?: () => void;
}

export const CreateRackDialog = ({
  open,
  onOpenChange,
  onSubmit,
  warehouses,
  containers,
  isLoading,
  error,
  onClearError
}: CreateRackDialogProps) => {
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [containerId, setContainerId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Get containers for selected warehouse
  const availableContainers = useMemo(() => {
    if (!selectedWarehouseId) return [];
    return containers[selectedWarehouseId] || [];
  }, [selectedWarehouseId, containers]);

  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    setContainerId(""); // Reset container selection when warehouse changes
  };

  const handleSubmit = async () => {
    if (!name.trim() || !containerId) {
      return;
    }
    
    await onSubmit(containerId, name.trim(), description.trim());
    
    // Reset form if successful (dialog will close)
    if (!error) {
      setSelectedWarehouseId("");
      setContainerId("");
      setName("");
      setDescription("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setSelectedWarehouseId("");
      setContainerId("");
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
          <DialogTitle>Create New Rack</DialogTitle>
          <DialogDescription>
            Add a new rack to one of your containers
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
            <Label htmlFor="warehouse-select">Select Warehouse</Label>
            <Select
              value={selectedWarehouseId}
              onValueChange={handleWarehouseChange}
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
            <Label htmlFor="container_id">Select Container *</Label>
            <Select
              value={containerId}
              onValueChange={setContainerId}
              disabled={isLoading || !selectedWarehouseId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a container" />
              </SelectTrigger>
              <SelectContent>
                {availableContainers.map((container) => (
                  <SelectItem key={container.id} value={container.id}>
                    {container.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rack-name">Rack Name *</Label>
            <Input
              id="rack-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter rack name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rack-description">Description</Label>
            <Textarea
              id="rack-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter rack description (optional)"
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
            disabled={isLoading || !name.trim() || !containerId}
          >
            {isLoading ? "Creating..." : "Create Rack"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};