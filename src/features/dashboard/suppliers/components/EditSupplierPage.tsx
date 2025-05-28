// features/dashboard/suppliers/components/EditSupplierPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getSupplierById, updateSupplier } from "../api";
import type { Supplier } from "../api/types";
import { SupplierForm } from "./SupplierForm";

interface EditSupplierPageProps {
  supplierId: string;
}

interface SupplierFormData {
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
}

export const EditSupplierPage = ({ supplierId }: EditSupplierPageProps) => {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [supplier, setSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const response = await getSupplierById(token, supplierId);
        if (response.data) {
          setSupplier(response.data);
        } else {
          toast.error("Supplier not found");
          router.push("/suppliers");
        }
      } catch (error) {
        console.error("Error fetching supplier:", error);
        toast.error("Failed to load supplier details");
        router.push("/suppliers");
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [token, supplierId, router]);

  const handleSubmit = async (formData: SupplierFormData) => {
    if (!token) {
      toast.error("Authentication error");
      return;
    }

    setSaving(true);

    try {
      const response = await updateSupplier(token, supplierId, {
        name: formData.name,
        contact_person: formData.contact_person || null,
        phone: formData.phone || null,
        email: formData.email || null,
        address: formData.address || null,
      });

      if (response.data) {
        toast.success("Supplier updated successfully");
        router.push(`/suppliers/${supplierId}`);
      } else {
        toast.error("Failed to update supplier");
      }
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("Failed to update supplier");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-36 mt-1" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h1 className="text-xl font-bold mb-2">Supplier Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The supplier you're looking for doesn't exist or has been deleted
        </p>
        <Button onClick={() => router.push("/suppliers")} className="gap-2">
          <ArrowLeft size={16} />
          Back to Suppliers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Supplier</h1>
          <p className="text-muted-foreground">Update supplier information</p>
        </div>
      </div>

      {/* Form */}
      <SupplierForm
        initialData={supplier}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={saving}
        isEdit={true}
      />
    </div>
  );
};