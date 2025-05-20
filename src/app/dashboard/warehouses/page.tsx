"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Filter,
  Warehouse,
  Package,
  BarChart3,
  MapPin,
  AlertTriangle,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuth } from "@/context/AuthContext";
import {
  createWarehouse,
  getAllWarehouses,
  createContainer,
  getContainersByWarehouse,
  createRack,
  getRacksByContainer,
} from "@/lib/api/services";
import type { Warehouse, Container, Rack } from "@/lib/api/types";

export default function WarehousesPage() {
  const { token } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [containers, setContainers] = useState<{
    [warehouseId: string]: Container[];
  }>({});
  const [racks, setRacks] = useState<{ [containerId: string]: Rack[] }>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog states
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [isContainerDialogOpen, setIsContainerDialogOpen] = useState(false);
  const [isRackDialogOpen, setIsRackDialogOpen] = useState(false);

  // Form states
  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    description: "",
  });
  const [newContainer, setNewContainer] = useState({
    warehouse_id: "",
    name: "",
    description: "",
  });
  const [newRack, setNewRack] = useState({
    container_id: "",
    name: "",
    description: "",
  });

  // Loading states
  const [isCreatingWarehouse, setIsCreatingWarehouse] = useState(false);
  const [isCreatingContainer, setIsCreatingContainer] = useState(false);
  const [isCreatingRack, setIsCreatingRack] = useState(false);

  // Error states
  const [error, setError] = useState("");

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
      const response = await getAllWarehouses(token);
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
      const response = await getContainersByWarehouse(token, warehouseId);
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
      const response = await getRacksByContainer(token, containerId);
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

  const handleCreateWarehouse = async () => {
    try {
      setIsCreatingWarehouse(true);
      setError("");

      if (!newWarehouse.name.trim()) {
        setError("Warehouse name is required");
        return;
      }

      const response = await createWarehouse(
        token,
        newWarehouse.name,
        newWarehouse.description
      );

      if (response.code === "201" && response.data) {
        setWarehouses((prev) => [...prev, response.data]);
        setNewWarehouse({ name: "", description: "" });
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

  const handleCreateContainer = async () => {
    try {
      setIsCreatingContainer(true);
      setError("");

      if (!newContainer.name.trim()) {
        setError("Container name is required");
        return;
      }

      if (!newContainer.warehouse_id) {
        setError("Please select a warehouse");
        return;
      }

      const response = await createContainer(
        token,
        newContainer.warehouse_id,
        newContainer.name,
        newContainer.description
      );

      if (response.code === "201" && response.data) {
        setContainers((prev) => ({
          ...prev,
          [newContainer.warehouse_id]: [
            ...(prev[newContainer.warehouse_id] || []),
            response.data,
          ],
        }));
        setNewContainer({ warehouse_id: "", name: "", description: "" });
        setIsContainerDialogOpen(false);
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

  const handleCreateRack = async () => {
    try {
      setIsCreatingRack(true);
      setError("");

      if (!newRack.name.trim()) {
        setError("Rack name is required");
        return;
      }

      if (!newRack.container_id) {
        setError("Please select a container");
        return;
      }

      const response = await createRack(
        token,
        newRack.container_id,
        newRack.name,
        newRack.description
      );

      if (response.code === "201" && response.data) {
        setRacks((prev) => ({
          ...prev,
          [newRack.container_id]: [
            ...(prev[newRack.container_id] || []),
            response.data,
          ],
        }));
        setNewRack({ container_id: "", name: "", description: "" });
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
          <Dialog
            open={isWarehouseDialogOpen}
            onOpenChange={setIsWarehouseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                Add Warehouse
              </Button>
            </DialogTrigger>
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
                  <button onClick={() => setError("")}>
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Warehouse Name *</Label>
                  <Input
                    id="name"
                    value={newWarehouse.name}
                    onChange={(e) =>
                      setNewWarehouse((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter warehouse name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newWarehouse.description}
                    onChange={(e) =>
                      setNewWarehouse((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter warehouse description (optional)"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleCreateWarehouse}
                  disabled={isCreatingWarehouse}>
                  {isCreatingWarehouse ? "Creating..." : "Create Warehouse"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={isContainerDialogOpen}
            onOpenChange={setIsContainerDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus size={16} />
                Add Container
              </Button>
            </DialogTrigger>
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
                  <button onClick={() => setError("")}>
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="warehouse_id">Select Warehouse *</Label>
                  <Select
                    value={newContainer.warehouse_id}
                    onValueChange={(value) =>
                      setNewContainer((prev) => ({
                        ...prev,
                        warehouse_id: value,
                      }))
                    }>
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
                    value={newContainer.name}
                    onChange={(e) =>
                      setNewContainer((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Enter container name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="container-description">Description</Label>
                  <Textarea
                    id="container-description"
                    value={newContainer.description}
                    onChange={(e) =>
                      setNewContainer((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter container description (optional)"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  onClick={handleCreateContainer}
                  disabled={isCreatingContainer}>
                  {isCreatingContainer ? "Creating..." : "Create Container"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isRackDialogOpen} onOpenChange={setIsRackDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus size={16} />
                Add Rack
              </Button>
            </DialogTrigger>
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
                  <button onClick={() => setError("")}>
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="warehouse-select">Select Warehouse</Label>
                  <Select
                    onValueChange={(warehouseId) => {
                      setNewRack((prev) => ({ ...prev, container_id: "" }));
                    }}>
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
                    value={newRack.container_id}
                    onValueChange={(value) =>
                      setNewRack((prev) => ({ ...prev, container_id: value }))
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a container" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(containers)
                        .flat()
                        .map((container) => (
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
                    value={newRack.name}
                    onChange={(e) =>
                      setNewRack((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter rack name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rack-description">Description</Label>
                  <Textarea
                    id="rack-description"
                    value={newRack.description}
                    onChange={(e) =>
                      setNewRack((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter rack description (optional)"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateRack} disabled={isCreatingRack}>
                  {isCreatingRack ? "Creating..." : "Create Rack"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Warehouse className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Warehouses
                </p>
                <p className="text-2xl font-bold">{totalWarehouses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Containers</p>
                <p className="text-2xl font-bold">{totalContainers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Racks</p>
                <p className="text-2xl font-bold">{totalRacks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Average Utilization
                </p>
                <p className="text-2xl font-bold">--</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search warehouses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                icon={<Search size={16} />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warehouses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredWarehouses.map((warehouse, index) => (
          <motion.div
            key={warehouse.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      ID: {warehouse.id.substring(0, 8)}...
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          console.log("View details:", warehouse.id)
                        }>
                        <Eye size={14} className="mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          console.log("Edit warehouse:", warehouse.id)
                        }>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <Separator className="my-1" />
                      <DropdownMenuItem
                        onClick={() =>
                          console.log("Delete warehouse:", warehouse.id)
                        }
                        className="text-red-600">
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Description */}
                  <div className="text-sm text-muted-foreground">
                    {warehouse.description || "No description available"}
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      Created:{" "}
                      {new Date(warehouse.created_at).toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>
                      Updated:{" "}
                      {new Date(warehouse.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Containers */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">Containers</span>
                      <span>
                        {containers[warehouse.id]?.length || 0} containers
                      </span>
                    </div>
                    {containers[warehouse.id] &&
                    containers[warehouse.id].length > 0 ? (
                      <div className="space-y-2">
                        {containers[warehouse.id]
                          .slice(0, 3)
                          .map((container) => (
                            <div
                              key={container.id}
                              className="text-sm border p-2 rounded-md">
                              <div className="font-medium">
                                {container.name}
                              </div>
                              <div className="text-xs text-muted-foreground mb-1">
                                {racks[container.id]?.length || 0} racks
                              </div>
                              {racks[container.id] &&
                                racks[container.id].length > 0 && (
                                  <div className="pl-2 border-l-2 border-muted mt-1">
                                    {racks[container.id]
                                      .slice(0, 2)
                                      .map((rack) => (
                                        <div
                                          key={rack.id}
                                          className="text-xs text-muted-foreground">
                                          {rack.name}
                                        </div>
                                      ))}
                                    {racks[container.id].length > 2 && (
                                      <div className="text-xs text-muted-foreground">
                                        +{racks[container.id].length - 2} more
                                        racks
                                      </div>
                                    )}
                                  </div>
                                )}
                            </div>
                          ))}
                        {containers[warehouse.id].length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{containers[warehouse.id].length - 3} more
                            containers
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        No containers yet
                      </div>
                    )}
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 w-full"
                        onClick={() => {
                          setNewContainer((prev) => ({
                            ...prev,
                            warehouse_id: warehouse.id,
                          }));
                          setIsContainerDialogOpen(true);
                        }}>
                        <Plus size={12} className="mr-1" />
                        Add Container
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredWarehouses.length === 0 && (
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
            <Button
              className="mt-4"
              onClick={() => setIsWarehouseDialogOpen(true)}>
              <Plus size={16} className="mr-2" />
              Create Warehouse
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
