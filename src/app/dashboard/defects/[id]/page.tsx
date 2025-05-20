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
import {
  ArrowLeft,
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle,
} from "lucide-react";

export default function DefectDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const router = useRouter();
  const [defect, setDefect] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchDefect = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const response = await getDefectById(token, id);
        if (response && response.data) {
          setDefect(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch defect:", err);
        setError("Failed to load defect details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDefect();
  }, [token, id]);

  const handleStatusUpdate = async (newStatus) => {
    if (!token) return;

    try {
      setUpdating(true);
      const response = await updateDefectStatus(token, id, newStatus);
      if (response && response.data) {
        // Refresh defect data
        const updatedDefect = await getDefectById(token, id);
        if (updatedDefect && updatedDefect.data) {
          setDefect(updatedDefect.data);
        }
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      setError("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // Format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Render status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-600 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "returned":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-600 border-blue-200"
          >
            Returned to Supplier
          </Badge>
        );
      case "resolved":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-600 border-green-200"
          >
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Defect Details</h1>
        <p className="text-gray-500 dark:text-gray-400">
          View and manage defect information
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-60 text-red-500">
          <AlertTriangle className="mr-2 h-5 w-5" /> {error}
        </div>
      ) : defect ? (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Defect Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>Defect Information</CardTitle>
                {getStatusBadge(defect.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Product
                  </h3>
                  <p className="font-medium">{defect.product_name}</p>
                  <p className="text-sm text-gray-500">{defect.part_number}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Defect Type
                  </h3>
                  <p>{defect.defect_type}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Reported Date
                  </h3>
                  <p>{formatDate(defect.defect_date)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Quantity
                  </h3>
                  <p>
                    {defect.quantity} {defect.unit_name}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Reported By
                  </h3>
                  <p>{defect.reported_by_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Created At
                  </h3>
                  <p>{formatDate(defect.created_at)}</p>
                </div>
              </div>

              {defect.defect_description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Description
                  </h3>
                  <p className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {defect.defect_description}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Location
                </h3>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <p>
                    <span className="font-semibold">Warehouse:</span>{" "}
                    {defect.warehouse_name}
                  </p>
                  <p>
                    <span className="font-semibold">Container:</span>{" "}
                    {defect.container_name}
                  </p>
                  <p>
                    <span className="font-semibold">Rack:</span>{" "}
                    {defect.rack_name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {defect.status === "pending" && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        disabled={updating}
                      >
                        <ArrowLeftRight className="mr-2 h-4 w-4" />
                        Mark as Returned to Supplier
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Return to Supplier?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will mark the defective items as returned to the
                          supplier. Are you sure you want to continue?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleStatusUpdate("returned")}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        disabled={updating}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Resolved
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Mark Defect as Resolved?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will mark the defect as resolved internally. Are
                          you sure you want to continue?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleStatusUpdate("resolved")}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {defect.barcodes && defect.barcodes.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                    Affected Barcodes
                  </h3>
                  <div className="max-h-60 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="space-y-2">
                      {defect.barcodes.map((barcode) => (
                        <div
                          key={barcode.id}
                          className="text-xs border border-gray-200 dark:border-gray-700 p-2 rounded"
                        >
                          {barcode.barcode}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex justify-center items-center h-60 text-red-500">
          <AlertTriangle className="mr-2 h-5 w-5" /> Defect not found
        </div>
      )}
    </div>
  );
}