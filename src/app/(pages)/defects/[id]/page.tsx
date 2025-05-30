// app/(pages)/defects/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getDefectById, updateDefectStatus } from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { DefectItem, DefectStatus } from "@/lib/api/types";
import {
  ArrowLeft,
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle,
  Package,
  MapPin,
  Calendar,
  User,
  FileText,
  Calculator,
  TrendingDown,
} from "lucide-react";

export default function DefectDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();
  
  const [defect, setDefect] = useState<DefectItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token && id) {
      loadDefectData();
    }
  }, [token, id]);

  const loadDefectData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getDefectById(token!, id as string);
      
      if (response.code === "200" && response.data) {
        setDefect(response.data);
      } else {
        throw new Error(response.message || "Defect not found");
      }
    } catch (err: any) {
      console.error("Error loading defect:", err);
      setError(err.message || "Failed to load defect details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: DefectStatus) => {
    if (!token || !defect) return;

    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await updateDefectStatus(token, defect.id, newStatus);
      
      if (response.code === "200" && response.data) {
        setSuccessMessage(`Defect status updated to ${newStatus}`);
        
        // Update local state
        setDefect(prev => prev ? { ...prev, status: newStatus } : null);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(response.message || "Failed to update status");
      }
    } catch (err: any) {
      console.error("Error updating status:", err);
      setError(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper functions
  const getStatusBadgeColor = (status: DefectStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "returned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: DefectStatus) => {
    switch (status) {
      case "pending":
        return <AlertTriangle className="h-4 w-4" />;
      case "returned":
        return <ArrowLeftRight className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading defect details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !defect) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push("/defects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Defects
          </Button>
        </div>
      </div>
    );
  }

  if (!defect) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Defect report not found.</AlertDescription>
        </Alert>
        <div className="flex justify-center mt-6">
          <Button onClick={() => router.push("/defects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Defects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/defects")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Defects
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Defect Report Details</h1>
              <p className="text-gray-600">Defect ID: {defect.id}</p>
            </div>
            <Badge className={getStatusBadgeColor(defect.status)}>
              {getStatusIcon(defect.status)}
              <span className="ml-1 capitalize">{defect.status}</span>
            </Badge>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-gray-700 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Defect Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Defect Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Defect Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Product</p>
                        <p className="font-medium">{defect.product_name}</p>
                        <p className="text-sm text-gray-500">{defect.part_number}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Defect Type</p>
                        <p className="font-medium">{defect.defect_type}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Defect Quantity</p>
                        <p className="font-medium">
                          {defect.quantity} {defect.unit_name}
                          {defect.unit_abbreviation && (
                            <span className="text-gray-500"> ({defect.unit_abbreviation})</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Defect Date</p>
                        <p className="font-medium">
                          {new Date(defect.defect_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Reported By</p>
                        <p className="font-medium">{defect.reported_by_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Created At</p>
                        <p className="font-medium">{formatDate(defect.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {defect.defect_description && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                    <div className="p-3 bg-gray-700 rounded-md">
                      <p className="text-white">{defect.defect_description}</p>
                    </div>
                  </div>
                )}

                {/* Location Information */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Storage Location
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-700 rounded-md">
                    <div>
                      <p className="text-sm text-white">Warehouse</p>
                      <p className="font-medium">{defect.warehouse_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white">Container</p>
                      <p className="font-medium">{defect.container_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-white">Rack</p>
                      <p className="font-medium">{defect.rack_name}</p>
                    </div>
                  </div>
                </div>

                {/* Source Information */}
                {defect.invoice_code && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Source Stock In</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-gray-700 rounded-md">
                      <div>
                        <p className="text-sm text-white">Invoice Code</p>
                        <p className="font-medium text-white">{defect.invoice_code}</p>
                      </div>
                      {defect.receipt_date && (
                        <div>
                          <p className="text-sm text-white">Receipt Date</p>
                          <p className="font-medium text-white">
                            {new Date(defect.receipt_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calculations */}
            {defect.calculations && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Impact Calculations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-sm text-white">Defect Pieces</p>
                      <p className="text-2xl font-bold text-white">
                        {defect.calculations.defect_pieces.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-sm text-white">Price per Piece</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(defect.calculations.price_per_piece)}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-sm text-white">Estimated Loss</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(defect.calculations.estimated_loss)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Actions and Status */}
          <div className="space-y-6">
            {/* Status Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {defect.status === "pending" && (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          disabled={isUpdating}
                        >
                          <ArrowLeftRight className="mr-2 h-4 w-4" />
                          Return to Supplier
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Return to Supplier?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will mark the defective items as returned to the supplier. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleStatusUpdate("returned")}
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Updating..." : "Return to Supplier"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          disabled={isUpdating}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark as Resolved
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Mark as Resolved?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will mark the defect as resolved internally. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleStatusUpdate("resolved")}
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Updating..." : "Mark as Resolved"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}

                {defect.status !== "pending" && (
                  <div className="p-3 bg-gray-700 rounded-md text-center">
                    <p className="text-sm text-white">
                      This defect has been {defect.status}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Status Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Defect Reported</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(defect.created_at)}
                    </p>
                  </div>
                </div>

                {defect.status === "returned" && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Returned to Supplier</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(defect.updated_at)}
                      </p>
                    </div>
                  </div>
                )}

                {defect.status === "resolved" && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Resolved</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(defect.updated_at)}
                      </p>
                    </div>
                  </div>
                )}

                {defect.status === "pending" && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Pending Action</p>
                      <p className="text-xs text-gray-500">Waiting for resolution</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}