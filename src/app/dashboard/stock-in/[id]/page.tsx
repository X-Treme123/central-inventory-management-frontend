// app/dashboard/stock-in/[id]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  getStockInById,
  getBarcodesByStockInItem,
  completeStockIn,
  reportDefect,
  getAllUnits,
} from "@/lib/api/services";
import { StockIn, StockInItem, ProductBarcode, Unit } from "@/lib/api/types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Truck,
  BarChart4,
  Calendar,
  User,
  MessageSquare,
  Tags,
  AlertCircle,
  BadgeAlert,
  ShieldAlert,
  Plus,
} from "lucide-react";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, PackageOpen, Boxes } from "lucide-react";

export default function StockInDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [stockIn, setStockIn] = useState<StockIn | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [barcodes, setBarcodes] = useState<ProductBarcode[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // For defect reporting
  const [defectUnitId, setDefectUnitId] = useState("");
  const [defectQuantity, setDefectQuantity] = useState<number>(1);
  const [defectType, setDefectType] = useState("");
  const [defectDescription, setDefectDescription] = useState("");

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isBarcodesLoading, setIsBarcodesLoading] = useState(false);
  const [showDefectDialog, setShowDefectDialog] = useState(false);

  // Get token from cookie when component loads
  useEffect(() => {
    const storedToken = Cookies.get("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Fetch stock in details when token and ID are available
  useEffect(() => {
    if (!token || !id) return;

    const fetchStockInDetails = async () => {
      setIsLoading(true);
      try {
        const [stockInResponse, unitsResponse] = await Promise.all([
          getStockInById(token, id),
          getAllUnits(token),
        ]);

        if (stockInResponse.data) {
          setStockIn(stockInResponse.data);
        }

        if (unitsResponse.data) {
          setUnits(unitsResponse.data);
        }
      } catch (err: any) {
        setError(err.message || "Error fetching stock in details");
        console.error("Error fetching stock in details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockInDetails();
  }, [token, id]);

  // Fetch barcodes when an item is selected
  useEffect(() => {
    if (!token || !selectedItemId) return;

    const fetchBarcodes = async () => {
      setIsBarcodesLoading(true);
      try {
        const response = await getBarcodesByStockInItem(token, selectedItemId);
        if (response.data) {
          setBarcodes(response.data);
        }
      } catch (err: any) {
        console.error("Error fetching barcodes:", err);
      } finally {
        setIsBarcodesLoading(false);
      }
    };

    fetchBarcodes();
  }, [token, selectedItemId]);

  // Handle complete stock in
  const handleCompleteStockIn = async () => {
    if (!token || !stockIn) return;

    // Validasi apakah ada item di stock in
    if (!stockIn.items || stockIn.items.length === 0) {
      setError("Cannot complete Stock In with no items");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Log untuk debugging
      console.log("Completing stock in:", stockIn.id);

      // Tambahkan headers dan query params yang diperlukan
      const response = await completeStockIn(token, stockIn.id);

      console.log("Complete stock in response:", response);

      if (response && response.code === "200") {
        // Update stock in status locally
        setStockIn({
          ...stockIn,
          status: "completed",
        });

        setSuccessMessage("Stock In marked as completed successfully");

        // Refresh data setelah 1 detik
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        throw new Error(
          response?.message || "Unknown error completing Stock In"
        );
      }
    } catch (err: any) {
      console.error("Complete stock in error details:", err);
      setError(err.message || "Failed to complete Stock In");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle report defect
  const handleReportDefect = async () => {
    if (!token || !selectedItemId) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await reportDefect(token, {
        stock_in_item_id: selectedItemId,
        unit_id: defectUnitId,
        quantity: defectQuantity,
        defect_type: defectType,
        defect_description: defectDescription,
      });

      setSuccessMessage("Defect reported successfully");
      setShowDefectDialog(false);

      // Reset defect form
      setDefectUnitId("");
      setDefectQuantity(1);
      setDefectType("");
      setDefectDescription("");

      // Refresh stock in details
      const response = await getStockInById(token, id);
      if (response.data) {
        setStockIn(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to report defect");
      console.error("Error reporting defect:", err);
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

  // Get unit type icon
  const getUnitTypeIcon = (unitType: string) => {
    switch (unitType) {
      case "piece":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "pack":
        return <PackageOpen className="h-4 w-4 text-green-500" />;
      case "box":
        return <Boxes className="h-4 w-4 text-purple-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  // If loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading stock in details...</p>
        </div>
      </div>
    );
  }

  // If stock in not found
  if (!stockIn) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Stock In record not found</AlertDescription>
        </Alert>
        <Button
          className="mt-4 gap-2"
          onClick={() => router.push("/dashboard/stock-in")}>
          <ChevronLeft size={16} />
          Back to Stock In List
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock In Details</h1>
          <p className="text-muted-foreground">
            {stockIn.invoice_code} - {stockIn.supplier_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push("/dashboard/stock-in")}>
            <ChevronLeft size={16} />
            Back to List
          </Button>

          {stockIn.status === "pending" && (
            <>
              {/* Tambahkan tombol Add Item */}
              <Button
                variant="outline"
                className="gap-2"
                onClick={() =>
                  router.push(`/dashboard/stock-in/add-item/${stockIn.id}`)
                }>
                <Plus size={16} />
                Add Item
              </Button>

              <Button
                onClick={handleCompleteStockIn}
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
            </>
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

      {/* Stock In Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Stock In Information</CardTitle>
            {getStatusBadge(stockIn.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <Tags className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Invoice Code:</span>
              </div>
              <p className="text-xl font-semibold">{stockIn.invoice_code}</p>

              {stockIn.packing_list_number && (
                <div className="pt-2">
                  <div className="flex gap-2 items-center">
                    <Tags className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      Packing List Number:
                    </span>
                  </div>
                  <p>{stockIn.packing_list_number}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <Truck className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Supplier:</span>
              </div>
              <p className="text-lg">{stockIn.supplier_name || "N/A"}</p>

              <div className="flex gap-2 items-center pt-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Receipt Date:</span>
              </div>
              <p>{formatDate(stockIn.receipt_date)}</p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Received By:</span>
              </div>
              <p>{stockIn.received_by_name || "N/A"}</p>

              {stockIn.notes && (
                <div>
                  <div className="flex gap-2 items-center pt-2">
                    <MessageSquare className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">Notes:</span>
                  </div>
                  <p className="text-sm">{stockIn.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Tab */}
      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items" className="gap-2">
            <Package size={16} />
            Items ({stockIn.items?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="barcodes" className="gap-2">
            <BarChart4 size={16} />
            Barcodes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock In Items</CardTitle>
              <CardDescription>
                List of items included in this Stock In record
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stockIn.items && stockIn.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Total Pieces</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockIn.items.map((item) => (
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
                            {(item.packs_per_box || item.pieces_per_pack) && (
                              <div className="text-xs text-gray-500">
                                {item.packs_per_box &&
                                  `${item.packs_per_box} packs/box`}
                                {item.packs_per_box &&
                                  item.pieces_per_pack &&
                                  ", "}
                                {item.pieces_per_pack &&
                                  `${item.pieces_per_pack} pcs/pack`}
                              </div>
                            )}
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
                            {item.warehouse_name} / {item.container_name} /{" "}
                            {item.rack_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-2 text-xs"
                                onClick={() => {
                                  setSelectedItemId(item.id);
                                  setDefectUnitId(item.unit_id);
                                }}>
                                View Barcodes
                              </Button>

                              {stockIn.status === "completed" && (
                                <Dialog
                                  open={
                                    showDefectDialog &&
                                    selectedItemId === item.id
                                  }
                                  onOpenChange={(open) => {
                                    setShowDefectDialog(open);
                                    if (open) {
                                      setSelectedItemId(item.id);
                                      setDefectUnitId(item.unit_id);
                                    }
                                  }}>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 px-2 text-xs text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                                      onClick={() => {
                                        setSelectedItemId(item.id);
                                        setDefectUnitId(item.unit_id);
                                      }}>
                                      <ShieldAlert className="h-3 w-3 mr-1" />
                                      Report Defect
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>
                                        Report Defective Items
                                      </DialogTitle>
                                      <DialogDescription>
                                        Report defective items found in the
                                        selected product
                                      </DialogDescription>
                                    </DialogHeader>

                                    <div className="py-4">
                                      <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm">
                                        <div className="font-medium text-blue-700">
                                          Product Information
                                        </div>
                                        <p>
                                          {item.product_name} (
                                          {item.part_number})
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          Total pieces:{" "}
                                          {item.total_pieces.toLocaleString()}
                                        </p>
                                      </div>

                                      <div className="space-y-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="defect-unit">
                                            Unit Type{" "}
                                            <span className="text-red-500">
                                              *
                                            </span>
                                          </Label>
                                          <Select
                                            value={defectUnitId}
                                            onValueChange={setDefectUnitId}>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {units.map((unit) => (
                                                <SelectItem
                                                  key={unit.id}
                                                  value={unit.id}>
                                                  {unit.name} (
                                                  {unit.abbreviation})
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor="defect-quantity">
                                            Quantity{" "}
                                            <span className="text-red-500">
                                              *
                                            </span>
                                          </Label>
                                          <Input
                                            id="defect-quantity"
                                            type="number"
                                            min="1"
                                            value={defectQuantity}
                                            onChange={(e) =>
                                              setDefectQuantity(
                                                parseInt(e.target.value) || 1
                                              )
                                            }
                                            required
                                          />
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor="defect-type">
                                            Defect Type{" "}
                                            <span className="text-red-500">
                                              *
                                            </span>
                                          </Label>
                                          <Select
                                            value={defectType}
                                            onValueChange={setDefectType}>
                                            <SelectTrigger>
                                              <SelectValue placeholder="Select defect type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="Damaged Packaging">
                                                Damaged Packaging
                                              </SelectItem>
                                              <SelectItem value="Broken Item">
                                                Broken Item
                                              </SelectItem>
                                              <SelectItem value="Missing Parts">
                                                Missing Parts
                                              </SelectItem>
                                              <SelectItem value="Quality Issues">
                                                Quality Issues
                                              </SelectItem>
                                              <SelectItem value="Incorrect Item">
                                                Incorrect Item
                                              </SelectItem>
                                              <SelectItem value="Expired Item">
                                                Expired Item
                                              </SelectItem>
                                              <SelectItem value="Other">
                                                Other
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        <div className="space-y-2">
                                          <Label htmlFor="defect-description">
                                            Description
                                          </Label>
                                          <Textarea
                                            id="defect-description"
                                            placeholder="Describe the defect in detail..."
                                            value={defectDescription}
                                            onChange={(e) =>
                                              setDefectDescription(
                                                e.target.value
                                              )
                                            }
                                            rows={3}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        onClick={() =>
                                          setShowDefectDialog(false)
                                        }>
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={handleReportDefect}
                                        disabled={
                                          !defectUnitId ||
                                          !defectType ||
                                          isSubmitting
                                        }
                                        className="gap-2">
                                        {isSubmitting ? (
                                          <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                            Processing...
                                          </>
                                        ) : (
                                          <>
                                            <BadgeAlert size={16} />
                                            Report Defect
                                          </>
                                        )}
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No items found</h3>
                  <p className="text-sm text-gray-500">
                    This Stock In record does not have any items
                  </p>
                </div>
              )}

              {stockIn.items && stockIn.items.length > 0 && (
                <div className="mt-6 p-4 bg-gray-700 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Total Items</p>
                      <p className="text-lg font-medium">
                        {stockIn.items.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Pieces</p>
                      <p className="text-lg font-medium">
                        {stockIn.items
                          .reduce((sum, item) => sum + item.total_pieces, 0)
                          .toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Value</p>
                      <p className="text-lg font-medium">
                        {formatCurrency(
                          stockIn.items.reduce(
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
        </TabsContent>

        <TabsContent value="barcodes" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Barcodes</CardTitle>
              <CardDescription>
                View barcodes for the selected product
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedItemId ? (
                <div className="text-center py-8">
                  <BarChart4 className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">
                    No product selected
                  </h3>
                  <p className="text-sm text-gray-500">
                    Select "View Barcodes" on a product to view its barcodes
                  </p>
                </div>
              ) : isBarcodesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading barcodes...</p>
                </div>
              ) : barcodes.length > 0 ? (
                <div className="space-y-4 ">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">
                        Selected Product:
                      </span>
                      <p className="font-medium">
                        {stockIn.items?.find((i) => i.id === selectedItemId)
                          ?.product_name || "N/A"}
                        {" - "}
                        {stockIn.items?.find((i) => i.id === selectedItemId)
                          ?.part_number || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">
                        Total Barcodes:
                      </span>
                      <p className="font-medium">{barcodes.length}</p>
                    </div>
                  </div>

                  <div className="border rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2 bg-muted/30 rounded-t-md border-b border-muted-foreground/10">
                      <div className="font-medium text-sm">Barcode</div>
                      <div className="font-medium text-sm">Unit Type</div>
                      <div className="font-medium text-sm">Status</div>
                    </div>

                    <ScrollArea className="h-96">
                      {barcodes.map((barcode) => (
                        <div
                          key={barcode.id}
                          className={`grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border-b last:border-b-0 ${
                            barcode.is_defect ? "bg-red-900/30" : "bg-muted/20"
                          }`}>
                          <div>
                            <code className="px-1.5 py-0.5 bg-gray-100 text-black rounded text-sm">
                              {barcode.barcode}
                            </code>
                          </div>
                          <div className="flex items-center gap-2">
                            {getUnitTypeIcon(barcode.unit_type)}
                            <span className="capitalize">
                              {barcode.unit_type}
                            </span>
                          </div>
                          <div>
                            {barcode.is_defect ? (
                              <div>
                                <Badge className="bg-red-900/50 text-red-300 border border-red-700">
                                  <ShieldAlert className="h-3 w-3 mr-1" />
                                  Defective
                                </Badge>
                                {barcode.defect_notes && (
                                  <p className="text-xs text-red-600 mt-1">
                                    {barcode.defect_notes}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <Badge className="bg-green-900/50 text-green-300 border border-green-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Good
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedItemId(null);
                        setBarcodes([]);
                      }}>
                      Clear Selection
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">
                    No barcodes found
                  </h3>
                  <p className="text-sm text-gray-500">
                    No barcodes available for the selected product
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
