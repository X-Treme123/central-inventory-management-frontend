// features/dashboard/warehouses/components/CreateWarehouseDialog.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface CreateWarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, description: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
  onClearError?: () => void;
}

export const CreateWarehouseDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  error,
  onClearError
}: CreateWarehouseDialogProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }
    
    await onSubmit(name.trim(), description.trim());
    
    // Reset form if successful (dialog will close)
    if (!error) {
      setName("");
      setDescription("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
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
          <DialogTitle>Create New Warehouse</DialogTitle>
          <DialogDescription>
            Add a new warehouse to your inventory system
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
            <Label htmlFor="warehouse-name">Warehouse Name *</Label>
            <Input
              id="warehouse-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter warehouse name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouse-description">Description</Label>
            <Textarea
              id="warehouse-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter warehouse description (optional)"
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
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? "Creating..." : "Create Warehouse"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};