// features/dashboard/suppliers/components/CreateSupplierPage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { createSupplier } from "../api";
import { SupplierForm } from "./SupplierForm";

interface SupplierFormData {
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
}

export const CreateSupplierPage = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: SupplierFormData) => {
    if (!token) {
      toast.error("Authentication error");
      return;
    }

    setLoading(true);

    try {
      const response = await createSupplier(
        token,
        formData.name,
        formData.contact_person || undefined,
        formData.phone || undefined,
        formData.email || undefined,
        formData.address || undefined
      );

      if (response.data) {
        toast.success("Supplier created successfully");
        router.push("/suppliers");
      } else {
        toast.error("Failed to create supplier");
      }
    } catch (error) {
      console.error("Error creating supplier:", error);
      toast.error("Failed to create supplier");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create Supplier</h1>
          <p className="text-muted-foreground">
            Add a new supplier to your network
          </p>
        </div>
      </div>

      {/* Form */}
      <SupplierForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={loading}
        isEdit={false}
      />
    </div>
  );
};