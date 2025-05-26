// app/dashboard/stock-out/add-item/[id]/page.tsx - Updated dengan barcode support
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getAllProducts,
  getAllUnits,
  getCurrentStock,
  getUnitConversionsByProduct,
  getStockOutById,
  addStockOutItem,
  scanBarcode,
  scanBarcodeForStockOut,
} from "@/lib/api/services";
import { Product, Unit, CurrentStock, UnitConversion } from "@/lib/api/types";
import Cookies from "js-cookie";
import { 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  Plus, 
  Scan, 
  Package, 
  Zap 
} from "lucide-react";

export default function AddStockOutItemPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const { id } = useParams();
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // State untuk stock out header
  const [stockOutHeader, setStockOutHeader] = useState<any>(null);
  
  // State untuk manual method
  const [productId, setProductId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [pricePerUnit, setPricePerUnit] = useState<number>(0);
  const [packsPerBox, setPacksPerBox] = useState<number | undefined>(undefined);
  const [piecesPerPack, setPiecesPerPack] = useState<number | undefined>(undefined);
  const [showPacksPerBox, setShowPacksPerBox] = useState(false);
  const [showPiecesPerPack, setShowPiecesPerPack] = useState(false);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalPieces, setTotalPieces] = useState<number>(0);
  const [availableStock, setAvailableStock] = useState<number>(0);

  // State untuk barcode method
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeQuantity, setBarcodeQuantity] = useState<number>(1);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Data dari API
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [currentStock, setCurrentStock] = useState<CurrentStock[]>([]);
  const [unitConversions, setUnitConversions] = useState<UnitConversion[]>([]);

  // State tambahan
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeMethod, setActiveMethod] = useState<"barcode" | "manual">("barcode");

  // Get token dari cookie
  useEffect(() => {
    const storedToken = Cookies.get("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Fetch data saat token dan ID tersedia
  useEffect(() => {
    if (!token || !id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Ambil data stock out
        const stockOutResponse = await getStockOutById(token, id as string);
        if (stockOutResponse.data) {
          setStockOutHeader(stockOutResponse.data);

          if (stockOutResponse.data.status !== "pending") {
            setError("Cannot add items to approved, completed, or rejected stock out requests");
            setTimeout(() => {
              router.push(`/dashboard/stock-out/${id}`);
            }, 3000);
            return;
          }
        } else {
          throw new Error("Stock out not found");
        }

        // Ambil data master untuk manual method
        const [productsRes, unitsRes, currentStockRes] = await Promise.all([
          getAllProducts(token),
          getAllUnits(token),
          getCurrentStock(token),
        ]);

        setProducts(productsRes.data || []);
        setUnits(unitsRes.data || []);
        setCurrentStock(currentStockRes.data || []);
      } catch (err: any) {
        setError(err.message || "Error fetching data");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, id, router]);

  // Auto focus untuk barcode input
  useEffect(() => {
    if (activeMethod === "barcode" && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [activeMethod]);

  // Handle barcode scan untuk mendapatkan product info
  const handleBarcodeScan = async () => {
    if (!token || !barcodeInput.trim()) return;

    setIsScanning(true);
    setError(null);

    try {
      const response = await scanBarcode(token, barcodeInput.trim());
      
      if (response.code === "200" && response.data) {
        setScannedProduct(response.data);
        setSuccessMessage(`Product ditemukan: ${response.data.product.name}`);
      }
    } catch (err: any) {
      // Jika barcode tidak ditemukan
      if (err.message?.includes("404")) {
        setError("Product tidak ditemukan untuk barcode ini. Silakan registrasi product terlebih dahulu.");
        setScannedProduct(null);
      } else {
        setError(err.message || "Error scanning barcode");
        setScannedProduct(null);
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Handle direct stock out via barcode (POS style)
  const handleDirectStockOut = async () => {
    if (!token || !barcodeInput.trim() || barcodeQuantity < 1) return;

    setIsScanning(true);
    setError(null);

    try {
      const response = await scanBarcodeForStockOut(token, barcodeInput.trim(), barcodeQuantity);
      
      if (response.code === "200" && response.data) {
        const scanData = response.data;
        setSuccessMessage(
          `✅ ${scanData.product.name} berhasil di-scan! 
          ${scanData.transaction.pieces_deducted} pieces dikurangi dari stock. 
          Sisa: ${scanData.stock_info.total_remaining_all_locations} pieces`
        );
        
        // Reset form
        setBarcodeInput("");
        setBarcodeQuantity(1);
        setScannedProduct(null);
        
        // Focus kembali ke input
        setTimeout(() => {
          if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
          }
        }, 100);
      }
    } catch (err: any) {
      console.error("Direct stock out error:", err);
      
      let errorMessage = "Gagal melakukan stock out";
      try {
        const errorData = JSON.parse(err.message);
        errorMessage = errorData.message || errorMessage;
        
        if (errorData.data) {
          const data = errorData.data;
          setError(
            `${errorMessage}. Product: ${data.product_name}. 
            Diminta: ${data.requested_pieces} pieces, Tersedia: ${data.available_pieces} pieces`
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

  // Handle submit manual item (existing logic)
  const handleSubmitManualItem = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... existing manual submit logic from original file
    // (copy the original handleSubmitItem logic here)
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!stockOutHeader || stockOutHeader.status !== "pending") {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Cannot add items to this stock out request. It may be approved, completed, or not found."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Add Item to Stock Out Request</h1>
          <p className="text-muted-foreground">
            {stockOutHeader.reference_number} - {stockOutHeader.department_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push(`/dashboard/stock-out/${id}`)}
          >
            <ChevronLeft size={16} />
            Back to Details
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push(`/dashboard/stock-out/scan/${id}`)}
          >
            <Zap size={16} />
            Go to POS Scanner
          </Button>
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add Stock Out Item</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeMethod} onValueChange={(value) => setActiveMethod(value as "barcode" | "manual")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="barcode" className="gap-2">
                <Scan className="h-4 w-4" />
                Barcode Scan
              </TabsTrigger>
              <TabsTrigger value="manual" className="gap-2">
                <Package className="h-4 w-4" />
                Manual Selection
              </TabsTrigger>
            </TabsList>

            {/* Barcode Scanning Method */}
            <TabsContent value="barcode" className="space-y-6">
              <div className="border-2 border-dashed border-blue-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <Scan className="mx-auto h-12 w-12 text-blue-500 mb-2" />
                  <h3 className="text-lg font-medium">Scan Barcode Product</h3>
                  <p className="text-sm text-gray-500">
                    Scan barcode untuk mendapatkan info produk atau langsung kurangi stock
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="barcodeInput">Barcode</Label>
                    <Input
                      ref={barcodeInputRef}
                      id="barcodeInput"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Scan atau ketik barcode..."
                      className="text-lg font-mono"
                      autoComplete="off"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="barcodeQuantity">Quantity</Label>
                    <Input
                      id="barcodeQuantity"
                      type="number"
                      min="1"
                      value={barcodeQuantity}
                      onChange={(e) => setBarcodeQuantity(parseInt(e.target.value) || 1)}
                      className="text-lg"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button 
                    onClick={handleBarcodeScan}
                    disabled={isScanning || !barcodeInput.trim()}
                    variant="outline"
                    className="flex-1 gap-2"
                  >
                    <Scan className="h-4 w-4" />
                    Scan Product Info
                  </Button>
                  
                  <Button 
                    onClick={handleDirectStockOut}
                    disabled={isScanning || !barcodeInput.trim()}
                    className="flex-1 gap-2"
                  >
                    {isScanning ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Direct Stock Out
                      </>
                    )}
                  </Button>
                </div>

                {/* Scanned Product Info */}
                {scannedProduct && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Product Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Product:</strong> {scannedProduct.product.name}</p>
                        <p><strong>Part Number:</strong> {scannedProduct.product.part_number}</p>
                        <p><strong>Unit Type:</strong> {scannedProduct.scan_info.detected_unit_type}</p>
                      </div>
                      <div>
                        <p><strong>Available Units:</strong> {scannedProduct.scan_info.available_units}</p>
                        <p><strong>Total Stock:</strong> {scannedProduct.scan_info.total_pieces_in_stock} pieces</p>
                        <p><strong>Locations:</strong> {scannedProduct.scan_info.storage_locations}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Manual Selection Method */}
            <TabsContent value="manual" className="space-y-6">
              <div className="text-center mb-4">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <h3 className="text-lg font-medium">Manual Product Selection</h3>
                <p className="text-sm text-gray-500">
                  Pilih produk, unit, dan quantity secara manual
                </p>
              </div>

              <form onSubmit={handleSubmitManualItem} className="space-y-6">
                {/* Manual form fields - copy from original implementation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">
                      Produk <span className="text-red-500">*</span>
                    </Label>
                    <Select value={productId} onValueChange={setProductId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih produk" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.part_number} - {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Add other manual form fields here... */}
                  {/* Copy the rest of the manual form implementation from the original file */}
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/stock-out/${id}`)}
                  >
                    Kembali
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Plus size={16} />
                    Add Item (Manual)
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}