// app/stock/out/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  getStockOutById,
  approveStockOut,
  completeStockOut,
  getStockOutWorkflowActions,
} from "@/lib/api/services";
import type { StockOut, StockOutStatus } from "@/lib/api/types";
import {
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Plus,
  Package,
  Layers,
  Box,
  Clock,
  Check,
  User,
  Building,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Settings,
} from "lucide-react";

export default function StockOutDetailPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [stockOut, setStockOut] = useState<StockOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token && id) {
      loadStockOutData();
    }
  }, [token, id]);

  const loadStockOutData = async () => {
    try {
      const response = await getStockOutById(token!, id as string);
      
      if (response.code === "200" && response.data) {
        setStockOut(response.data);
      } else {
        setError("Stock out request not found");
      }
    } catch (err: any) {
      setError(err.message || "Error loading stock out data");
      console.error("Error loading stock out:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!stockOut || !token) return;

    setIsActionLoading(true);
    setError(null);

    try {
      const response = await approveStockOut(token, stockOut.id);
      
      if (response.code === "200") {
        setSuccessMessage("Stock out request approved successfully!");
        await loadStockOutData(); // Reload data
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || "Failed to approve stock out");
      }
    } catch (err: any) {
      setError(err.message || "Failed to approve stock out");
      console.error("Error approving stock out:", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!stockOut || !token) return;

    setIsActionLoading(true);
    setError(null);

    try {
      const response = await completeStockOut(token, stockOut.id);
      
      if (response.code === "200") {
        setSuccessMessage("Stock out request completed successfully!");
        await loadStockOutData(); // Reload data
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || "Failed to complete stock out");
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete stock out");
      console.error("Error completing stock out:", err);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Helper functions
  const getStatusBadgeColor = (status: StockOutStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "approved":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status: StockOutStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "approved":
        return <Check className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getUnitTypeIcon = (unitType: string) => {
    switch (unitType) {
      case "piece": return <Package className="h-3 w-3" />;
      case "pack": return <Layers className="h-3 w-3" />;
      case "box": return <Box className="h-3 w-3" />;
      default: return <Package className="h-3 w-3" />;
    }
  };

  const getUnitTypeColor = (unitType: string) => {
    switch (unitType) {
      case "piece": return "bg-blue-500";
      case "pack": return "bg-green-500";
      case "box": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const calculateTotalValue = () => {
    if (!stockOut?.items) return 0;
    return stockOut.items.reduce((sum, item) => sum + item.total_amount, 0);
  };

  const calculateTotalPieces = () => {
    if (!stockOut?.items) return 0;
    return stockOut.items.reduce((sum, item) => sum + item.total_pieces, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stock out details...</p>
        </div>
      </div>
    );
  }

  if (error && !stockOut) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/stock/out")}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Stock Out List
        </Button>
      </div>
    );
  }

  if (!stockOut) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Stock out request not found.</AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push("/stock/out")}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Stock Out List
        </Button>
      </div>
    );
  }

  const workflowActions = getStockOutWorkflowActions(stockOut.status);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Stock Out Details</h1>
              <p className="text-gray-600">{stockOut.reference_number}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/stock/out")}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
              {workflowActions.canAddItems && (
                <Button
                  onClick={() => router.push(`/stock/out/add-item/${stockOut.id}`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Items
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Stock Out Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Stock Out Information</span>
                  <Badge className={getStatusBadgeColor(stockOut.status)}>
                    {getStatusIcon(stockOut.status)}
                    <span className="ml-1 capitalize">{stockOut.status}</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Reference Number</p>
                        <p className="font-medium">{stockOut.reference_number}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <p className="font-medium">{stockOut.department_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Requestor</p>
                        <p className="font-medium">{stockOut.requestor_name}</p>
                        <p className="text-sm text-gray-500">{stockOut.requestor_username}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Request Date</p>
                        <p className="font-medium">
                          {new Date(stockOut.request_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {stockOut.approved_by && stockOut.approver_username && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Approved By</p>
                          <p className="font-medium">{stockOut.approver_username}</p>
                          {stockOut.approval_date && (
                            <p className="text-sm text-gray-500">
                              {new Date(stockOut.approval_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {stockOut.notes && (
                      <div>
                        <p className="text-sm text-gray-600">Notes</p>
                        <p className="font-medium">{stockOut.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock Out Items */}
            <Card>
              <CardHeader>
                <CardTitle>Stock Out Items ({stockOut.items?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {stockOut.items && stockOut.items.length > 0 ? (
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2 font-medium">Product</th>
                            <th className="text-left py-2 px-2 font-medium">Unit</th>
                            <th className="text-left py-2 px-2 font-medium">Quantity</th>
                            <th className="text-left py-2 px-2 font-medium">Pieces</th>
                            <th className="text-left py-2 px-2 font-medium">Price</th>
                            <th className="text-left py-2 px-2 font-medium">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stockOut.items.map((item, index) => (
                            <tr key={item.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2">
                                <div>
                                  <div className="font-medium">{item.product_name}</div>
                                  <div className="text-sm text-gray-500">{item.part_number}</div>
                                  {item.scanned_barcode && (
                                    <div className="text-xs text-gray-400 font-mono">
                                      {item.scanned_barcode}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  {item.unit_type && (
                                    <Badge className={getUnitTypeColor(item.unit_type)} size="sm">
                                      {getUnitTypeIcon(item.unit_type)}
                                      <span className="ml-1 capitalize">{item.unit_type}</span>
                                    </Badge>
                                  )}
                                  <span className="text-sm">{item.unit_name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <div className="font-medium">{item.quantity}</div>
                              </td>
                              <td className="py-3 px-2">
                                <div className="font-medium text-orange-600">
                                  {item.total_pieces.toLocaleString("id-ID")}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <div className="text-sm">
                                  {item.price_per_unit.toLocaleString("id-ID")} IDR
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <div className="font-medium">
                                  {item.total_amount.toLocaleString("id-ID")} IDR
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary */}
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Items</p>
                          <p className="font-semibold text-lg">{stockOut.items.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Pieces</p>
                          <p className="font-semibold text-lg text-orange-600">
                            {calculateTotalPieces().toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Value</p>
                          <p className="font-semibold text-lg">
                            {calculateTotalValue().toLocaleString("id-ID")} IDR
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Avg Price/Piece</p>
                          <p className="font-semibold text-lg">
                            {calculateTotalPieces() > 0 
                              ? Math.round(calculateTotalValue() / calculateTotalPieces()).toLocaleString("id-ID")
                              : 0} IDR
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Added</h3>
                    <p className="text-gray-600 mb-4">
                      No items have been added to this stock out request yet.
                    </p>
                    {workflowActions.canAddItems && (
                      <Button
                        onClick={() => router.push(`/stock/out/add-item/${stockOut.id}`)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Item
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Actions and Status */}
          <div className="space-y-6">
            {/* Workflow Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workflowActions.canAddItems && (
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/stock/out/add-item/${stockOut.id}`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Items
                  </Button>
                )}

                {workflowActions.canApprove && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        variant="default"
                        disabled={!stockOut.items || stockOut.items.length === 0}>
                        <Check className="h-4 w-4 mr-2" />
                        Approve Request
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Approve Stock Out Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to approve this stock out request? 
                          This action will allow the items to be dispensed.
                          {(!stockOut.items || stockOut.items.length === 0) && (
                            <div className="mt-2 text-red-600">
                              Note: This request has no items added yet.
                            </div>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleApprove}
                          disabled={isActionLoading || !stockOut.items || stockOut.items.length === 0}>
                          {isActionLoading ? "Approving..." : "Approve"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {workflowActions.canComplete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full" variant="default">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Complete Request
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Complete Stock Out Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to complete this stock out request? 
                          This will mark the process as finished and items as dispensed.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleComplete}
                          disabled={isActionLoading}>
                          {isActionLoading ? "Completing..." : "Complete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push(`/stock/out`)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View All Requests
                </Button>
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card>
              <CardHeader>
                <CardTitle>Status Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <Badge className={getStatusBadgeColor(stockOut.status)}>
                    {getStatusIcon(stockOut.status)}
                    <span className="ml-1 capitalize">{stockOut.status}</span>
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Can Add Items:</span>
                    <span className={workflowActions.canAddItems ? "text-green-600" : "text-red-600"}>
                      {workflowActions.canAddItems ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Can Approve:</span>
                    <span className={workflowActions.canApprove ? "text-green-600" : "text-red-600"}>
                      {workflowActions.canApprove ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Can Complete:</span>
                    <span className={workflowActions.canComplete ? "text-green-600" : "text-red-600"}>
                      {workflowActions.canComplete ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Process Flow */}
            <Card>
              <CardHeader>
                <CardTitle>Process Flow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 ${stockOut.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                    <div className={`w-3 h-3 rounded-full ${stockOut.status === 'pending' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                    <span className="text-sm">Request Created</span>
                  </div>
                  <div className={`flex items-center gap-2 ${['approved', 'completed'].includes(stockOut.status) ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-3 h-3 rounded-full ${['approved', 'completed'].includes(stockOut.status) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">Request Approved</span>
                  </div>
                  <div className={`flex items-center gap-2 ${stockOut.status === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-3 h-3 rounded-full ${stockOut.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className="text-sm">Request Completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}