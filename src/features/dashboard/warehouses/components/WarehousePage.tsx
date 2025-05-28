// features/dashboard/warehouses/components/WarehousePage.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  createWarehouse,
  getAllWarehouses,
  createContainer,
  getContainersByWarehouse,
  createRack,
  getRacksByContainer,
} from "../api";
import type { Warehouses, Container, Rack } from "../api/types";
import { WarehouseStats } from "./WarehouseStats";
import { WarehouseSearchFilter } from "./WarehouseSearchFilter";
import { WarehousesList } from "./WarehousesList";
import { CreateWarehouseDialog } from "./CreateWarehouseDialog";
import { CreateContainerDialog } from "./CreateContainerDialog";
import { CreateRackDialog } from "./CreateRackDialog";

export const WarehousePage = () => {
  const { token } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouses[]>([]);
  const [containers, setContainers] = useState<{
    [warehouseId: string]: Container[];
  }>({});
  const [racks, setRacks] = useState<{ [containerId: string]: Rack[] }>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");

  // Dialog states
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [isContainerDialogOpen, setIsContainerDialogOpen] = useState(false);
  const [isRackDialogOpen, setIsRackDialogOpen] = useState(false);

  // Loading states
  const [isCreatingWarehouse, setIsCreatingWarehouse] = useState(false);
  const [isCreatingContainer, setIsCreatingContainer] = useState(false);
  const [isCreatingRack, setIsCreatingRack] = useState(false);

  // Container dialog state
  const [preselectedWarehouseId, setPreselectedWarehouseId] = useState("");

  // Fetch warehouses on component mount
  useEffect(() => {
    if (token) {
      fetchWarehouses();
    }
  }, [token]);

  // Fetch containers for each warehouse
  useEffect(() => {
    if (warehouses.length > 0 && token) {
      warehouses.forEach((warehouse) => {
        fetchContainersByWarehouse(warehouse.id);
      });
    }
  }, [warehouses, token]);

  // Fetch racks for each container when containers change
  useEffect(() => {
    if (Object.keys(containers).length > 0 && token) {
      Object.values(containers)
        .flat()
        .forEach((container) => {
          fetchRacksByContainer(container.id);
        });
    }
  }, [containers, token]);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await getAllWarehouses(token!);
      if (response.code === "200" && response.data) {
        setWarehouses(response.data);
      } else {
        setError("Failed to fetch warehouses");
      }
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      setError("Failed to fetch warehouses");
    } finally {
      setLoading(false);
    }
  };

  const fetchContainersByWarehouse = async (warehouseId: string) => {
    try {
      const response = await getContainersByWarehouse(token!, warehouseId);
      if (response.code === "200" && response.data) {
        setContainers((prev) => ({
          ...prev,
          [warehouseId]: response.data,
        }));
      }
    } catch (err) {
      console.error(
        `Error fetching containers for warehouse ${warehouseId}:`,
        err
      );
    }
  };

  const fetchRacksByContainer = async (containerId: string) => {
    try {
      const response = await getRacksByContainer(token!, containerId);
      if (response.code === "200" && response.data) {
        setRacks((prev) => ({
          ...prev,
          [containerId]: response.data,
        }));
      }
    } catch (err) {
      console.error(`Error fetching racks for container ${containerId}:`, err);
    }
  };

  const handleCreateWarehouse = async (name: string, description: string) => {
    try {
      setIsCreatingWarehouse(true);
      setError("");

      const response = await createWarehouse(token!, name, description);

      if (response.code === "201" && response.data) {
        setWarehouses((prev) => [...prev, response.data]);
        setIsWarehouseDialogOpen(false);
      } else {
        setError(response.message || "Failed to create warehouse");
      }
    } catch (err) {
      console.error("Error creating warehouse:", err);
      setError("Failed to create warehouse");
    } finally {
      setIsCreatingWarehouse(false);
    }
  };

  const handleCreateContainer = async (
    warehouseId: string,
    name: string,
    description: string
  ) => {
    try {
      setIsCreatingContainer(true);
      setError("");

      const response = await createContainer(token!, warehouseId, name, description);

      if (response.code === "201" && response.data) {
        setContainers((prev) => ({
          ...prev,
          [warehouseId]: [...(prev[warehouseId] || []), response.data],
        }));
        setIsContainerDialogOpen(false);
        setPreselectedWarehouseId("");
      } else {
        setError(response.message || "Failed to create container");
      }
    } catch (err) {
      console.error("Error creating container:", err);
      setError("Failed to create container");
    } finally {
      setIsCreatingContainer(false);
    }
  };

  const handleCreateRack = async (
    containerId: string,
    name: string,
    description: string
  ) => {
    try {
      setIsCreatingRack(true);
      setError("");

      const response = await createRack(token!, containerId, name, description);

      if (response.code === "201" && response.data) {
        setRacks((prev) => ({
          ...prev,
          [containerId]: [...(prev[containerId] || []), response.data],
        }));
        setIsRackDialogOpen(false);
      } else {
        setError(response.message || "Failed to create rack");
      }
    } catch (err) {
      console.error("Error creating rack:", err);
      setError("Failed to create rack");
    } finally {
      setIsCreatingRack(false);
    }
  };

  const handleAddContainer = (warehouseId: string) => {
    setPreselectedWarehouseId(warehouseId);
    setIsContainerDialogOpen(true);
  };

  const handleViewDetails = (warehouseId: string) => {
    console.log("View details:", warehouseId);
    // Implement view details logic
  };

  const handleEdit = (warehouseId: string) => {
    console.log("Edit warehouse:", warehouseId);
    // Implement edit logic
  };

  const handleDelete = (warehouseId: string) => {
    console.log("Delete warehouse:", warehouseId);
    // Implement delete logic
  };

  const clearError = () => {
    setError("");
  };

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((warehouse) =>
      warehouse.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [warehouses, searchQuery]);

  // Calculate statistics
  const totalWarehouses = warehouses.length;
  const totalContainers = Object.values(containers).flat().length;
  const totalRacks = Object.values(racks).flat().length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Warehouses</h1>
          <p className="text-muted-foreground">
            Manage your warehouse locations and storage
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="gap-2"
            onClick={() => setIsWarehouseDialogOpen(true)}
          >
            <Plus size={16} />
            Add Warehouse
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsContainerDialogOpen(true)}
          >
            <Plus size={16} />
            Add Container
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setIsRackDialogOpen(true)}
          >
            <Plus size={16} />
            Add Rack
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <WarehouseStats
        totalWarehouses={totalWarehouses}
        totalContainers={totalContainers}
        totalRacks={totalRacks}
      />

      {/* Search */}
      <WarehouseSearchFilter
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      {/* Warehouses List */}
      <WarehousesList
        warehouses={filteredWarehouses}
        containers={containers}
        racks={racks}
        onViewDetails={handleViewDetails}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddContainer={handleAddContainer}
        onCreateWarehouse={() => setIsWarehouseDialogOpen(true)}
      />

      {/* Dialogs */}
      <CreateWarehouseDialog
        open={isWarehouseDialogOpen}
        onOpenChange={setIsWarehouseDialogOpen}
        onSubmit={handleCreateWarehouse}
        isLoading={isCreatingWarehouse}
        error={error}
        onClearError={clearError}
      />

      <CreateContainerDialog
        open={isContainerDialogOpen}
        onOpenChange={setIsContainerDialogOpen}
        onSubmit={handleCreateContainer}
        warehouses={warehouses}
        isLoading={isCreatingContainer}
        error={error}
        onClearError={clearError}
        preselectedWarehouseId={preselectedWarehouseId}
      />

      <CreateRackDialog
        open={isRackDialogOpen}
        onOpenChange={setIsRackDialogOpen}
        onSubmit={handleCreateRack}
        warehouses={warehouses}
        containers={containers}
        isLoading={isCreatingRack}
        error={error}
        onClearError={clearError}
      />
    </div>
  );
};