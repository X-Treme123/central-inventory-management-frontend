// features/dashboard/suppliers/components/SupplierDetail.tsx
"use client";

import {
  Building2,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Supplier } from "../api/types";

interface SupplierDetailProps {
  supplier: Supplier;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export const SupplierDetail = ({
  supplier,
  onEdit,
  onDelete,
  onBack
}: SupplierDetailProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{supplier.name}</h1>
          <p className="text-muted-foreground">Supplier Details</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit} className="gap-2">
            <Edit size={16} />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            className="gap-2"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 size={18} />
            Supplier Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Company Name
                </h3>
                <p className="text-lg font-medium">{supplier.name}</p>
              </div>

              {supplier.contact_person && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Contact Person
                  </h3>
                  <p className="text-lg font-medium">
                    {supplier.contact_person}
                  </p>
                </div>
              )}

              {supplier.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-muted-foreground" />
                  <span>{supplier.phone}</span>
                </div>
              )}

              {supplier.email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-muted-foreground" />
                  <span>{supplier.email}</span>
                </div>
              )}

              {supplier.address && (
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-muted-foreground" />
                  <span>{supplier.address}</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-muted-foreground" />
                <span className="text-sm">
                  Created on {formatDate(supplier.created_at)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <span className="text-sm">
                  Last updated on {formatDate(supplier.updated_at)}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <ClipboardCheck size={16} className="text-muted-foreground" />
                <span className="text-sm">ID: {supplier.id}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onBack} className="gap-2">
              Back to Suppliers
            </Button>
            <Button variant="outline" onClick={onEdit} className="gap-2">
              <Edit size={16} />
              Edit Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};