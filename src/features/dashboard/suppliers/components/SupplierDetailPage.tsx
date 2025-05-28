// features/dashboard/suppliers/components/SupplierDetailPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { getSupplierById, deleteSupplier } from "../api";
import type { Supplier } from "../api/types";
import { SupplierDetail } from "./SupplierDetail";

interface SupplierDetailPageProps {
  supplierId: string;
}

export const SupplierDetailPage = ({ supplierId }: SupplierDetailPageProps) => {
  const router = useRouter();
  const { token } = useAuth();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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

  const handleEdit = () => {
    router.push(`/suppliers/edit/${supplierId}`);
  };

  const handleBack = () => {
    router.push("/suppliers");
  };

  const confirmDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!token) return;

    try {
      await deleteSupplier(token, supplierId);
      toast.success("Supplier deleted successfully");
      router.push("/suppliers");
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-36 mt-1" />
          </div>
        </div>

        <div className="space-y-4">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Building2 size={48} className="text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold mb-2">Supplier Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The supplier you're looking for doesn't exist or has been deleted
        </p>
        <Button onClick={handleBack} className="gap-2">
          <ArrowLeft size={16} />
          Back to Suppliers
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <SupplierDetail
        supplier={supplier}
        onEdit={handleEdit}
        onDelete={confirmDelete}
        onBack={handleBack}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              supplier &quot;{supplier.name}&quot; and all related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            // Di SupplierDetail component
            <Button variant="destructive" onClick={onDelete}>
              Delete Supplier
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
