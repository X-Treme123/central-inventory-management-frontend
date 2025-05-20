// app/dashboard/stock-out/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  getStockOutById,
  approveStockOut,
  completeStockOut,
} from "@/lib/api/services";
import { StockOut, StockOutItem } from "@/lib/api/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  CheckCircle,
  Clock,
  XCircle,
  CheckCircle2,
  Calendar,
  User,
  MessageSquare,
  AlertCircle,
  Building,
  Tag,
  Check,
  ThumbsUp,
  Plus,
} from "lucide-react";
import Cookies from "js-cookie";

export default function StockOutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [stockOut, setStockOut] = useState<StockOut | null>(null);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get token from cookie when component loads
  useEffect(() => {
    const storedToken = Cookies.get("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Fetch stock out details when token and ID are available
  useEffect(() => {
    if (!token || !id) return;

    const fetchStockOutDetails = async () => {
      setIsLoading(true);
      try {
        const stockOutResponse = await getStockOutById(token, id);

        if (stockOutResponse.data) {
          setStockOut(stockOutResponse.data);
        }
      } catch (err: any) {
        setError(err.message || "Error fetching stock out details");
        console.error("Error fetching stock out details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockOutDetails();
  }, [token, id]);

  // Handle approve stock out
  const handleApproveStockOut = async () => {
    if (!token || !stockOut) return;

    // Validasi apakah ada item di stock out
    if (!stockOut.items || stockOut.items.length === 0) {
      setError("Cannot approve Stock Out with no items");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const response = await approveStockOut(token, stockOut.id);

      if (response && response.code === "200") {
        // Update stock out status locally
        setStockOut({
          ...stockOut,
          status: "approved",
        });

        setSuccessMessage("Stock Out request approved successfully");

        // Refresh data
        const refreshResponse = await getStockOutById(token, id);
        if (refreshResponse.data) {
          setStockOut(refreshResponse.data);
        }
      } else {
        throw new Error(
          response?.message || "Unknown error approving Stock Out"
        );
      }
    } catch (err: any) {
      console.error("Approve stock out error details:", err);
      setError(err.message || "Failed to approve Stock Out");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle complete stock out
  const handleCompleteStockOut = async () => {
    if (!token || !stockOut) return;

    if (stockOut.status !== "approved") {
      setError("Stock Out must be approved before completion");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccessMessage(null);

      const response = await completeStockOut(token, stockOut.id);

      if (response && response.code === "200") {
        // Update stock out status locally
        setStockOut({
          ...stockOut,
          status: "completed",
        });

        setSuccessMessage("Stock Out marked as completed successfully");

        // Refresh data
        const refreshResponse = await getStockOutById(token, id);
        if (refreshResponse.data) {
          setStockOut(refreshResponse.data);
        }
      } else {
        throw new Error(
          response?.message || "Unknown error completing Stock Out"
        );
      }
    } catch (err: any) {
      console.error("Complete stock out error details:", err);
      setError(err.message || "Failed to complete Stock Out");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Check className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {status}
          </Badge>
        );
    }
  };

  // If loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading stock out details...</p>
        </div>
      </div>
    );
  }

  // If stock out not found
  if (!stockOut) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Stock Out record not found</AlertDescription>
        </Alert>
        <Button
          className="mt-4 gap-2"
          onClick={() => router.push("/dashboard/stock-out")}>
          <ChevronLeft size={16} />
          Back to Stock Out List
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Out Details</h1>
          <p className="text-muted-foreground">
            {stockOut.reference_number} - {stockOut.department_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push("/dashboard/stock-out")}>
            <ChevronLeft size={16} />
            Back to List
          </Button>

          {stockOut.status === "pending" && (
            <>
              {/* Tambahkan tombol Add Item */}
              <Button
                variant="outline"
                className="gap-2"
                onClick={() =>
                  router.push(`/dashboard/stock-out/add-item/${stockOut.id}`)
                }>
                <Plus size={16} />
                Add Item
              </Button>

              <Button
                onClick={handleApproveStockOut}
                disabled={isSubmitting}
                className="gap-2">
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ThumbsUp size={16} />
                    Approve Request
                  </>
                )}
              </Button>
            </>
          )}

          {stockOut.status === "approved" && (
            <Button
              onClick={handleCompleteStockOut}
              disabled={isSubmitting}
              className="gap-2">
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Mark as Completed
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-900/30 border border-green-700 text-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-300" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Stock Out Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Stock Out Information</CardTitle>
            {getStatusBadge(stockOut.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Reference Number:</span>
              </div>
              <p className="text-xl font-semibold">
                {stockOut.reference_number}
              </p>

              <div className="pt-2">
                <div className="flex gap-2 items-center">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Department:</span>
                </div>
                <p>{stockOut.department_name || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Requestor:</span>
              </div>
              <p className="text-lg">{stockOut.requestor_name || "N/A"}</p>
              {stockOut.requestor_username && (
                <p className="text-sm text-gray-500">
                  {stockOut.requestor_username}
                </p>
              )}

              <div className="flex gap-2 items-center pt-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Request Date:</span>
              </div>
              <p>{formatDate(stockOut.request_date)}</p>
            </div>

            <div className="space-y-3">
              {stockOut.approved_by && (
                <>
                  <div className="flex gap-2 items-center">
                    <ThumbsUp className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Approved By:</span>
                  </div>
                  <p>{stockOut.approver_username || "N/A"}</p>
                  {stockOut.approval_date && (
                    <p className="text-sm text-gray-500">
                      on {formatDate(stockOut.approval_date)}
                    </p>
                  )}
                </>
              )}

              {stockOut.notes && (
                <div>
                  <div className="flex gap-2 items-center pt-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Notes:</span>
                  </div>
                  <p className="text-sm">{stockOut.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Out Items */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Out Items</CardTitle>
          <CardDescription>
            List of items included in this Stock Out request
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stockOut.items && stockOut.items.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Total Pieces</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Remaining Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockOut.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product_name || "N/A"}
                        <div className="text-xs text-gray-500">
                          {item.part_number}
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        {item.unit_name} ({item.unit_abbreviation})
                      </TableCell>
                      <TableCell>
                        {item.total_pieces.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(item.price_per_unit)}
                        <div className="text-xs text-gray-500">
                          Total: {formatCurrency(item.total_amount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.remaining_stock !== undefined
                          ? item.remaining_stock.toLocaleString()
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No items found</h3>
              <p className="text-sm text-gray-500">
                This Stock Out request does not have any items
              </p>
            </div>
          )}

          {stockOut.items && stockOut.items.length > 0 && (
            <div className="mt-6 p-4 bg-gray-700 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="text-lg font-medium">{stockOut.items.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Pieces</p>
                  <p className="text-lg font-medium">
                    {stockOut.items
                      .reduce((sum, item) => sum + item.total_pieces, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-lg font-medium">
                    {formatCurrency(
                      stockOut.items.reduce(
                        (sum, item) => sum + item.total_amount,
                        0
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
