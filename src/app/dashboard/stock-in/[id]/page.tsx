// app/dashboard/stock-in/[id]/page.tsx - Updated dengan barcode information display
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Plus, 
  CheckCircle, 
  Package, 
  Layers, 
  Box,
  MapPin,
  Calendar,
  User,
  FileText,
  Scan,
  BarChart3,
  QrCode,
  ShoppingCart,
  TrendingUp
} from "lucide-react";
import { getStockInById, completeStockIn } from "@/lib/api/services";
import type { StockIn } from "@/lib/api/types";

export default function StockInDetailPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const stockInId = params.id as string;

  const [stockIn, setStockIn] = useState<StockIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (token && stockInId) {
      loadStockIn();
    }
  }, [token, stockInId]);

  const loadStockIn = async () => {
    try {
      const response = await getStockInById(token!, stockInId);
      if (response.code === "200" && response.data) {
        setStockIn(response.data);
      }
    } catch (error) {
      console.error("Error loading stock in:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!stockIn || stockIn.status !== "pending") return;

    setIsCompleting(true);
    try {
      const response = await completeStockIn(token!, stockInId);
      if (response.code === "200") {
        alert("Stock in completed successfully!");
        await loadStockIn(); // Reload to get updated status
      } else {
        alert(response.message || "Failed to complete stock in");
      }
    } catch (error: any) {
      console.error("Error completing stock in:", error);
      alert(error.message || "Failed to complete stock in");
    } finally {
      setIsCompleting(false);
    }
  };

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-white';
      case 'completed': return 'bg-green-500 text-white';
      case 'rejected': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getUnitTypeIcon = (unitType: string) => {
    switch (unitType) {
      case 'piece': return <Package className="h-4 w-4" />;
      case 'pack': return <Layers className="h-4 w-4" />;
      case 'box': return <Box className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getUnitTypeColor = (unitType: string) => {
    switch (unitType) {
      case 'piece': return 'bg-blue-500 text-white';
      case 'pack': return 'bg-green-500 text-white';
      case 'box': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalItems = () => {
    return stockIn?.items?.length || 0;
  };

  const getTotalPieces = () => {
    return stockIn?.items?.reduce((sum, item) => sum + item.total_pieces, 0) || 0;
  };

  const getTotalAmount = () => {
    return stockIn?.items?.reduce((sum, item) => sum + item.total_amount, 0) || 0;
  };

  // Group items by unit type untuk analytics
  const getItemsByUnitType = () => {
    if (!stockIn?.items) return { piece: 0, pack: 0, box: 0 };
    
    return stockIn.items.reduce((acc, item) => {
      if (item.unit_type) {
        acc[item.unit_type] = (acc[item.unit_type] || 0) + 1;
      }
      return acc;
    }, { piece: 0, pack: 0, box: 0 } as Record<string, number>);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stock in details...</p>
        </div>
      </div>
    );
  }

  if (!stockIn) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Stock In Not Found</h1>
          <p className="text-gray-600 mb-4">The requested stock in record could not be found.</p>
          <Button onClick={() => router.push("/dashboard/stock-in")}>
            Back to Stock In List
          </Button>
        </div>
      </div>
    );
  }

  const itemsByUnitType = getItemsByUnitType();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/dashboard/stock-in")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stock In List
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Stock In Details</h1>
              <p className="text-gray-600">Invoice: {stockIn.invoice_code}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(stockIn.status)}>
                {stockIn.status.toUpperCase()}
              </Badge>
              {stockIn.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => router.push(`/dashboard/stock-in/add-item/${stockInId}`)}
                    variant="outline"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Scan More Items
                  </Button>
                  {getTotalItems() > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Stock In
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Complete Stock In</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to complete this stock in? 
                            This action cannot be undone and will finalize all {getTotalItems()} items 
                            ({getTotalPieces().toLocaleString()} total pieces).
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleComplete}
                            disabled={isCompleting}
                          >
                            {isCompleting ? "Completing..." : "Complete Stock In"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Basic Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Invoice Code</p>
                <p className="font-semibold">{stockIn.invoice_code}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Supplier</p>
                <p className="font-semibold">{stockIn.supplier_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Receipt Date</p>
                <p className="font-semibold flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(stockIn.receipt_date).toLocaleDateString('id-ID')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Scanning Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <QrCode className="h-4 w-4" />
                Scan Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500 text-white">
                  <Package className="h-3 w-3 mr-1" />
                  {itemsByUnitType.piece}
                </Badge>
                <span className="text-sm">Pieces scanned</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">
                  <Layers className="h-3 w-3 mr-1" />
                  {itemsByUnitType.pack}
                </Badge>
                <span className="text-sm">Packs scanned</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-purple-500 text-white">
                  <Box className="h-3 w-3 mr-1" />
                  {itemsByUnitType.box}
                </Badge>
                <span className="text-sm">Boxes scanned</span>
              </div>
            </CardContent>
          </Card>

          {/* Quantity Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="h-4 w-4" />
                Quantities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Items</p>
                <p className="text-2xl font-bold text-blue-600">{getTotalItems()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Pieces</p>
                <p className="text-2xl font-bold text-green-600">{getTotalPieces().toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Value Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Financial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total Amount</p>
                <p className="text-xl font-bold text-purple-600">{formatCurrency(getTotalAmount())}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Avg per Item</p>
                <p className="font-semibold">
                  {getTotalItems() > 0 ? formatCurrency(getTotalAmount() / getTotalItems()) : formatCurrency(0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Scanned Items ({getTotalItems()})</span>
              {stockIn.status === "pending" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/stock-in/add-item/${stockInId}`)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add More Items
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stockIn.items && stockIn.items.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Barcode Info</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Pricing</TableHead>
                      <TableHead>Checked By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockIn.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.product_name}</div>
                            <div className="text-sm text-gray-600">{item.part_number}</div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-2">
                            {/* Unit Type Badge */}
                            <div className="flex items-center gap-2">
                              <Badge className={getUnitTypeColor(item.unit_type)}>
                                {getUnitTypeIcon(item.unit_type)}
                                <span className="ml-1 capitalize">{item.unit_type}</span>
                              </Badge>
                            </div>
                            
                            {/* Scanned Barcode */}
                            <div className="text-xs">
                              <p className="text-gray-500 mb-1">Scanned Barcode:</p>
                              <code className="bg-gray-800 px-2 py-1 rounded text-xs font-mono">
                                {item.scanned_barcode}
                              </code>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {item.quantity} {item.unit_type}(s)
                            </div>
                            <div className="text-sm text-gray-600">
                              = {item.total_pieces.toLocaleString()} pieces
                            </div>
                            {/* Show conversion for non-piece units */}
                            {item.unit_type !== 'piece' && (
                              <div className="text-xs text-gray-500">
                                {item.unit_type === 'pack' && `1 pack = pieces`}
                                {item.unit_type === 'box' && `1 box = packs = pieces`}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="font-medium">{item.warehouse_name}</span>
                            </div>
                            <div className="text-gray-600 ml-4 space-y-1">
                              <div>{item.container_name}</div>
                              <div>{item.rack_name}</div>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {formatCurrency(item.price_per_unit)}
                            </div>
                            <div className="text-xs text-gray-500">
                              per {item.unit_type}
                            </div>
                            <div className="font-semibold text-green-600">
                              {formatCurrency(item.total_amount)}
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="text-sm font-medium">{item.checked_by_name}</div>
                              <div className="text-xs text-gray-500">
                                {new Date(item.created_at).toLocaleString('id-ID')}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Table Footer dengan Summary */}
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{getTotalItems()}</div>
                      <div className="text-sm text-white">Total Items Scanned</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{getTotalPieces().toLocaleString()}</div>
                      <div className="text-sm text-white">Total Pieces Added</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{formatCurrency(getTotalAmount())}</div>
                      <div className="text-sm text-white">Total Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {itemsByUnitType.piece + itemsByUnitType.pack + itemsByUnitType.box}
                      </div>
                      <div className="text-sm text-white">Barcode Scans</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Scan className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Scanned Yet</h3>
                <p className="text-gray-600 mb-6">
                  Start scanning barcodes to add items to this stock in receipt.
                </p>
                {stockIn.status === "pending" && (
                  <div className="space-y-3">
                    <Button onClick={() => router.push(`/dashboard/stock-in/add-item/${stockInId}`)}>
                      <Scan className="h-4 w-4 mr-2" />
                      Start Scanning Items
                    </Button>
                    <div className="text-sm text-gray-500">
                      Use your iWare barcode scanner to quickly add products
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Receipt Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Receipt Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Invoice Code</p>
                  <p className="font-medium">{stockIn.invoice_code}</p>
                </div>
                {stockIn.packing_list_number && (
                  <div>
                    <p className="text-gray-500">Packing List</p>
                    <p className="font-medium">{stockIn.packing_list_number}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Supplier</p>
                  <p className="font-medium">{stockIn.supplier_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Receipt Date</p>
                  <p className="font-medium">{new Date(stockIn.receipt_date).toLocaleDateString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Received By</p>
                  <p className="font-medium">{stockIn.received_by_name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <Badge className={getStatusColor(stockIn.status)}>
                    {stockIn.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Created At</p>
                  <p className="font-medium">{new Date(stockIn.created_at).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium">{new Date(stockIn.updated_at).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-gray-500">Scanning Method</p>
                  <p className="font-medium flex items-center gap-1">
                    <QrCode className="h-4 w-4" />
                    Barcode Scanner (iWare)
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total Scans</p>
                  <p className="font-medium">
                    {itemsByUnitType.piece + itemsByUnitType.pack + itemsByUnitType.box} barcode scans
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}