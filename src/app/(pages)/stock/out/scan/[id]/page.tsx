// app/(pages)/stock/out/scan/[id]/page.tsx - Enhanced with debugging
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
} from "@/lib/api/services"; // Updated import path
import { StockOut, StockOutScanResponse } from "@/lib/api/types";
import Cookies from "js-cookie";
import {
  Scan,
  Package,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Clock,
  ChevronLeft,
  ShoppingCart,
  Zap,
  TrendingDown,
  Eye,
  AlertTriangle,
  Info,
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

interface DebugInfo {
  endpoint: string;
  requestData: any;
  responseData: any;
  error: any;
  timestamp: string;
}

export default function EnhancedStockOutScanPage() {
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
  
  // Debug states
  const [debugMode, setDebugMode] = useState(process.env.NODE_ENV === 'development');
  const [debugInfo, setDebugInfo] = useState<DebugInfo[]>([]);

  // Debug helper function
  const addDebugInfo = (type: string, data: any, error?: any) => {
    if (!debugMode) return;
    
    const newDebugInfo: DebugInfo = {
      endpoint: type,
      requestData: data,
      responseData: null,
      error: error || null,
      timestamp: new Date().toISOString()
    };
    
    setDebugInfo(prev => [newDebugInfo, ...prev.slice(0, 9)]); // Keep last 10 entries
    console.log(`[DEBUG ${type}]`, newDebugInfo);
  };

  // Get token from cookie
  useEffect(() => {
    const storedToken = Cookies.get("token");
    console.log("Token from cookie:", storedToken ? "Found" : "Not found");
    
    if (storedToken) {
      setToken(storedToken);
    } else {
      console.error("No token found, redirecting to login");
      router.push("/login");
    }
  }, [router]);

  // Fetch stock out details
  useEffect(() => {
    if (!token || !id) {
      console.log("Waiting for token or ID", { hasToken: !!token, id });
      return;
    }

    const fetchStockOut = async () => {
      console.log("Fetching stock out details for ID:", id);
      setIsLoading(true);
      
      try {
        addDebugInfo("getStockOutById", { id });
        
        const response = await getStockOutById(token, id as string);
        console.log("Stock out response:", response);
        
        if (response.data) {
          setStockOut(response.data);
          console.log("Stock out loaded:", response.data.reference_number);
          
          // Check status - hanya allow scan jika masih pending atau approved
          if (response.data.status === 'completed' || response.data.status === 'rejected') {
            const errorMsg = "Cannot scan items for completed or rejected stock out request";
            setError(errorMsg);
            console.warn(errorMsg, response.data.status);
          }
        } else {
          const errorMsg = "Stock out request not found";
          setError(errorMsg);
          console.error(errorMsg);
        }
      } catch (err: any) {
        const errorMsg = err.message || "Error loading stock out details";
        setError(errorMsg);
        console.error("Error fetching stock out:", err);
        addDebugInfo("getStockOutById", { id }, err);
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
      console.log("Auto-focused barcode input");
    }
  }, [isLoading]);

  // Handle barcode scan/input
  const handleBarcodeScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("=== Starting barcode scan ===");
    console.log("Input values:", { barcode: barcodeInput, quantity, hasToken: !!token });
    
    if (!token) {
      const errorMsg = "Token tidak ditemukan. Silakan login kembali.";
      setError(errorMsg);
      console.error(errorMsg);
      return;
    }
    
    if (!barcodeInput.trim()) {
      const errorMsg = "Barcode tidak boleh kosong";
      setError(errorMsg);
      console.warn(errorMsg);
      return;
    }
    
    if (quantity < 1) {
      const errorMsg = "Quantity harus minimal 1";
      setError(errorMsg);
      console.warn(errorMsg);
      return;
    }

    setIsScanning(true);
    setError(null);
    setSuccessMessage(null);

    const scanData = {
      barcode: barcodeInput.trim(),
      quantity: quantity
    };

    console.log("Prepared scan data:", scanData);
    addDebugInfo("scanBarcodeForStockOut", scanData);

    try {
      console.log("Calling scanBarcodeForStockOut...");
      
      const response = await scanBarcodeForStockOut(token, scanData.barcode, scanData.quantity);
      
      console.log("Scan response received:", response);
      addDebugInfo("scanBarcodeForStockOut", scanData, null);
      
      if (response.code === "200" && response.data) {
        const scanResult = response.data;
        console.log("Scan successful, processing result:", scanResult);
        
        // Tambahkan ke transaction history
        const newTransaction: ScanTransaction = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          barcode: scanResult.transaction.scanned_barcode,
          product_name: scanResult.product.name,
          part_number: scanResult.product.part_number,
          unit_type: scanResult.transaction.unit_type,
          quantity: scanResult.transaction.quantity_scanned,
          pieces_deducted: scanResult.transaction.pieces_deducted,
          price_per_piece: scanResult.transaction.price_per_piece,
          total_amount: scanResult.transaction.total_amount_deducted,
          remaining_stock: scanResult.stock_info.total_remaining_all_locations,
        };
        
        setScanTransactions(prev => {
          const updated = [newTransaction, ...prev];
          console.log("Updated transaction list:", updated.length, "items");
          return updated;
        });
        
        const successMsg = `✅ ${scanResult.product.name} berhasil di-scan! ${scanResult.transaction.pieces_deducted} pieces dikurangi. Sisa stock: ${scanResult.stock_info.total_remaining_all_locations} pieces`;
        setSuccessMessage(successMsg);
        console.log("Success:", successMsg);
        
        // Reset form
        setBarcodeInput("");
        setQuantity(1);
        setCurrentProductStock(null);
        setShowStockInfo(false);
        
        // Focus kembali ke barcode input
        setTimeout(() => {
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
            console.log("Refocused barcode input");
          }
        }, 100);
        
      } else {
        const errorMsg = response.message || "Scan gagal - response tidak valid";
        console.error("Scan failed with response:", response);
        throw new Error(errorMsg);
      }
    } catch (err: any) {
      console.error("=== Scan error occurred ===");
      console.error("Error details:", err);
      
      addDebugInfo("scanBarcodeForStockOut", scanData, err);
      
      // Enhanced error parsing
      let errorMessage = "Gagal scan barcode";
      
      if (err.message) {
        try {
          // Try parsing JSON error
          const errorData = JSON.parse(err.message);
          console.log("Parsed error data:", errorData);
          
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          
          // Tampilkan info detail jika insufficient stock
          if (errorData.data) {
            const data = errorData.data;
            const detailedError = `${errorMessage}.\nProduct: ${data.product_name} (${data.part_number}).\nDiminta: ${data.requested_pieces} pieces, Tersedia: ${data.available_pieces} pieces`;
            setError(detailedError);
            console.error("Detailed error:", detailedError);
            return;
          }
        } catch (parseError) {
          console.log("Error message is not JSON, using as-is");
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      console.error("Final error message:", errorMessage);
    } finally {
      setIsScanning(false);
      console.log("=== Scan operation completed ===");
    }
  };

  // Handle check stock by barcode (tanpa mengurangi stock)
  const handleCheckStock = async () => {
    if (!token || !barcodeInput.trim()) return;

    console.log("Checking stock for barcode:", barcodeInput);
    addDebugInfo("getStockByBarcode", { barcode: barcodeInput });

    try {
      setError(null);
      const response = await getStockByBarcode(token, barcodeInput.trim());
      
      console.log("Stock check response:", response);
      
      if (response.code === "200" && response.data) {
        setCurrentProductStock(response.data);
        setShowStockInfo(true);
        console.log("Stock info displayed");
      }
    } catch (err: any) {
      const errorMsg = "Product tidak ditemukan untuk barcode ini";
      setError(errorMsg);
      setCurrentProductStock(null);
      setShowStockInfo(false);
      console.error("Stock check error:", err);
      addDebugInfo("getStockByBarcode", { barcode: barcodeInput }, err);
    }
  };

  // Handle complete stock out
  const handleCompleteStockOut = async () => {
    if (!token || !stockOut) return;
    
    console.log("Completing stock out:", stockOut.id);
    
    try {
      setIsLoading(true);
      const response = await completeStockOut(token, stockOut.id);
      
      if (response.code === "200") {
        const successMsg = "Stock Out berhasil diselesaikan!";
        setSuccessMessage(successMsg);
        console.log(successMsg);
        
        setTimeout(() => {
          router.push(`/stock/out/${stockOut.id}`);
        }, 2000);
      }
    } catch (err: any) {
      const errorMsg = err.message || "Gagal menyelesaikan stock out";
      setError(errorMsg);
      console.error("Complete stock out error:", err);
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
          {debugMode && (
            <p className="text-xs text-gray-500 mt-2">Debug mode: ON</p>
          )}
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
        {debugMode && debugInfo.length > 0 && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(debugInfo[0], null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
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
            {debugMode && <Badge variant="outline" className="ml-2">DEBUG</Badge>}
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
          <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Debug Panel */}
      {debugMode && debugInfo.length > 0 && (
        <Card className="border-yellow-200 bg-gray-800">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Info className="h-4 w-4" />
              Debug Information
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDebugInfo([])}
                className="ml-auto"
              >
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-xs bg-white p-2 rounded border">
                  <div className="font-medium text-blue-600">{info.endpoint}</div>
                  <div className="text-gray-500">{info.timestamp}</div>
                  {info.error && (
                    <div className="text-red-600 mt-1">Error: {info.error.message}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
                      disabled={isScanning}
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
                      disabled={isScanning}
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
                    disabled={!barcodeInput.trim() || isScanning}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Check Stock
                  </Button>
                </div>
              </form>

              {/* Stock Info Display */}
              {showStockInfo && currentProductStock && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Stock Information</h4>
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