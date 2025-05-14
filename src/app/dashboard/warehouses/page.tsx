'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Warehouse,
  BarChart3,
  MapPin,
  Package,
  AlertTriangle,
  Settings,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

// Mock data based on the provided structure
const mockWarehouses = [
  {
    warehouse_id: 1,
    warehouse_name: "Main Warehouse",
    warehouse_code: "WH-MAIN",
    location: "Gudang Pusat",
    capacity: 1000,
    current_utilization: 750,
    warehouse_type: "GENERAL",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    racks: [
      { name: "Rack A1", capacity: 100, current_load: 75 },
      { name: "Rack A2", capacity: 100, current_load: 60 },
      { name: "Rack B1", capacity: 120, current_load: 90 }
    ]
  },
  {
    warehouse_id: 2,
    warehouse_name: "GA Storage",
    warehouse_code: "WH-GA",
    location: "Gudang Selatan",
    capacity: 500,
    current_utilization: 350,
    warehouse_type: "GA_ONLY",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    racks: [
      { name: "GA Office Supplies", capacity: 80, current_load: 55 },
      { name: "GA IT Equipment", capacity: 60, current_load: 40 },
      { name: "GA Furniture", capacity: 100, current_load: 70 }
    ]
  },
  {
    warehouse_id: 3,
    warehouse_name: "Production Materials",
    warehouse_code: "WH-PROD",
    location: "Gudang Distribusi",
    capacity: 2000,
    current_utilization: 1500,
    warehouse_type: "NON_GA_ONLY",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    racks: [
      { name: "Raw Materials A", capacity: 200, current_load: 180 },
      { name: "Spare Parts", capacity: 150, current_load: 120 },
      { name: "Lubricants & Oils", capacity: 100, current_load: 60 }
    ]
  },
  {
    warehouse_id: 4,
    warehouse_name: "HSE Storage",
    warehouse_code: "WH-HSE",
    location: "Gudang Selatan",
    capacity: 300,
    current_utilization: 200,
    warehouse_type: "SPECIAL",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    racks: [
      { name: "Safety Equipment", capacity: 80, current_load: 50 },
      { name: "Medical Supplies", capacity: 60, current_load: 35 }
    ]
  },
  {
    warehouse_id: 5,
    warehouse_name: "Cold Storage",
    warehouse_code: "WH-COLD",
    location: "Gudang Utama",
    capacity: 200,
    current_utilization: 80,
    warehouse_type: "TEMPERATURE_CONTROLLED",
    status: "under_maintenance",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    racks: [
      { name: "Temperature Controlled A", capacity: 50, current_load: 20 }
    ]
  }
];

const warehouseTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'GENERAL', label: 'General' },
  { value: 'GA_ONLY', label: 'GA Only' },
  { value: 'NON_GA_ONLY', label: 'Production' },
  { value: 'SPECIAL', label: 'Special' },
  { value: 'TEMPERATURE_CONTROLLED', label: 'Cold Storage' }
];

export default function WarehousesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredWarehouses = useMemo(() => {
    return mockWarehouses.filter(warehouse => {
      const matchesSearch = warehouse.warehouse_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           warehouse.warehouse_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           warehouse.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'all' || warehouse.warehouse_type === selectedType;
      const matchesStatus = statusFilter === 'all' || warehouse.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, selectedType, statusFilter]);

  const handleCreateWarehouse = () => {
    console.log('Create warehouse clicked');
  };

  const handleEditWarehouse = (warehouseId: number) => {
    console.log('Edit warehouse:', warehouseId);
  };

  const handleDeleteWarehouse = (warehouseId: number) => {
    console.log('Delete warehouse:', warehouseId);
  };

  const handleViewWarehouse = (warehouseId: number) => {
    console.log('View warehouse:', warehouseId);
  };

  const getWarehouseTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'GENERAL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'GA_ONLY':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'NON_GA_ONLY':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'SPECIAL':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'TEMPERATURE_CONTROLLED':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'under_maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getUtilizationLevel = (utilization: number, capacity: number) => {
    const percentage = (utilization / capacity) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 70) return 'warning';
    return 'normal';
  };

  const getUtilizationColor = (level: string) => {
    switch (level) {
      case 'danger':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const totalCapacity = mockWarehouses.reduce((sum, w) => sum + w.capacity, 0);
  const totalUtilization = mockWarehouses.reduce((sum, w) => sum + w.current_utilization, 0);
  const avgUtilization = (totalUtilization / totalCapacity * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Warehouses</h1>
          <p className="text-muted-foreground">Manage your warehouse locations and storage</p>
        </div>
        <Button onClick={handleCreateWarehouse} className="gap-2">
          <Plus size={16} />
          Add Warehouse
        </Button>
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
                <p className="text-sm text-muted-foreground">Total Warehouses</p>
                <p className="text-2xl font-bold">{mockWarehouses.length}</p>
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
                <p className="text-sm text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold">{totalCapacity.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Utilization</p>
                <p className="text-2xl font-bold">{avgUtilization}%</p>
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
                <p className="text-sm text-muted-foreground">High Utilization</p>
                <p className="text-2xl font-bold">
                  {mockWarehouses.filter(w => (w.current_utilization / w.capacity) * 100 >= 70).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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
            
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {warehouseTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="under_maintenance">Under Maintenance</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter size={14} />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredWarehouses.map((warehouse, index) => (
          <motion.div
            key={warehouse.warehouse_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{warehouse.warehouse_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{warehouse.warehouse_code}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewWarehouse(warehouse.warehouse_id)}>
                        <Eye size={14} className="mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditWarehouse(warehouse.warehouse_id)}>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings size={14} className="mr-2" />
                        Manage Racks
                      </DropdownMenuItem>
                      <Separator className="my-1" />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteWarehouse(warehouse.warehouse_id)}
                        className="text-red-600"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span>{warehouse.location}</span>
                  </div>

                  {/* Type and Status */}
                  <div className="flex gap-2">
                    <Badge className={getWarehouseTypeBadgeColor(warehouse.warehouse_type)}>
                      {warehouse.warehouse_type.replace('_', ' ')}
                    </Badge>
                    <Badge className={getStatusBadgeColor(warehouse.status)}>
                      {warehouse.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  {/* Utilization */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Utilization</span>
                      <span>{warehouse.current_utilization} / {warehouse.capacity}</span>
                    </div>
                    <Progress 
                      value={(warehouse.current_utilization / warehouse.capacity) * 100}
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {((warehouse.current_utilization / warehouse.capacity) * 100).toFixed(1)}% full
                    </div>
                  </div>

                  {/* Racks Summary */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-medium">Racks</span>
                      <span>{warehouse.racks.length} racks</span>
                    </div>
                    <div className="space-y-1">
                      {warehouse.racks.slice(0, 3).map((rack, rackIndex) => (
                        <div key={rackIndex} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{rack.name}</span>
                          <span>{rack.current_load}/{rack.capacity}</span>
                        </div>
                      ))}
                      {warehouse.racks.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{warehouse.racks.length - 3} more racks
                        </div>
                      )}
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
            <Warehouse size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No warehouses found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}