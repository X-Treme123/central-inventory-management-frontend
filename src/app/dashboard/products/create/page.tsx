// app/dashboard/products/create/page.tsx - Updated dengan barcode support
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Scan, Package, Box, Layers, CheckCircle2, AlertCircle } from "lucide-react";
import {
  createProductWithBarcode,
  scanBarcode,
  getAllCategories,
  getAllUnits,
} from "@/lib/api/services";
import type { 
  Category, 
  Unit, 
  CreateProductWithBarcodeForm,
  BarcodeScanResponse 
} from "@/lib/api/types";

export default function CreateProductPage() {
  const { token } = useAuth();
  const router = useRouter();
  
  // Form state untuk product dengan barcode support
  const [formData, setFormData] = useState<CreateProductWithBarcodeForm>({
    part_number: "",
    name: "",
    description: "",
    category_id: "",
    base_unit_id: "",
    price: 0,
    piece_barcode: "",
    pack_barcode: "",
    box_barcode: "",
    pieces_per_pack: 1,
    packs_per_box: 1,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // State untuk tracking hasil scan - ini penting untuk memberikan feedback ke user
  const [scanResult, setScanResult] = useState<BarcodeScanResponse | null>(null);
  const [currentScanType, setCurrentScanType] = useState<'piece' | 'pack' | 'box' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadInitialData();
    }
  }, [token]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, unitsRes] = await Promise.all([
        getAllCategories(token!),
        getAllUnits(token!),
      ]);

      if (categoriesRes.code === "200" && categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      if (unitsRes.code === "200" && unitsRes.data) {
        setUnits(unitsRes.data);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError("Failed to load categories and units");
    }
  };

  // Fungsi untuk handle input barcode - ini adalah jantung dari sistem kita
  const handleBarcodeInput = async (barcode: string, type: 'piece' | 'pack' | 'box') => {
    if (!barcode.trim()) return;

    setIsScanning(true);
    setCurrentScanType(type);
    setError(null);

    try {
      // Pertama, coba scan apakah barcode sudah ada di sistem
      // Ini penting untuk mencegah duplikasi barcode
      const scanRes = await scanBarcode(token!, barcode);
      
      if (scanRes.code === "200" && scanRes.data) {
        // Jika produk sudah ada, beri tahu user dan populasi form
        setScanResult(scanRes.data);
        setSuccessMessage(`Barcode found! Product: ${scanRes.data.product.name}. Form populated with existing data.`);
        
        // Auto-populate form dengan data yang sudah ada
        // Ini memudahkan user jika ingin update atau membuat variasi produk
        setFormData(prev => ({
          ...prev,
          name: scanRes.data!.product.name,
          part_number: scanRes.data!.product.part_number,
          description: scanRes.data!.product.description || "",
          price: scanRes.data!.product.price,
          pieces_per_pack: scanRes.data!.product.pieces_per_pack,
          packs_per_box: scanRes.data!.product.packs_per_box,
          [type + '_barcode']: barcode,
        }));
      }
    } catch (error: any) {
      // Jika produk tidak ditemukan (404), itu normal untuk produk baru
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        setScanResult(null);
        setSuccessMessage(`New barcode registered for ${type} unit`);
        setFormData(prev => ({
          ...prev,
          [type + '_barcode']: barcode,
        }));
      } else {
        console.error("Error scanning barcode:", error);
        setError("Error scanning barcode. Please try again.");
      }
    } finally {
      setIsScanning(false);
      setCurrentScanType(null);
    }
  };

  // Handle barcode scan dari scanner iWare atau input manual
  const handleBarcodeFromScanner = (type: 'piece' | 'pack' | 'box') => {
    // Simulasi input dari scanner iWare
    // Dalam implementasi nyata, ini akan listening ke input dari scanner
    const barcode = prompt(`Scan or enter ${type} barcode:`);
    if (barcode) {
      handleBarcodeInput(barcode, type);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) return;

    // Validasi form - pastikan data minimum tersedia
    if (!formData.name || !formData.part_number || !formData.category_id || !formData.base_unit_id) {
      setError("Please fill in all required fields");
      return;
    }

    // Validasi barcode - minimal satu barcode harus ada
    if (!formData.piece_barcode && !formData.pack_barcode && !formData.box_barcode) {
      setError("Please provide at least one barcode (piece, pack, or box)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await createProductWithBarcode(token, formData);

      if (response.code === "201") {
        setSuccessMessage("Product created successfully!");
        // Redirect setelah berhasil
        setTimeout(() => {
          router.push("/dashboard/products");
        }, 2000);
      } else {
        setError(response.message || "Failed to create product");
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      setError(error.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions untuk styling barcode berdasarkan unit type
  const getBarcodeIcon = (type: 'piece' | 'pack' | 'box') => {
    switch (type) {
      case 'piece': return <Package className="h-4 w-4" />;
      case 'pack': return <Layers className="h-4 w-4" />;
      case 'box': return <Box className="h-4 w-4" />;
    }
  };

  const getBarcodeColor = (type: 'piece' | 'pack' | 'box') => {
    switch (type) {
      case 'piece': return 'bg-blue-500';
      case 'pack': return 'bg-green-500';
      case 'box': return 'bg-purple-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Product</h1>
          <p className="text-gray-600">
            Register a new product with barcode support for inventory management
          </p>
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
            <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Notification jika produk sudah ada */}
        {scanResult && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Existing Product Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700">
                This barcode belongs to: <strong>{scanResult.product.name}</strong>
                <br />
                <span className="text-sm">
                  Current stock: {scanResult.scan_info.total_pieces_in_stock} pieces 
                  ({scanResult.scan_info.available_units} {scanResult.scan_info.detected_unit_type}s)
                </span>
              </p>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="part_number">Part Number *</Label>
                  <Input
                    id="part_number"
                    value={formData.part_number}
                    onChange={(e) =>
                      setFormData({ ...formData, part_number: e.target.value })
                    }
                    placeholder="e.g., PG-BTF-30CM"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., PENGGARIS BUTTERFLY 30CM"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Product description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="base_unit">Base Unit *</Label>
                  <Select
                    value={formData.base_unit_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, base_unit_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select base unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name} ({unit.abbreviation})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Base Price (IDR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Barcode Configuration - Ini adalah bagian penting dari sistem baru */}
          <Card>
            <CardHeader>
              <CardTitle>Barcode Configuration</CardTitle>
              <p className="text-sm text-gray-600">
                Configure barcodes for different unit types. Each packaging level has its own unique barcode.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pieces Barcode */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  {getBarcodeIcon('piece')}
                  <Badge className={getBarcodeColor('piece')}>Pieces</Badge>
                  <span className="text-sm text-gray-600">Individual unit barcode</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={formData.piece_barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, piece_barcode: e.target.value })
                    }
                    placeholder="Scan or enter piece barcode"
                    onBlur={(e) => {
                      if (e.target.value) {
                        handleBarcodeInput(e.target.value, 'piece');
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isScanning && currentScanType === 'piece'}
                    onClick={() => handleBarcodeFromScanner('piece')}
                  >
                    <Scan className="h-4 w-4" />
                    {isScanning && currentScanType === 'piece' ? 'Scanning...' : 'Scan'}
                  </Button>
                </div>
              </div>

              {/* Pack Barcode */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  {getBarcodeIcon('pack')}
                  <Badge className={getBarcodeColor('pack')}>Pack</Badge>
                  <span className="text-sm text-gray-600">Pack/bundle barcode</span>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={formData.pack_barcode}
                      onChange={(e) =>
                        setFormData({ ...formData, pack_barcode: e.target.value })
                      }
                      placeholder="Scan or enter pack barcode"
                      onBlur={(e) => {
                        if (e.target.value) {
                          handleBarcodeInput(e.target.value, 'pack');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      disabled={isScanning && currentScanType === 'pack'}
                      onClick={() => handleBarcodeFromScanner('pack')}
                    >
                      <Scan className="h-4 w-4" />
                      {isScanning && currentScanType === 'pack' ? 'Scanning...' : 'Scan'}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pieces_per_pack" className="text-sm whitespace-nowrap">
                      Pieces per pack:
                    </Label>
                    <Input
                      id="pieces_per_pack"
                      type="number"
                      min="1"
                      value={formData.pieces_per_pack}
                      onChange={(e) =>
                        setFormData({ ...formData, pieces_per_pack: parseInt(e.target.value) || 1 })
                      }
                      className="w-24"
                    />
                  </div>
                </div>
              </div>

              {/* Box Barcode */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  {getBarcodeIcon('box')}
                  <Badge className={getBarcodeColor('box')}>Box/Dus</Badge>
                  <span className="text-sm text-gray-600">Box/carton barcode</span>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      value={formData.box_barcode}
                      onChange={(e) =>
                        setFormData({ ...formData, box_barcode: e.target.value })
                      }
                      placeholder="Scan or enter box barcode"
                      onBlur={(e) => {
                        if (e.target.value) {
                          handleBarcodeInput(e.target.value, 'box');
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      disabled={isScanning && currentScanType === 'box'}
                      onClick={() => handleBarcodeFromScanner('box')}
                    >
                      <Scan className="h-4 w-4" />
                      {isScanning && currentScanType === 'box' ? 'Scanning...' : 'Scan'}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="packs_per_box" className="text-sm whitespace-nowrap">
                      Packs per box:
                    </Label>
                    <Input
                      id="packs_per_box"
                      type="number"
                      min="1"
                      value={formData.packs_per_box}
                      onChange={(e) =>
                        setFormData({ ...formData, packs_per_box: parseInt(e.target.value) || 1 })
                      }
                      className="w-24"
                    />
                  </div>
                </div>
              </div>

              {/* Unit Conversion Summary - Membantu user memahami struktur konversi */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Unit Conversion Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• 1 Pack = {formData.pieces_per_pack} Pieces</p>
                  <p>• 1 Box = {formData.packs_per_box} Packs</p>
                  <p>• 1 Box = {formData.pieces_per_pack * formData.packs_per_box} Pieces</p>
                </div>
                {/* Visual indicator untuk barcode yang sudah diisi */}
                <div className="mt-3 flex gap-2">
                  {formData.piece_barcode && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Package className="h-3 w-3 mr-1" />
                      Piece ✓
                    </Badge>
                  )}
                  {formData.pack_barcode && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Layers className="h-3 w-3 mr-1" />
                      Pack ✓
                    </Badge>
                  )}
                  {formData.box_barcode && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      <Box className="h-3 w-3 mr-1" />
                      Box ✓
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating Product..." : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}