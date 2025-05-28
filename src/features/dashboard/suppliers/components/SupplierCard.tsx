// features/dashboard/suppliers/components/SupplierCard.tsx
"use client";

import { MoreVertical, Edit, Trash2, Eye, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { Supplier } from "../api/types";

interface SupplierCardProps {
  supplier: Supplier;
  onView: (supplierId: string) => void;
  onEdit: (supplierId: string) => void;
  onDelete: (supplierId: string) => void;
}

export const SupplierCard = ({
  supplier,
  onView,
  onEdit,
  onDelete
}: SupplierCardProps) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{supplier.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {supplier.contact_person || "No contact person"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(supplier.id)}>
                <Eye size={14} className="mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(supplier.id)}>
                <Edit size={14} className="mr-2" />
                Edit
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem
                onClick={() => onDelete(supplier.id)}
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
          {/* Contact Info */}
          <div className="space-y-2">
            {supplier.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-muted-foreground" />
                <span className="truncate">{supplier.email}</span>
              </div>
            )}
            {supplier.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-muted-foreground" />
                <span>{supplier.phone}</span>
              </div>
            )}
            {supplier.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-muted-foreground" />
                <span className="text-xs line-clamp-2">
                  {supplier.address}
                </span>
              </div>
            )}
          </div>

          {/* Created Date */}
          <div className="pt-2 border-t text-xs text-muted-foreground flex items-center gap-1">
            <Calendar size={12} />
            Created: {new Date(supplier.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};