"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ArrowLeft,
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

// API imports
import { getSupplierById, deleteSupplier } from "@/lib/api/services";
import { Supplier } from "@/lib/api/types";
import { useAuth } from "@/context/AuthContext";

export default function SupplierDetailPage({
  params,
}: {
  params: { id: string };
}) {
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
        const response = await getSupplierById(token, params.id);
        if (response.data) {
          setSupplier(response.data);
        } else {
          toast.error("Supplier not found");
          router.push("/dashboard/suppliers");
        }
      } catch (error) {
        console.error("Error fetching supplier:", error);
        toast.error("Failed to load supplier details");
        router.push("/dashboard/suppliers");
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [token, params.id, router]);

  const handleEdit = () => {
    router.push(`/dashboard/suppliers/edit/${params.id}`);
  };

  const handleBack = () => {
    router.push("/dashboard/suppliers");
  };

  const confirmDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!token) return;

    try {
      await deleteSupplier(token, params.id);
      toast.success("Supplier deleted successfully");
      router.push("/dashboard/suppliers");
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>

            <Separator />

            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{supplier.name}</h1>
            <p className="text-muted-foreground">Supplier Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEdit} className="gap-2">
            <Edit size={16} />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            className="gap-2">
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
            <Button variant="outline" onClick={handleBack} className="gap-2">
              <ArrowLeft size={16} />
              Back to Suppliers
            </Button>
            <Button variant="outline" onClick={handleEdit} className="gap-2">
              <Edit size={16} />
              Edit Details
            </Button>
          </div>
        </CardContent>
      </Card>

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
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
