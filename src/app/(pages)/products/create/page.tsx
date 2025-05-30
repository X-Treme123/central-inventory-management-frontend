// app/(pages)/products/create/page.tsx - Fixed: Scan only populates form, create only on submit
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
import {
  Scan,
  Package,
  Box,
  Layers,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";
import { getAllCategories } from "@/features/pages/categories/api/index";
import { getAllUnits } from "@/lib/api/services";
import { Category } from "@/features/pages/categories/api/index";
import {
  createProductWithBarcode,
  scanBarcode,
  BarcodeScanResponse,
  CreateProductWithBarcodeForm,
} from "@/features/pages/products/api/index";
import type { Unit } from "@/features/pages/units/api/index";

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

  // State untuk tracking hasil scan - HANYA untuk feedback, bukan untuk auto-save
  const [scanResults, setScanResults] = useState<{
    piece?: BarcodeScanResponse;
    pack?: BarcodeScanResponse;
    box?: BarcodeScanResponse;
  }>({});
  
  const [currentScanType, setCurrentScanType] = useState<
    "piece" | "pack" | "box" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [barcodeWarnings, setBarcodeWarnings] = useState<{
    piece?: string;
    pack?: string;
    box?: string;
  }>({});

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

  // FIXED: Fungsi ini HANYA untuk populate form, TIDAK untuk menyimpan ke database
  const handleBarcodeInput = async (
    barcode: string,
    type: "piece" | "pack" | "box"
  ) => {
    if (!barcode.trim()) return;

    setIsScanning(true);
    setCurrentScanType(type);
    setError(null);
    
    // Clear previous warnings for this barcode type
    setBarcodeWarnings(prev => ({
      ...prev,
      [type]: undefined
    }));

    try {
      // Cek apakah barcode sudah ada di sistem - HANYA untuk validasi
      const scanRes = await scanBarcode(token!, barcode);

      if (scanRes.code === "200" && scanRes.data) {
        // PRODUK SUDAH ADA - beri warning tapi tetap populate form
        setScanResults(prev => ({
          ...prev,
          [type]: scanRes.data
        }));
        
        setBarcodeWarnings(prev => ({
          ...prev,
          [type]: `⚠️ This barcode already exists for product: ${scanRes.data!.product.name}`
        }));

        // Auto-populate form HANYA jika form masih kosong
        if (!formData.name && !formData.part_number) {
          setFormData((prev) => ({
            ...prev,
            name: scanRes.data!.product.name,
            part_number: scanRes.data!.product.part_number,
            description: scanRes.data!.product.description || "",
            price: scanRes.data!.product.price,
            pieces_per_pack: scanRes.data!.product.pieces_per_pack,
            packs_per_box: scanRes.data!.product.packs_per_box,
          }));
        }
        
        // Set barcode ke form
        setFormData((prev) => ({
          ...prev,
          [type + "_barcode"]: barcode,
        }));

      }
    } catch (error: any) {
      // Jika produk tidak ditemukan (404) - ini normal untuk produk baru
      if (
        error.message?.includes("404") ||
        error.message?.includes("not found")
      ) {
        // Clear scan result untuk type ini
        setScanResults(prev => {
          const newResults = { ...prev };
          delete newResults[type as keyof typeof newResults];
          return newResults;
        });
        
        // Set barcode sebagai baru
        setFormData((prev) => ({
          ...prev,
          [type + "_barcode"]: barcode,
        }));
        
        setBarcodeWarnings(prev => ({
          ...prev,
          [type]: `✅ New ${type} barcode registered`
        }));

      } else {
        console.error("Error scanning barcode:", error);
        setBarcodeWarnings(prev => ({
          ...prev,
          [type]: `❌ Error scanning barcode: ${error.message}`
        }));
      }
    } finally {
      setIsScanning(false);
      setCurrentScanType(null);
    }
  };

  // Handle barcode scan dari scanner iWare atau input manual
  const handleBarcodeFromScanner = (type: "piece" | "pack" | "box") => {
    // Simulasi input dari scanner iWare
    // Dalam implementasi nyata, ini akan listening ke input dari scanner
    const barcode = prompt(`Scan or enter ${type} barcode:`);
    if (barcode) {
      handleBarcodeInput(barcode, type);
    }
  };

  // FIXED: Submit hanya terjadi ketika user explicitly klik "Create Product"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    // Validasi form - pastikan data minimum tersedia
    if (
      !formData.name ||
      !formData.part_number ||
      !formData.category_id ||
      !formData.base_unit_id
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validasi barcode - minimal satu barcode harus ada
    if (
      !formData.piece_barcode &&
      !formData.pack_barcode &&
      !formData.box_barcode
    ) {
      setError("Please provide at least one barcode (piece, pack, or box)");
      return;
    }

    // Cek apakah ada barcode yang conflict
    const hasConflicts = Object.values(barcodeWarnings).some(warning => 
      warning && warning.includes("already exists")
    );
    
    if (hasConflicts) {
      const confirmCreate = window.confirm(
        "Some barcodes already exist in the system. Do you want to proceed creating this product anyway? This might cause barcode conflicts."
      );
      
      if (!confirmCreate) {
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Creating product with data:", formData);
      
      const response = await createProductWithBarcode(token, formData);

      if (response.code === "201") {
        setSuccessMessage("Product created successfully!");
        
        // Reset form
        setFormData({
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
        
        setScanResults({});
        setBarcodeWarnings({});
        
        // Redirect setelah berhasil
        setTimeout(() => {
          router.push("/products");
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
  const getBarcodeIcon = (type: "piece" | "pack" | "box") => {
    switch (type) {
      case "piece":
        return <Package className="h-4 w-4" />;
      case "pack":
        return <Layers className="h-4 w-4" />;
      case "box":
        return <Box className="h-4 w-4" />;
    }
  };

  const getBarcodeColor = (type: "piece" | "pack" | "box") => {
    switch (type) {
      case "piece":
        return "bg-blue-500";
      case "pack":
        return "bg-green-500";
      case "box":
        return "bg-purple-500";
    }
  };

  const getBarcodeWarningType = (warning: string) => {
    if (warning.includes("already exists")) return "warning";
    if (warning.includes("New")) return "success";
    if (warning.includes("Error")) return "error";
    return "info";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Product</h1>
          <p className="text-gray-600">
            Scan barcodes to populate form, then click "Create Product" to save
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
            <AlertDescription className="text-green-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Info Alert about workflow */}
        <Alert className="mb-6 bg-gray-800 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-200">How it works</AlertTitle>
          <AlertDescription className="text-blue-200">
            1. Scan or enter barcodes to populate the form automatically<br/>
            2. Fill in remaining product details<br/>
            3. Click "Create Product" to save to database
          </AlertDescription>
        </Alert>

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
                    }>
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
                    }>
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
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Barcode Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Barcode Configuration</CardTitle>
              <p className="text-sm text-gray-600">
                Scan barcodes to populate form. System will check if barcodes already exist.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Pieces Barcode */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  {getBarcodeIcon("piece")}
                  <Badge className={getBarcodeColor("piece")}>Pieces</Badge>
                  <span className="text-sm text-gray-600">
                    Individual unit barcode
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={formData.piece_barcode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          piece_barcode: e.target.value,
                        })
                      }
                      placeholder="Scan or enter piece barcode"
                      onBlur={(e) => {
                        if (e.target.value) {
                          handleBarcodeInput(e.target.value, "piece");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isScanning && currentScanType === "piece"}
                      onClick={() => handleBarcodeFromScanner("piece")}>
                      <Scan className="h-4 w-4" />
                      {isScanning && currentScanType === "piece"
                        ? "Scanning..."
                        : "Scan"}
                    </Button>
                  </div>
                  {barcodeWarnings.piece && (
                    <div className={`text-xs p-2 rounded ${
                      getBarcodeWarningType(barcodeWarnings.piece) === "warning" 
                        ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                        : getBarcodeWarningType(barcodeWarnings.piece) === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {barcodeWarnings.piece}
                    </div>
                  )}
                </div>
              </div>

              {/* Pack Barcode */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  {getBarcodeIcon("pack")}
                  <Badge className={getBarcodeColor("pack")}>Pack</Badge>
                  <span className="text-sm text-gray-600">
                    Pack/bundle barcode
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={formData.pack_barcode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            pack_barcode: e.target.value,
                          })
                        }
                        placeholder="Scan or enter pack barcode"
                        onBlur={(e) => {
                          if (e.target.value) {
                            handleBarcodeInput(e.target.value, "pack");
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isScanning && currentScanType === "pack"}
                        onClick={() => handleBarcodeFromScanner("pack")}>
                        <Scan className="h-4 w-4" />
                        {isScanning && currentScanType === "pack"
                          ? "Scanning..."
                          : "Scan"}
                      </Button>
                    </div>
                    {barcodeWarnings.pack && (
                      <div className={`text-xs p-2 rounded ${
                        getBarcodeWarningType(barcodeWarnings.pack) === "warning" 
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          : getBarcodeWarningType(barcodeWarnings.pack) === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {barcodeWarnings.pack}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="pieces_per_pack"
                      className="text-sm whitespace-nowrap">
                      Pieces per pack:
                    </Label>
                    <Input
                      id="pieces_per_pack"
                      type="number"
                      min="1"
                      value={formData.pieces_per_pack}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pieces_per_pack: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-24"
                    />
                  </div>
                </div>
              </div>

              {/* Box Barcode */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  {getBarcodeIcon("box")}
                  <Badge className={getBarcodeColor("box")}>Box/Dus</Badge>
                  <span className="text-sm text-gray-600">
                    Box/carton barcode
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={formData.box_barcode}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            box_barcode: e.target.value,
                          })
                        }
                        placeholder="Scan or enter box barcode"
                        onBlur={(e) => {
                          if (e.target.value) {
                            handleBarcodeInput(e.target.value, "box");
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isScanning && currentScanType === "box"}
                        onClick={() => handleBarcodeFromScanner("box")}>
                        <Scan className="h-4 w-4" />
                        {isScanning && currentScanType === "box"
                          ? "Scanning..."
                          : "Scan"}
                      </Button>
                    </div>
                    {barcodeWarnings.box && (
                      <div className={`text-xs p-2 rounded ${
                        getBarcodeWarningType(barcodeWarnings.box) === "warning" 
                          ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                          : getBarcodeWarningType(barcodeWarnings.box) === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {barcodeWarnings.box}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="packs_per_box"
                      className="text-sm whitespace-nowrap">
                      Packs per box:
                    </Label>
                    <Input
                      id="packs_per_box"
                      type="number"
                      min="1"
                      value={formData.packs_per_box}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          packs_per_box: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-24"
                    />
                  </div>
                </div>
              </div>

              {/* Unit Conversion Summary */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Unit Conversion Summary</h4>
                <div className="text-sm text-white space-y-1">
                  <p>• 1 Pack = {formData.pieces_per_pack} Pieces</p>
                  <p>• 1 Box = {formData.packs_per_box} Packs</p>
                  <p>
                    • 1 Box ={" "}
                    {formData.pieces_per_pack * formData.packs_per_box} Pieces
                  </p>
                </div>
                
                {/* Visual indicator untuk barcode yang sudah diisi */}
                <div className="mt-3 flex gap-2 flex-wrap">
                  {formData.piece_barcode && (
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800">
                      <Package className="h-3 w-3 mr-1" />
                      Piece ✓
                    </Badge>
                  )}
                  {formData.pack_barcode && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800">
                      <Layers className="h-3 w-3 mr-1" />
                      Pack ✓
                    </Badge>
                  )}
                  {formData.box_barcode && (
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-800">
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
              disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700">
              {loading ? "Creating Product..." : "Create Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}