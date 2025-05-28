// app/(dashboard)/stock/out/scan/[id]/page.tsx - POS Style Scanning
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getStockOutById,
  scanBarcodeForStockOut,
  getStockByBarcode,
  completeStockOut,
} from "@/lib/api/services";
import { StockOut, StockOutScanResponse } from "@/lib/api/types";
import Cookies from "js-cookie";
import {
  Scan,
  Package,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Clock,
  Trash2,
  ChevronLeft,
  ShoppingCart,
  Zap,
  TrendingDown,
  Eye,
} from "lucide-react";

interface ScanTransaction {
  id: string;
  timestamp: string;
  barcode: string;
  product_name: string;
  part_number: string;
  unit_type: string;
  quantity: number;
  pieces_deducted: number;
  price_per_piece: number;
  total_amount: number;
  remaining_stock: number;
}

export default function StockOutScanPage() {
  const { id } = useParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // State untuk stock out header
  const [stockOut, setStockOut] = useState<StockOut | null>(null);
  
  // State untuk scanning
  const [barcodeInput, setBarcodeInput] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isScanning, setIsScanning] = useState(false);
  const [scanTransactions, setScanTransactions] = useState<ScanTransaction[]>([]);
  
  // State untuk stock check
  const [currentProductStock, setCurrentProductStock] = useState<any>(null);
  const [showStockInfo, setShowStockInfo] = useState(false);
  
  // UI states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get token from cookie
  useEffect(() => {
    const storedToken = Cookies.get("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Fetch stock out details
  useEffect(() => {
    if (!token || !id) return;

    const fetchStockOut = async () => {
      setIsLoading(true);
      try {
        const response = await getStockOutById(token, id as string);
        if (response.data) {
          setStockOut(response.data);
          
          // Check status - hanya allow scan jika masih pending atau approved
          if (response.data.status === 'completed' || response.data.status === 'rejected') {
            setError("Cannot scan items for completed or rejected stock out request");
          }
        } else {
          setError("Stock out request not found");
        }
      } catch (err: any) {
        setError(err.message || "Error loading stock out details");
        console.error("Error fetching stock out:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockOut();
  }, [token, id]);

  // Auto focus ke barcode input
  useEffect(() => {
    if (!isLoading && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [isLoading]);

  // Handle barcode scan/input
  const handleBarcodeScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !barcodeInput.trim()) return;
    
    if (quantity < 1) {
      setError("Quantity harus minimal 1");
      return;
    }

    setIsScanning(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Lakukan scan barcode untuk stock out
      const response = await scanBarcodeForStockOut(token, barcodeInput.trim(), quantity);
      
      if (response.code === "200" && response.data) {
        const scanData = response.data;
        
        // Tambahkan ke transaction history
        const newTransaction: ScanTransaction = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          barcode: scanData.transaction.scanned_barcode,
          product_name: scanData.product.name,
          part_number: scanData.product.part_number,
          unit_type: scanData.transaction.unit_type,
          quantity: scanData.transaction.quantity_scanned,
          pieces_deducted: scanData.transaction.pieces_deducted,
          price_per_piece: scanData.transaction.price_per_piece,
          total_amount: scanData.transaction.total_amount_deducted,
          remaining_stock: scanData.stock_info.total_remaining_all_locations,
        };
        
        setScanTransactions(prev => [newTransaction, ...prev]);
        
        setSuccessMessage(
          `✅ ${scanData.product.name} berhasil di-scan! 
          ${scanData.transaction.pieces_deducted} pieces dikurangi. 
          Sisa stock: ${scanData.stock_info.total_remaining_all_locations} pieces`
        );
        
        // Reset form
        setBarcodeInput("");
        setQuantity(1);
        setCurrentProductStock(null);
        setShowStockInfo(false);
        
        // Focus kembali ke barcode input
        setTimeout(() => {
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
          }
        }, 100);
        
      } else {
        throw new Error(response.message || "Failed to scan barcode");
      }
    } catch (err: any) {
      console.error("Scan error:", err);
      
      // Parse error message untuk user-friendly display
      let errorMessage = "Gagal scan barcode";
      try {
        const errorData = JSON.parse(err.message);
        errorMessage = errorData.message || errorMessage;
        
        // Tampilkan info detail jika insufficient stock
        if (errorData.data) {
          const data = errorData.data;
          setError(
            `${errorMessage}. 
            Product: ${data.product_name} (${data.part_number}). 
            Diminta: ${data.requested_pieces} pieces, 
            Tersedia: ${data.available_pieces} pieces`
          );
          return;
        }
      } catch {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle check stock by barcode (tanpa mengurangi stock)
  const handleCheckStock = async () => {
    if (!token || !barcodeInput.trim()) return;

    try {
      setError(null);
      const response = await getStockByBarcode(token, barcodeInput.trim());
      
      if (response.code === "200" && response.data) {
        setCurrentProductStock(response.data);
        setShowStockInfo(true);
      }
    } catch (err: any) {
      setError("Product tidak ditemukan untuk barcode ini");
      setCurrentProductStock(null);
      setShowStockInfo(false);
    }
  };

  // Handle complete stock out
  const handleCompleteStockOut = async () => {
    if (!token || !stockOut) return;
    
    try {
      setIsLoading(true);
      const response = await completeStockOut(token, stockOut.id);
      
      if (response.code === "200") {
        setSuccessMessage("Stock Out berhasil diselesaikan!");
        setTimeout(() => {
          router.push(`/stock/out/${stockOut.id}`);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Gagal menyelesaikan stock out");
    } finally {
      setIsLoading(false);
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

  // Format timestamp
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("id-ID", {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Calculate totals
  const totalItems = scanTransactions.length;
  const totalPieces = scanTransactions.reduce((sum, t) => sum + t.pieces_deducted, 0);
  const totalAmount = scanTransactions.reduce((sum, t) => sum + t.total_amount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading scan interface...</p>
        </div>
      </div>
    );
  }

  if (!stockOut) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Stock Out request not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scan className="h-6 w-6 text-blue-600" />
            Stock Out Scanner
          </h1>
          <p className="text-gray-600">
            {stockOut.reference_number} - {stockOut.department_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/stock/out/${stockOut.id}`)}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Details
          </Button>
          
          {scanTransactions.length > 0 && (
            <Button 
              onClick={handleCompleteStockOut}
              className="gap-2"
              disabled={isLoading}
            >
              <CheckCircle2 className="h-4 w-4" />
              Complete Stock Out
            </Button>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanning Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Barcode Scanner Card */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Scan Barcode untuk Stock Out
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleBarcodeScan} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="barcode">Barcode Product</Label>
                    <Input
                      ref={barcodeInputRef}
                      id="barcode"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Scan atau ketik barcode di sini..."
                      autoComplete="off"
                      className="text-lg font-mono"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="text-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={isScanning || !barcodeInput.trim()}
                    className="flex-1 gap-2"
                  >
                    {isScanning ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Scanning...
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4" />
                        Scan & Kurangi Stock
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleCheckStock}
                    disabled={!barcodeInput.trim()}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Check Stock
                  </Button>
                </div>
              </form>

              {/* Stock Info Display */}
              {showStockInfo && currentProductStock && (
                <div className="mt-4 p-4 bg-gray-800 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-200 mb-2">Stock Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Product:</strong> {currentProductStock.product.name}</p>
                      <p><strong>Part Number:</strong> {currentProductStock.product.part_number}</p>
                      <p><strong>Unit Type:</strong> {currentProductStock.barcode_info.unit_type}</p>
                    </div>
                    <div>
                      <p><strong>Available Units:</strong> {currentProductStock.stock_summary.available_units_for_scanned_type}</p>
                      <p><strong>Total Pieces:</strong> {currentProductStock.stock_summary.total_pieces_all_locations}</p>
                      <p><strong>Locations:</strong> {currentProductStock.stock_summary.number_of_locations}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Transaction History
                {totalItems > 0 && (
                  <Badge variant="secondary">{totalItems} items</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scanTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Pieces</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Remaining</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scanTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-mono text-xs">
                            {formatTime(transaction.timestamp)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{transaction.product_name}</p>
                              <p className="text-xs text-gray-500">{transaction.part_number}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{transaction.unit_type}</Badge>
                          </TableCell>
                          <TableCell>{transaction.quantity}</TableCell>
                          <TableCell>{transaction.pieces_deducted}</TableCell>
                          <TableCell>{formatCurrency(transaction.total_amount)}</TableCell>
                          <TableCell>
                            <span className={transaction.remaining_stock < 10 ? "text-red-600 font-medium" : "text-green-600"}>
                              {transaction.remaining_stock}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">Belum ada transaksi</h3>
                  <p className="text-sm text-gray-500">
                    Scan barcode untuk mengeluarkan barang
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          {/* Stock Out Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Reference</p>
                <p className="font-medium">{stockOut.reference_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Requestor</p>
                <p className="font-medium">{stockOut.requestor_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium">{stockOut.department_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge 
                  variant={stockOut.status === 'pending' ? 'default' : 'secondary'}
                  className="mt-1"
                >
                  {stockOut.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
                  <p className="text-xs text-blue-700">Items</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{totalPieces}</p>
                  <p className="text-xs text-green-700">Pieces</p>
                </div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(totalAmount)}
                </p>
                <p className="text-xs text-purple-700">Total Value</p>
              </div>

              {scanTransactions.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last scan: {formatTime(scanTransactions[0].timestamp)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}