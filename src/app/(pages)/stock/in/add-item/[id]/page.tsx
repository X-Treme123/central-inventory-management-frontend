// app/stock/in/add-item/[id]/page.tsx - Updated dengan manual currency input Indonesia
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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
import {
  getStockInById,
  addStockInItemByBarcode,
  scanBarcode,
} from "@/lib/api/services";
import {
  getAllWarehouses,
  getContainersByWarehouse,
  getRacksByContainer,
  Warehouses,
  Container,
  Rack,
} from "@/features/pages/warehouses/api/index";
import type {
  StockIn,
  BarcodeScanResponse,
  AddStockInItemByBarcodeForm,
} from "@/lib/api/types";
import {
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Scan,
  Package,
  Layers,
  Box,
  MapPin,
  Calculator,
  ShoppingCart,
} from "lucide-react";

export default function AddStockInItemPage() {
  const { token } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  // State untuk stock in header info
  const [stockInHeader, setStockInHeader] = useState<StockIn | null>(null);

  // State untuk barcode scanning - ini adalah core dari sistem baru
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [scanResult, setScanResult] = useState<BarcodeScanResponse | null>(
    null
  );
  const [isScanning, setIsScanning] = useState(false);

  // State untuk form setelah scan berhasil - dengan formatted values
  const [formData, setFormData] = useState<AddStockInItemByBarcodeForm>({
    barcode: "",
    quantity: 1,
    price_per_unit: 0,
    warehouse_id: "",
    container_id: "",
    rack_id: "",
  });

  // State untuk formatted display values
  const [formattedValues, setFormattedValues] = useState({
    quantity: "1",
    price_per_unit: "0",
  });

  // Master data untuk location
  const [warehouses, setWarehouses] = useState<Warehouses[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ==================== CURRENCY FORMATTING FUNCTIONS ====================
  
  // Format angka ke format Indonesia (1.000.000)
  const formatCurrency = (value: number | string): string => {
    if (!value && value !== 0) return "";
    
    // Convert to number first
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    
    // Handle decimal places - if it's a whole number, don't show decimals
    if (numValue % 1 === 0) {
      return numValue.toLocaleString("id-ID");
    } else {
      return numValue.toLocaleString("id-ID", { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2 
      });
    }
  };

  // Parse formatted string kembali ke number
  const parseCurrency = (formattedValue: string): number => {
    if (!formattedValue) return 0;
    
    // Remove all dots (thousand separators) and convert comma to dot for decimal
    const cleanValue = formattedValue
      .replace(/\./g, '') // Remove dots (thousand separators)
      .replace(/,/g, '.') // Replace comma with dot for decimal (if any)
      .replace(/[^\d.]/g, ''); // Remove any non-digit, non-dot characters
    
    return parseFloat(cleanValue) || 0;
  };

  // Handle currency input dengan formatting real-time
  const handleCurrencyInput = (
    value: string, 
    field: 'quantity' | 'price_per_unit'
  ) => {
    // Allow only numbers, dots, and commas
    const cleanInput = value.replace(/[^\d.,]/g, '');
    
    // Parse to get the actual number
    const numericValue = parseCurrency(cleanInput);
    
    // Update both formatted display and actual values
    setFormattedValues(prev => ({
      ...prev,
      [field]: cleanInput
    }));
    
    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  // Format on blur untuk membersihkan format
  const handleCurrencyBlur = (field: 'quantity' | 'price_per_unit') => {
    const numericValue = formData[field];
    const formattedValue = formatCurrency(numericValue);
    
    setFormattedValues(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  // ==================== EXISTING FUNCTIONS ====================

  useEffect(() => {
    if (token && id) {
      loadInitialData();
    }
  }, [token, id]);

  // Load stock in header dan master data
  const loadInitialData = async () => {
    try {
      const [stockInRes, warehousesRes] = await Promise.all([
        getStockInById(token!, id as string),
        getAllWarehouses(token!),
      ]);

      if (stockInRes.code === "200" && stockInRes.data) {
        setStockInHeader(stockInRes.data);

        // Cek status stock in
        if (stockInRes.data.status !== "pending") {
          setError("Cannot add items to completed or rejected stock in");
          return;
        }
      } else {
        setError("Stock in not found");
        return;
      }

      if (warehousesRes.code === "200" && warehousesRes.data) {
        setWarehouses(warehousesRes.data);
      }
    } catch (err: any) {
      setError(err.message || "Error loading data");
      console.error("Error loading initial data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load containers ketika warehouse dipilih
  useEffect(() => {
    if (token && formData.warehouse_id) {
      loadContainers(formData.warehouse_id);
    }
  }, [token, formData.warehouse_id]);

  // Load racks ketika container dipilih
  useEffect(() => {
    if (token && formData.container_id) {
      loadRacks(formData.container_id);
    }
  }, [token, formData.container_id]);

  const loadContainers = async (warehouseId: string) => {
    try {
      const response = await getContainersByWarehouse(token!, warehouseId);
      if (response.code === "200" && response.data) {
        setContainers(response.data);
        setFormData((prev) => ({ ...prev, container_id: "", rack_id: "" }));
      }
    } catch (err) {
      console.error("Error loading containers:", err);
    }
  };

  const loadRacks = async (containerId: string) => {
    try {
      const response = await getRacksByContainer(token!, containerId);
      if (response.code === "200" && response.data) {
        setRacks(response.data);
        setFormData((prev) => ({ ...prev, rack_id: "" }));
      }
    } catch (err) {
      console.error("Error loading racks:", err);
    }
  };

  // Fungsi utama untuk scan barcode - ini adalah jantung sistem
  const handleBarcodeScan = async (barcode: string) => {
    if (!barcode.trim()) return;

    setIsScanning(true);
    setError(null);
    setScanResult(null);

    try {
      const response = await scanBarcode(token!, barcode);

      if (response.code === "200" && response.data) {
        setScanResult(response.data);
        setScannedBarcode(barcode);

        // Auto-populate form dengan data dari scan
        const basePrice = response.data.product.price;
        setFormData((prev) => ({
          ...prev,
          barcode: barcode,
          price_per_unit: basePrice,
        }));

        // Format the price for display
        setFormattedValues(prev => ({
          ...prev,
          price_per_unit: formatCurrency(basePrice)
        }));

        setSuccessMessage(
          `Product detected: ${response.data.product.name} (${response.data.scan_info.detected_unit_type})`
        );
      }
    } catch (err: any) {
      if (err.message?.includes("404")) {
        setError(
          "Product not found for this barcode. Please register the product first."
        );
      } else {
        setError(err.message || "Error scanning barcode");
      }
      console.error("Error scanning barcode:", err);
    } finally {
      setIsScanning(false);
    }
  };

  // Handle scan dari iWare scanner atau input manual
  const handleScanInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // iWare scanner biasanya mengirim Enter setelah scan
    if (e.key === "Enter") {
      e.preventDefault();
      const barcode = (e.target as HTMLInputElement).value;
      handleBarcodeScan(barcode);
    }
  };

  // Manual barcode input dengan button
  const handleManualScan = () => {
    if (scannedBarcode.trim()) {
      handleBarcodeScan(scannedBarcode);
    } else {
      setError("Please enter a barcode first");
    }
  };

  // Submit item setelah scan berhasil
  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !id) {
      setError("Missing authentication or stock in ID");
      return;
    }

    if (!scanResult) {
      setError("Please scan a barcode first");
      return;
    }

    // Validasi form dengan numeric values
    if (!formData.quantity || formData.quantity <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    if (!formData.price_per_unit || formData.price_per_unit <= 0) {
      setError("Please enter a valid price");
      return;
    }

    if (!formData.warehouse_id || !formData.container_id || !formData.rack_id) {
      setError("Please select storage location");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await addStockInItemByBarcode(
        token,
        id as string,
        formData
      );

      if (response.code === "201" && response.data) {
        setSuccessMessage("Item added successfully!");

        // Reset form untuk scan item berikutnya
        setScannedBarcode("");
        setScanResult(null);
        setFormData({
          barcode: "",
          quantity: 1,
          price_per_unit: 0,
          warehouse_id: formData.warehouse_id, // Keep location untuk convenience
          container_id: formData.container_id,
          rack_id: formData.rack_id,
        });

        // Reset formatted values
        setFormattedValues({
          quantity: "1",
          price_per_unit: "0",
        });

        // Clear success message setelah beberapa detik
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(response.message || "Failed to add item");
      }
    } catch (err: any) {
      setError(err.message || "Failed to add item");
      console.error("Error adding stock in item:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions untuk UI
  const getUnitTypeIcon = (unitType: string) => {
    switch (unitType) {
      case "piece":
        return <Package className="h-4 w-4" />;
      case "pack":
        return <Layers className="h-4 w-4" />;
      case "box":
        return <Box className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getUnitTypeColor = (unitType: string) => {
    switch (unitType) {
      case "piece":
        return "bg-blue-500";
      case "pack":
        return "bg-green-500";
      case "box":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const calculateTotalPieces = () => {
    if (!scanResult) return 0;

    const { detected_unit_type } = scanResult.scan_info;
    const { pieces_per_pack, packs_per_box } = scanResult.unit_conversion;

    if (detected_unit_type === "piece") {
      return formData.quantity;
    } else if (detected_unit_type === "pack") {
      return formData.quantity * pieces_per_pack;
    } else if (detected_unit_type === "box") {
      return formData.quantity * pieces_per_pack * packs_per_box;
    }
    return 0;
  };

  const calculateTotalAmount = () => {
    return formData.quantity * formData.price_per_unit;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stock in details...</p>
        </div>
      </div>
    );
  }

  if (!stockInHeader || stockInHeader.status !== "pending") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ||
              "Cannot add items to this stock in. It may be completed or not found."}
          </AlertDescription>
        </Alert>
        <Button className="mt-4" onClick={() => router.push(`/stock/in/${id}`)}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Stock In Details
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
              <h1 className="text-3xl font-bold">Add Items to Stock In</h1>
              <p className="text-gray-600">
                {stockInHeader.invoice_code} - {stockInHeader.supplier_name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/stock/in/${id}`)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Details
              </Button>
            </div>
          </div>

          {/* Workflow indicator */}
          <div className="mt-4 flex items-center gap-2 text-sm bg-blue-50 p-3 rounded-lg">
            <Scan className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800 font-medium">
              Ready to scan items with your barcode scanner
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
          <Alert className="mb-6 bg-gray-800 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertTitle className="text-green-400">Success</AlertTitle>
            <AlertDescription className="text-green-400">
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
                  Scan barcode with your iWare scanner or enter manually
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
                    <p className="text-xs text-gray-500 mt-1">
                      iWare scanner will automatically scan when you trigger it
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scan Result Display */}
            {scanResult && (
              <Card className="border-green-200 bg-gray-800">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Product Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Product Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-green-800">
                          Product Information
                        </h4>
                        <div className="mt-2 space-y-1 text-sm">
                          <p>
                            <strong>Name:</strong> {scanResult.product.name}
                          </p>
                          <p>
                            <strong>Part Number:</strong>{" "}
                            {scanResult.product.part_number}
                          </p>
                          <p>
                            <strong>Category:</strong>{" "}
                            {scanResult.product.category_name}
                          </p>
                          <p>
                            <strong>Base Price:</strong>{" "}
                            Rp {formatCurrency(scanResult.product.price)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-green-800">
                          Scan Information
                        </h4>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getUnitTypeColor(
                                scanResult.scan_info.detected_unit_type
                              )}>
                              {getUnitTypeIcon(
                                scanResult.scan_info.detected_unit_type
                              )}
                              <span className="ml-1 capitalize">
                                {scanResult.scan_info.detected_unit_type}
                              </span>
                            </Badge>
                            <span className="text-sm">detected</span>
                          </div>
                          <div className="text-sm space-y-1">
                            <p>
                              <strong>Available:</strong>{" "}
                              {formatCurrency(scanResult.scan_info.available_units)}{" "}
                              {scanResult.scan_info.detected_unit_type}(s)
                            </p>
                            <p>
                              <strong>Total Stock:</strong>{" "}
                              {formatCurrency(scanResult.scan_info.total_pieces_in_stock)}{" "}
                              pieces
                            </p>
                            <p>
                              <strong>Locations:</strong>{" "}
                              {scanResult.scan_info.storage_locations}{" "}
                              location(s)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Unit Conversion Info */}
                    <div className="bg-gray-800 p-3 rounded">
                      <h4 className="font-medium text-white mb-2">
                        Unit Conversion
                      </h4>
                      <div className="text-sm text-white space-y-1">
                        <p>
                          • 1 Pack = {formatCurrency(scanResult.unit_conversion.pieces_per_pack)} Pieces
                        </p>
                        <p>
                          • 1 Box = {formatCurrency(scanResult.unit_conversion.packs_per_box)} Packs = {formatCurrency(scanResult.unit_conversion.total_pieces_per_box)} Pieces
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Item Details Form - Only show after successful scan */}
            {scanResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Item Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitItem} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Quantity - Manual Input */}
                      <div>
                        <Label htmlFor="quantity">
                          Quantity ({scanResult.scan_info.detected_unit_type}s) *
                        </Label>
                        <Input
                          id="quantity"
                          type="text"
                          value={formattedValues.quantity}
                          onChange={(e) => handleCurrencyInput(e.target.value, 'quantity')}
                          onBlur={() => handleCurrencyBlur('quantity')}
                          placeholder="e.g., 1.000"
                          required
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter quantity (use dots for thousands: 1.000)
                        </p>
                      </div>

                      {/* Price per Unit - Manual Input */}
                      <div>
                        <Label htmlFor="price">
                          Price per {scanResult.scan_info.detected_unit_type} (IDR) *
                        </Label>
                        <div className="relative mt-1">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                            Rp
                          </span>
                          <Input
                            id="price"
                            type="text"
                            value={formattedValues.price_per_unit}
                            onChange={(e) => handleCurrencyInput(e.target.value, 'price_per_unit')}
                            onBlur={() => handleCurrencyBlur('price_per_unit')}
                            placeholder="e.g., 1.000.000"
                            required
                            className="pl-10"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Enter price (use dots for thousands: 1.000.000)
                        </p>
                      </div>

                      {/* Calculated Total Pieces */}
                      <div>
                        <Label>Total Pieces</Label>
                        <div className="mt-1 p-2 bg-gray-800 rounded-sm border text-center font-medium">
                          {formatCurrency(calculateTotalPieces())}
                        </div>
                      </div>
                    </div>

                    {/* Storage Location */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Storage Location
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Warehouse *</Label>
                          <Select
                            value={formData.warehouse_id}
                            onValueChange={(value) =>
                              setFormData({ ...formData, warehouse_id: value })
                            }>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select warehouse" />
                            </SelectTrigger>
                            <SelectContent>
                              {warehouses.map((warehouse) => (
                                <SelectItem
                                  key={warehouse.id}
                                  value={warehouse.id}>
                                  {warehouse.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Container *</Label>
                          <Select
                            value={formData.container_id}
                            onValueChange={(value) =>
                              setFormData({ ...formData, container_id: value })
                            }
                            disabled={!formData.warehouse_id}>
                            <SelectTrigger className="mt-1">
                              <SelectValue
                                placeholder={
                                  formData.warehouse_id
                                    ? "Select container"
                                    : "Select warehouse first"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {containers.map((container) => (
                                <SelectItem
                                  key={container.id}
                                  value={container.id}>
                                  {container.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Rack *</Label>
                          <Select
                            value={formData.rack_id}
                            onValueChange={(value) =>
                              setFormData({ ...formData, rack_id: value })
                            }
                            disabled={!formData.container_id}>
                            <SelectTrigger className="mt-1">
                              <SelectValue
                                placeholder={
                                  formData.container_id
                                    ? "Select rack"
                                    : "Select container first"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {racks.map((rack) => (
                                <SelectItem key={rack.id} value={rack.id}>
                                  {rack.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Summary Box */}
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-500 mb-2 flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Transaction Summary
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-blue-600">Quantity</p>
                          <p className="font-semibold">
                            {formatCurrency(formData.quantity)}{" "}
                            {scanResult.scan_info.detected_unit_type}(s)
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-600">Total Pieces</p>
                          <p className="font-semibold">
                            {formatCurrency(calculateTotalPieces())}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-600">Price per Unit</p>
                          <p className="font-semibold">
                            Rp {formatCurrency(formData.price_per_unit)}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-600">Total Amount</p>
                          <p className="font-semibold text-lg">
                            Rp {formatCurrency(calculateTotalAmount())}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="gap-2">
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Adding Item...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Add Item
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Instructions and Help */}
          <div className="space-y-6">
            {/* Quick Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How to Scan</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                    1
                  </span>
                  <p>Point your iWare scanner at the product barcode</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                    2
                  </span>
                  <p>
                    Press the trigger to scan - barcode will appear
                    automatically
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                    3
                  </span>
                  <p>System will detect product and unit type</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                    4
                  </span>
                  <p>Enter quantity and price manually (e.g., 1.000.000)</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                    5
                  </span>
                  <p>Select storage location and click "Add Item"</p>
                </div>
              </CardContent>
            </Card>

            {/* Unit Type Guide */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Unit Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500">
                    <Package className="h-3 w-3 mr-1" />
                    Piece
                  </Badge>
                  <span className="text-sm">Individual items</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">
                    <Layers className="h-3 w-3 mr-1" />
                    Pack
                  </Badge>
                  <span className="text-sm">Bundle of pieces</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500">
                    <Box className="h-3 w-3 mr-1" />
                    Box
                  </Badge>
                  <span className="text-sm">Carton containing packs</span>
                </div>
              </CardContent>
            </Card>

            {/* Troubleshooting */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Troubleshooting</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>
                  <strong>Scanner not working?</strong> Check USB connection and
                  ensure cursor is in the barcode field.
                </p>
                <p>
                  <strong>Product not found?</strong> Register the product in
                  Products section first.
                </p>
                <p>
                  <strong>Wrong unit detected?</strong> Check if you're scanning
                  the correct barcode for the unit type.
                </p>
                <p>
                  <strong>Price formatting?</strong> Use dots for thousands (1.000.000) 
                  not commas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}