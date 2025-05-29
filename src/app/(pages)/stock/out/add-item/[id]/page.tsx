// app/stock/out/add-item/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  getStockOutById,
  scanBarcodeForStockOut,
  addStockOutItemByBarcode,
} from "@/lib/api/services";
import type {
  StockOut,
  StockOutBarcodeScanResponse,
  AddStockOutItemByBarcodeForm,
} from "@/lib/api/types";
import {
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Scan,
  Package,
  Layers,
  Box,
  Calculator,
  ShoppingCart,
  AlertTriangle,
  Settings,
  Minus,
  Plus,
} from "lucide-react";

export default function AddStockOutItemPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  // State untuk stock out header info
  const [stockOutHeader, setStockOutHeader] = useState<StockOut | null>(null);

  // State untuk barcode scanning
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [scanResult, setScanResult] = useState<StockOutBarcodeScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // State untuk form
  const [formData, setFormData] = useState<AddStockOutItemByBarcodeForm>({
    barcode: "",
    requested_quantity: 1,
    price_per_unit: 0,
  });

  // State untuk flexibility mode
  const [useFlexibleMode, setUseFlexibleMode] = useState(false);
  const [actualPieces, setActualPieces] = useState<number>(0);

  // Override untuk unit conversion
  const [useCustomConversion, setUseCustomConversion] = useState(false);
  const [customPiecesPerPack, setCustomPiecesPerPack] = useState<number>(0);
  const [customPacksPerBox, setCustomPacksPerBox] = useState<number>(0);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token && id) {
      loadInitialData();
    }
  }, [token, id]);

  // Load stock out header
  const loadInitialData = async () => {
    try {
      const stockOutRes = await getStockOutById(token!, id as string);

      if (stockOutRes.code === "200" && stockOutRes.data) {
        setStockOutHeader(stockOutRes.data);

        // Cek status stock out
        if (stockOutRes.data.status !== "pending") {
          setError("Cannot add items to approved, completed or rejected stock out");
          return;
        }
      } else {
        setError("Stock out request not found");
        return;
      }
    } catch (err: any) {
      setError(err.message || "Error loading data");
      console.error("Error loading initial data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form untuk scan item berikutnya
  const resetForm = () => {
    setScannedBarcode("");
    setScanResult(null);
    setFormData({
      barcode: "",
      requested_quantity: 1,
      price_per_unit: 0,
    });
    setUseFlexibleMode(false);
    setActualPieces(0);
    setUseCustomConversion(false);
    setCustomPiecesPerPack(0);
    setCustomPacksPerBox(0);
  };

  // Fungsi utama untuk scan barcode
  const handleBarcodeScan = async (barcode: string) => {
    if (!barcode.trim()) return;

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      const response = await scanBarcodeForStockOut(token!, barcode);

      if (response.code === "200" && response.data) {
        setScanResult(response.data);
        setScannedBarcode(barcode);

        // Auto-populate form
        setFormData(prev => ({
          ...prev,
          barcode: barcode,
          price_per_unit: response.data!.product.price,
        }));

        // Set default custom conversion values
        setCustomPiecesPerPack(response.data.unit_conversion.pieces_per_pack);
        setCustomPacksPerBox(response.data.unit_conversion.packs_per_box);

        setSuccessMessage(
          `Product detected: ${response.data.product.name} (${response.data.scan_info.detected_unit_type})`
        );
      }
    } catch (err: any) {
      if (err.message?.includes("404")) {
        setError("Product not found for this barcode. Please register the product first.");
      } else {
        setError(err.message || "Error scanning barcode");
      }
      console.error("Error scanning barcode:", err);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle scan dari input
  const handleScanInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const barcode = (e.target as HTMLInputElement).value;
      handleBarcodeScan(barcode);
    }
  };

  // Manual barcode scan
  const handleManualScan = () => {
    if (scannedBarcode.trim()) {
      handleBarcodeScan(scannedBarcode);
    } else {
      setError("Please enter a barcode first");
    }
  };

  // Calculate pieces berdasarkan mode
  const calculateTotalPieces = () => {
    if (!scanResult) return 0;

    if (useFlexibleMode) {
      return actualPieces;
    }

    const { detected_unit_type } = scanResult.scan_info;
    const pieces_per_pack = useCustomConversion ? customPiecesPerPack : scanResult.unit_conversion.pieces_per_pack;
    const packs_per_box = useCustomConversion ? customPacksPerBox : scanResult.unit_conversion.packs_per_box;

    if (detected_unit_type === "piece") {
      return formData.requested_quantity;
    } else if (detected_unit_type === "pack") {
      return formData.requested_quantity * pieces_per_pack;
    } else if (detected_unit_type === "box") {
      return formData.requested_quantity * pieces_per_pack * packs_per_box;
    }
    return 0;
  };

  const calculateTotalAmount = () => {
    return formData.requested_quantity * formData.price_per_unit;
  };

  // Submit item
  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !id) {
      setError("Missing authentication or stock out ID");
      return;
    }

    if (!scanResult) {
      setError("Please scan a barcode first");
      return;
    }

    // Validasi form
    if (!formData.requested_quantity || formData.requested_quantity <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    if (!formData.price_per_unit || formData.price_per_unit <= 0) {
      setError("Please enter a valid price");
      return;
    }

    const totalPieces = calculateTotalPieces();
    if (totalPieces <= 0) {
      setError("Total pieces must be greater than 0");
      return;
    }

    if (totalPieces > scanResult.scan_info.total_pieces_in_stock) {
      setError(`Insufficient stock. Available: ${scanResult.scan_info.total_pieces_in_stock} pieces`);
      return;
    }

    if (useFlexibleMode && actualPieces <= 0) {
      setError("Please enter actual pieces to take");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData: AddStockOutItemByBarcodeForm = {
        barcode: formData.barcode,
        requested_quantity: formData.requested_quantity,
        price_per_unit: formData.price_per_unit,
      };

      // Add optional fields
      if (useFlexibleMode) {
        submitData.actual_pieces = actualPieces;
      }

      if (useCustomConversion) {
        submitData.pieces_per_pack = customPiecesPerPack;
        submitData.packs_per_box = customPacksPerBox;
      }

      const response = await addStockOutItemByBarcode(
        token,
        id as string,
        submitData
      );

      if (response.code === "201" && response.data) {
        setSuccessMessage("Item added successfully to stock out!");
        
        // Reset form untuk item berikutnya
        resetForm();

        // Clear success message setelah beberapa detik
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || "Failed to add item");
      }
    } catch (err: any) {
      setError(err.message || "Failed to add item");
      console.error("Error adding stock out item:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions
  const getUnitTypeIcon = (unitType: string) => {
    switch (unitType) {
      case "piece": return <Package className="h-4 w-4" />;
      case "pack": return <Layers className="h-4 w-4" />;
      case "box": return <Box className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
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

  if (!stockOutHeader || stockOutHeader.status !== "pending") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error || "Cannot add items to this stock out. It may be approved, completed or not found."}
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push(`/stock/out/${id}`)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Stock Out Details
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Add Items to Stock Out</h1>
              <p className="text-gray-600">
                {stockOutHeader.reference_number} - {stockOutHeader.department_name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/stock/out/${id}`)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Details
              </Button>
            </div>
          </div>

          {/* Workflow indicator */}
          <div className="mt-4 flex items-center gap-2 text-sm bg-orange-50 p-3 rounded-lg">
            <Scan className="h-4 w-4 text-orange-600" />
            <span className="text-orange-800 font-medium">
              Ready to scan items for stock out
            </span>
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
          {/* Left Column: Barcode Scanning */}
          <div className="lg:col-span-2 space-y-6">
            {/* Barcode Scanner */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5" />
                  Barcode Scanner
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Scan product barcode to check stock availability
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="barcode">Barcode</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="barcode"
                        value={scannedBarcode}
                        onChange={(e) => setScannedBarcode(e.target.value)}
                        onKeyDown={handleScanInput}
                        placeholder="Scan or type barcode here..."
                        className="font-mono"
                        disabled={isScanning}
                        autoFocus
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleManualScan}
                        disabled={isScanning || !scannedBarcode}>
                        {isScanning ? "Scanning..." : "Scan"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scan Result Display */}
            {scanResult && (
              <Card className="border-orange-200 bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-orange-400 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Product Available for Stock Out
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Stock Availability Warning */}
                    {scanResult.scan_info.total_pieces_in_stock === 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Out of Stock</AlertTitle>
                        <AlertDescription>
                          This product is currently out of stock.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Product Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-orange-400">Product Information</h4>
                        <div className="mt-2 space-y-1 text-sm">
                          <p><strong>Name:</strong> {scanResult.product.name}</p>
                          <p><strong>Part Number:</strong> {scanResult.product.part_number}</p>
                          <p><strong>Category:</strong> {scanResult.product.category_name}</p>
                          <p><strong>Base Price:</strong> {scanResult.product.price.toLocaleString("id-ID")} IDR</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-orange-400">Stock Information</h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getUnitTypeColor(scanResult.scan_info.detected_unit_type)}>
                              {getUnitTypeIcon(scanResult.scan_info.detected_unit_type)}
                              <span className="ml-1 capitalize">{scanResult.scan_info.detected_unit_type}</span>
                            </Badge>
                            <span className="text-sm">detected</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p><strong>Available:</strong> {scanResult.scan_info.available_units} {scanResult.scan_info.detected_unit_type}(s)</p>
                            <p><strong>Total Stock:</strong> {scanResult.scan_info.total_pieces_in_stock} pieces</p>
                            <p><strong>Locations:</strong> {scanResult.scan_info.storage_locations} location(s)</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Unit Conversion Info */}
                    <div className="bg-gray-800 p-3 rounded">
                      <h4 className="font-medium text-white mb-2">Unit Conversion</h4>
                      <div className="text-sm text-white space-y-1">
                        <p>• 1 Pack = {scanResult.unit_conversion.pieces_per_pack} Pieces</p>
                        <p>• 1 Box = {scanResult.unit_conversion.packs_per_box} Packs = {scanResult.unit_conversion.total_pieces_per_box} Pieces</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Item Details Form - Only show after successful scan dan stock tersedia */}
            {scanResult && scanResult.scan_info.total_pieces_in_stock > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Stock Out Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitItem} className="space-y-6">
                    {/* Quantity Input */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="quantity">
                          Quantity ({scanResult.scan_info.detected_unit_type}s) *
                        </Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              requested_quantity: Math.max(1, prev.requested_quantity - 1) 
                            }))}
                            disabled={formData.requested_quantity <= 1}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            max={scanResult.scan_info.available_units}
                            value={formData.requested_quantity}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                requested_quantity: parseInt(e.target.value) || 1,
                              })
                            }
                            required
                            className="text-center"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              requested_quantity: Math.min(scanResult.scan_info.available_units, prev.requested_quantity + 1) 
                            }))}
                            disabled={formData.requested_quantity >= scanResult.scan_info.available_units}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Max: {scanResult.scan_info.available_units} {scanResult.scan_info.detected_unit_type}(s)
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="price">
                          Price per {scanResult.scan_info.detected_unit_type} (IDR) *
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="1"
                          value={formData.price_per_unit}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price_per_unit: parseFloat(e.target.value) || 0,
                            })
                          }
                          required
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Calculated Total Pieces</Label>
                        <div className="mt-1 p-2 bg-gray-800 rounded-sm border text-center font-medium">
                          {calculateTotalPieces().toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>

                    {/* Flexible Mode Toggle untuk pack/box */}
                    {scanResult.scan_info.detected_unit_type !== "piece" && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-base font-medium">Flexible Quantity Mode</Label>
                            <p className="text-sm text-gray-600">
                              Take specific number of pieces instead of full {scanResult.scan_info.detected_unit_type}(s)
                            </p>
                          </div>
                          <Switch
                            checked={useFlexibleMode}
                            onCheckedChange={setUseFlexibleMode}
                          />
                        </div>

                        {useFlexibleMode && (
                          <div>
                            <Label htmlFor="actualPieces">Actual Pieces to Take *</Label>
                            <Input
                              id="actualPieces"
                              type="number"
                              min="1"
                              max={scanResult.scan_info.total_pieces_in_stock}
                              value={actualPieces}
                              onChange={(e) => setActualPieces(parseInt(e.target.value) || 0)}
                              placeholder="Enter exact pieces needed"
                              className="mt-1"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Max: {scanResult.scan_info.total_pieces_in_stock} pieces available
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Custom Conversion Toggle */}
                    <div className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label className="text-base font-medium flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Custom Unit Conversion
                          </Label>
                          <p className="text-sm text-gray-600">
                            Override default pieces per pack / packs per box
                          </p>
                        </div>
                        <Switch
                          checked={useCustomConversion}
                          onCheckedChange={setUseCustomConversion}
                        />
                      </div>

                      {useCustomConversion && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="customPiecesPerPack">Pieces per Pack</Label>
                            <Input
                              id="customPiecesPerPack"
                              type="number"
                              min="1"
                              value={customPiecesPerPack}
                              onChange={(e) => setCustomPiecesPerPack(parseInt(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="customPacksPerBox">Packs per Box</Label>
                            <Input
                              id="customPacksPerBox"
                              type="number"
                              min="1"
                              value={customPacksPerBox}
                              onChange={(e) => setCustomPacksPerBox(parseInt(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Summary Box */}
                    <div className="bg-gray-80 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Stock Out Summary
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Requested Quantity</p>
                          <p className="font-semibold">
                            {formData.requested_quantity} {scanResult.scan_info.detected_unit_type}(s)
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Pieces</p>
                          <p className="font-semibold">
                            {calculateTotalPieces().toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Price per Unit</p>
                          <p className="font-semibold">
                            {formData.price_per_unit.toLocaleString("id-ID")} IDR
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Amount</p>
                          <p className="font-semibold text-lg">
                            {calculateTotalAmount().toLocaleString("id-ID")} IDR
                          </p>
                        </div>
                      </div>

                      {/* Stock Impact */}
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Current Stock:</span>
                          <span className="font-medium">{scanResult.scan_info.total_pieces_in_stock} pieces</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">After Stock Out:</span>
                          <span className="font-medium">
                            {(scanResult.scan_info.total_pieces_in_stock - calculateTotalPieces()).toLocaleString("id-ID")} pieces
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmitting || calculateTotalPieces() <= 0}
                        className="gap-2">
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Adding Item...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Add Item to Stock Out
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Instructions */}
          <div className="space-y-6">
            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stock Out Process</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex items-start gap-2">
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-medium">1</span>
                  <p>Scan product barcode to check availability</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-medium">2</span>
                  <p>Enter quantity needed for stock out</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-medium">3</span>
                  <p>Use flexible mode to take partial pieces from packs/boxes</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded font-medium">4</span>
                  <p>Review calculation and confirm stock out</p>
                </div>
              </CardContent>
            </Card>

            {/* Flexible Mode Help */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Flexible Mode</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>When to use:</strong> When you need specific number of pieces that doesn't match full packs/boxes.</p>
                <p><strong>Example:</strong> Product has 10 pieces per pack, but you only need 7 pieces.</p>
                <p><strong>Benefit:</strong> More accurate stock out without waste.</p>
              </CardContent>
            </Card>

            {/* Stock Out vs Stock In */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Difference</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>Stock In:</strong> Follows product unit (add full packs/boxes)</p>
                <p><strong>Stock Out:</strong> Flexible - can take partial units based on actual need</p>
                <p><strong>Tracking:</strong> All calculations convert to pieces for accurate inventory</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}