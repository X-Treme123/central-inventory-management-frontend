// features/dashboard/warehouses/components/WarehouseCard.tsx
"use client";

import { motion } from "framer-motion";
import { MoreVertical, Edit, Trash2, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { Warehouses, Container, Rack } from "../api/types";

interface WarehouseCardProps {
  warehouse: Warehouses;
  containers?: Container[];
  racks?: { [containerId: string]: Rack[] };
  index: number;
  onViewDetails: (warehouseId: string) => void;
  onEdit: (warehouseId: string) => void;
  onDelete: (warehouseId: string) => void;
  onAddContainer: (warehouseId: string) => void;
}

export const WarehouseCard = ({
  warehouse,
  containers = [],
  racks = {},
  index,
  onViewDetails,
  onEdit,
  onDelete,
  onAddContainer
}: WarehouseCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
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
                <DropdownMenuItem onClick={() => onViewDetails(warehouse.id)}>
                  <Eye size={14} className="mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(warehouse.id)}>
                  <Edit size={14} className="mr-2" />
                  Edit
                </DropdownMenuItem>
                <Separator className="my-1" />
                <DropdownMenuItem
                  onClick={() => onDelete(warehouse.id)}
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
            {/* Description */}
            <div className="text-sm text-muted-foreground">
              {warehouse.description || "No description available"}
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>
                Created: {new Date(warehouse.created_at).toLocaleDateString()}
              </span>
              <span>•</span>
              <span>
                Updated: {new Date(warehouse.updated_at).toLocaleDateString()}
              </span>
            </div>

            {/* Containers */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium">Containers</span>
                <span>{containers.length} containers</span>
              </div>
              
              {containers.length > 0 ? (
                <div className="space-y-2">
                  {containers.slice(0, 3).map((container) => (
                    <div
                      key={container.id}
                      className="text-sm border p-2 rounded-md"
                    >
                      <div className="font-medium">{container.name}</div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {racks[container.id]?.length || 0} racks
                      </div>
                      {racks[container.id] && racks[container.id].length > 0 && (
                        <div className="pl-2 border-l-2 border-muted mt-1">
                          {racks[container.id].slice(0, 2).map((rack) => (
                            <div
                              key={rack.id}
                              className="text-xs text-muted-foreground"
                            >
                              {rack.name}
                            </div>
                          ))}
                          {racks[container.id].length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{racks[container.id].length - 2} more racks
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {containers.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{containers.length - 3} more containers
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
                  onClick={() => onAddContainer(warehouse.id)}
                >
                  <Plus size={12} className="mr-1" />
                  Add Container
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};