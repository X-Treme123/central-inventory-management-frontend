// features/dashboard/suppliers/components/SuppliersPage.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCcw } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext";
import { getAllSuppliers, deleteSupplier } from "../api";
import type { Supplier } from "../api/types";
import { SupplierStats } from "./SupplierStats";
import { SupplierSearchFilter } from "./SupplierSearchFilter";
import { SuppliersList } from "./SuppliersList";

export const SuppliersPage = () => {
  const router = useRouter();
  const { token } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await getAllSuppliers(token);
      if (response.data) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [token]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const matchesSearch =
        supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery, suppliers]);

  const handleCreateSupplier = () => {
    router.push("/suppliers/create");
  };

  const handleEditSupplier = (supplierId: string) => {
    router.push(`/suppliers/edit/${supplierId}`);
  };

  const handleViewSupplier = (supplierId: string) => {
    router.push(`/suppliers/${supplierId}`);
  };

  const confirmDeleteSupplier = (supplierId: string) => {
    setSupplierToDelete(supplierId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteSupplier = async () => {
    if (!token || !supplierToDelete) return;

    try {
      await deleteSupplier(token, supplierToDelete);
      toast.success("Supplier deleted successfully");
      fetchSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier");
    } finally {
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };

  const handleRefresh = () => {
    fetchSuppliers();
    toast.success("Supplier list refreshed");
  };

  const handleMoreFilters = () => {
    // Implement additional filters functionality
    toast.info("More filters coming soon!");
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier network</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCcw size={16} />
          </Button>
          <Button onClick={handleCreateSupplier} className="gap-2">
            <Plus size={16} />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <SupplierStats suppliers={suppliers} loading={loading} />

      {/* Filters and Search */}
      <SupplierSearchFilter
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onMoreFilters={handleMoreFilters}
      />

      {/* Suppliers Grid */}
      <SuppliersList
        suppliers={filteredSuppliers}
        loading={loading}
        onView={handleViewSupplier}
        onEdit={handleEditSupplier}
        onDelete={confirmDeleteSupplier}
        onCreateSupplier={handleCreateSupplier}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              supplier and all related data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSupplier}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};