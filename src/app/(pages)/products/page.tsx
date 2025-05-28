// app/(dashboard)/products/page.tsx - Updated dengan barcode support dan quick scan
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Plus,
  Search,
  Package,
  Layers,
  Box,
  Eye,
  Scan,
  BarChart3,
  Info,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { getAllProducts, scanBarcode } from "@/lib/api/services";
import type { Product, BarcodeScanResponse } from "@/lib/api/types";

export default function ProductsPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // States untuk quick scan feature
  const [quickScanBarcode, setQuickScanBarcode] = useState("");
  const [scanResult, setScanResult] = useState<BarcodeScanResponse | null>(
    null
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Filter states
  const [stockFilter, setStockFilter] = useState("all"); // all, in_stock, low_stock, out_of_stock

  useEffect(() => {
    if (token) {
      loadProducts();
    }
  }, [token]);

  const loadProducts = async () => {
    try {
      const response = await getAllProducts(token!);
      if (response.code === "200" && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered products berdasarkan search dan filter
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.piece_barcode?.includes(searchTerm) ||
        product.pack_barcode?.includes(searchTerm) ||
        product.box_barcode?.includes(searchTerm) ||
        product.category_name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Stock filter
      const stock = product.total_stock_pieces || 0;
      let matchesStock = true;

      if (stockFilter === "in_stock") {
        matchesStock = stock > 100;
      } else if (stockFilter === "low_stock") {
        matchesStock = stock > 0 && stock <= 100;
      } else if (stockFilter === "out_of_stock") {
        matchesStock = stock === 0;
      }

      return matchesSearch && matchesStock;
    });
  }, [products, searchTerm, stockFilter]);

  // Quick scan function
  const handleQuickScan = async (barcode?: string) => {
    const barcodeToScan = barcode || quickScanBarcode;
    if (!barcodeToScan) {
      setScanError("Please enter a barcode first");
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const response = await scanBarcode(token!, barcodeToScan);
      if (response.code === "200" && response.data) {
        setScanResult(response.data);

        // Find and select the product untuk detailed view
        const product = products.find(
          (p) => p.id === response.data!.product.id
        );
        if (product) {
          setSelectedProduct(product);
        }

        // Clear barcode input
        setQuickScanBarcode("");
      }
    } catch (error: any) {
      if (error.message?.includes("404")) {
        setScanError("Product not found for this barcode");
      } else {
        setScanError("Error scanning barcode. Please try again.");
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Handle scan dari input (iWare scanner)
  const handleScanInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleQuickScan();
    }
  };

  // Helper functions
  const getBarcodeCount = (product: Product) => {
    let count = 0;
    if (product.piece_barcode) count++;
    if (product.pack_barcode) count++;
    if (product.box_barcode) count++;
    return count;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return {
        color: "bg-red-500 text-white",
        text: "Out of Stock",
        icon: <AlertCircle className="h-3 w-3" />,
      };
    if (stock <= 100)
      return {
        color: "bg-yellow-500 text-white",
        text: "Low Stock",
        icon: <AlertCircle className="h-3 w-3" />,
      };
    return {
      color: "bg-green-500 text-white",
      text: "In Stock",
      icon: <CheckCircle2 className="h-3 w-3" />,
    };
  };

  const BarcodeIcon = ({ type }: { type: "piece" | "pack" | "box" }) => {
    switch (type) {
      case "piece":
        return <Package className="h-3 w-3" />;
      case "pack":
        return <Layers className="h-3 w-3" />;
      case "box":
        return <Box className="h-3 w-3" />;
    }
  };

  const BarcodeDisplay = ({ product }: { product: Product }) => (
    <div className="space-y-1">
      {product.piece_barcode && (
        <div className="flex items-center gap-1 text-xs">
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 text-xs">
            <BarcodeIcon type="piece" />
            <span className="ml-1">PC</span>
          </Badge>
          <code className="text-xs font-mono bg-gray-800 px-1 rounded">
            {product.piece_barcode}
          </code>
        </div>
      )}
      {product.pack_barcode && (
        <div className="flex items-center gap-1 text-xs">
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 text-xs">
            <BarcodeIcon type="pack" />
            <span className="ml-1">PK</span>
          </Badge>
          <code className="text-xs font-mono bg-gray-800 px-1 rounded">
            {product.pack_barcode}
          </code>
        </div>
      )}
      {product.box_barcode && (
        <div className="flex items-center gap-1 text-xs">
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-800 text-xs">
            <BarcodeIcon type="box" />
            <span className="ml-1">BX</span>
          </Badge>
          <code className="text-xs font-mono bg-gray-800 px-1 rounded">
            {product.box_barcode}
          </code>
        </div>
      )}
      {getBarcodeCount(product) === 0 && (
        <div className="text-xs text-gray-500 italic">No barcodes</div>
      )}
    </div>
  );

  // Stats calculation
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const withBarcodes = products.filter((p) => getBarcodeCount(p) > 0).length;
    const inStock = products.filter(
      (p) => (p.total_stock_pieces || 0) > 100
    ).length;
    const lowStock = products.filter((p) => {
      const stock = p.total_stock_pieces || 0;
      return stock > 0 && stock <= 100;
    }).length;
    const outOfStock = products.filter(
      (p) => (p.total_stock_pieces || 0) === 0
    ).length;

    return { totalProducts, withBarcodes, inStock, lowStock, outOfStock };
  }, [products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-gray-600">
              Manage your product catalog with barcode support
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/products/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-xl font-bold">{stats.totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Scan className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">With Barcodes</p>
                <p className="text-xl font-bold">{stats.withBarcodes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-xl font-bold">{stats.inStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-xl font-bold">{stats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-xl font-bold">{stats.outOfStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Scan Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Quick Product Lookup
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Scan Barcode</Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scan Product</DialogTitle>
                <DialogDescription>
                  Scan or enter a barcode to quickly find product information
                </DialogDescription>
              </DialogHeader>

              {/* Form atau komponen lainnya */}
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="quickScan">Barcode</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="quickScan"
                  value={quickScanBarcode}
                  onChange={(e) => setQuickScanBarcode(e.target.value)}
                  onKeyDown={handleScanInput}
                  placeholder="Scan or type barcode here..."
                  className="font-mono"
                  disabled={isScanning}
                />
                <Button
                  onClick={() => handleQuickScan()}
                  disabled={isScanning || !quickScanBarcode}
                  variant="outline">
                  {isScanning ? "Scanning..." : "Scan"}
                </Button>
              </div>
            </div>
          </div>

          {/* Scan Error */}
          {scanError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Scan Error</AlertTitle>
              <AlertDescription>{scanError}</AlertDescription>
            </Alert>
          )}

          {/* Scan Result */}
          {scanResult && (
            <Alert className="mt-4 bg-gray-700 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-200">Product Found!</AlertTitle>
              <AlertDescription className="text-green-200">
                <div className="mt-2 space-y-1">
                  <p>
                    <strong>Product:</strong> {scanResult.product.name}
                  </p>
                  <p>
                    <strong>Unit Type:</strong>{" "}
                    {scanResult.scan_info.detected_unit_type}
                  </p>
                  <p>
                    <strong>Available:</strong>{" "}
                    {scanResult.scan_info.available_units}{" "}
                    {scanResult.scan_info.detected_unit_type}(s)
                  </p>
                  <p>
                    <strong>Total Stock:</strong>{" "}
                    {scanResult.scan_info.total_pieces_in_stock} pieces
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, part number, barcode, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Stock Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>{filteredProducts.length} products</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Info</TableHead>
                  <TableHead>Barcodes</TableHead>
                  <TableHead>Unit Conversion</TableHead>
                  <TableHead>Stock Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(
                    product.total_stock_pieces || 0
                  );
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            {product.part_number}
                          </div>
                          <div className="text-xs text-gray-500">
                            {product.category_name} • {product.base_unit_name}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <BarcodeDisplay product={product} />
                        <div className="text-xs text-gray-500 mt-1">
                          {getBarcodeCount(product)} barcode(s)
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>1 Pack = {product.pieces_per_pack} pieces</div>
                          <div>1 Box = {product.packs_per_box} packs</div>
                          <div className="text-xs text-gray-500">
                            = {product.pieces_per_pack * product.packs_per_box}{" "}
                            pieces/box
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="space-y-2">
                          <Badge className={stockStatus.color}>
                            <span className="flex items-center gap-1">
                              {stockStatus.icon}
                              {stockStatus.text}
                            </span>
                          </Badge>
                          <div className="text-sm font-medium">
                            {(product.total_stock_pieces || 0).toLocaleString()}{" "}
                            pieces
                          </div>
                          {product.total_stock_pieces &&
                            product.total_stock_pieces > 0 && (
                              <div className="text-xs text-gray-500 space-y-1">
                                <div>
                                  {Math.floor(
                                    product.total_stock_pieces /
                                      product.pieces_per_pack
                                  )}{" "}
                                  packs
                                </div>
                                <div>
                                  {Math.floor(
                                    product.total_stock_pieces /
                                      (product.pieces_per_pack *
                                        product.packs_per_box)
                                  )}{" "}
                                  boxes
                                </div>
                              </div>
                            )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium">
                          {formatPrice(product.price)}
                        </div>
                        <div className="text-xs text-gray-500">
                          per {product.base_unit_name}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Product Details</DialogTitle>
                              <DialogDescription>
                                Complete information for {selectedProduct?.name}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedProduct && (
                              <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-medium mb-3">
                                      Basic Information
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Name:
                                        </span>
                                        <span className="font-medium">
                                          {selectedProduct.name}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Part Number:
                                        </span>
                                        <span className="font-medium">
                                          {selectedProduct.part_number}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Category:
                                        </span>
                                        <span className="font-medium">
                                          {selectedProduct.category_name}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Base Unit:
                                        </span>
                                        <span className="font-medium">
                                          {selectedProduct.base_unit_name}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">
                                          Price:
                                        </span>
                                        <span className="font-medium">
                                          {formatPrice(selectedProduct.price)}
                                        </span>
                                      </div>
                                    </div>

                                    {selectedProduct.description && (
                                      <div className="mt-4">
                                        <h5 className="font-medium mb-2">
                                          Description
                                        </h5>
                                        <p className="text-sm text-gray-600">
                                          {selectedProduct.description}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <div>
                                    <h4 className="font-medium mb-3">
                                      Stock Information
                                    </h4>
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-2">
                                        <span className="text-gray-600">
                                          Status:
                                        </span>
                                        <Badge
                                          className={
                                            getStockStatus(
                                              selectedProduct.total_stock_pieces ||
                                                0
                                            ).color
                                          }>
                                          <span className="flex items-center gap-1">
                                            {
                                              getStockStatus(
                                                selectedProduct.total_stock_pieces ||
                                                  0
                                              ).icon
                                            }
                                            {
                                              getStockStatus(
                                                selectedProduct.total_stock_pieces ||
                                                  0
                                              ).text
                                            }
                                          </span>
                                        </Badge>
                                      </div>

                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="bg-blue-50 p-3 rounded">
                                          <p className="text-blue-600 font-medium">
                                            Total Pieces
                                          </p>
                                          <p className="text-xl font-bold text-blue-800">
                                            {(
                                              selectedProduct.total_stock_pieces ||
                                              0
                                            ).toLocaleString()}
                                          </p>
                                        </div>

                                        <div className="bg-green-50 p-3 rounded">
                                          <p className="text-green-600 font-medium">
                                            Available Packs
                                          </p>
                                          <p className="text-xl font-bold text-green-800">
                                            {Math.floor(
                                              (selectedProduct.total_stock_pieces ||
                                                0) /
                                                selectedProduct.pieces_per_pack
                                            )}
                                          </p>
                                        </div>

                                        <div className="bg-purple-50 p-3 rounded">
                                          <p className="text-purple-600 font-medium">
                                            Available Boxes
                                          </p>
                                          <p className="text-xl font-bold text-purple-800">
                                            {Math.floor(
                                              (selectedProduct.total_stock_pieces ||
                                                0) /
                                                (selectedProduct.pieces_per_pack *
                                                  selectedProduct.packs_per_box)
                                            )}
                                          </p>
                                        </div>

                                        <div className="bg-gray-50 p-3 rounded">
                                          <p className="text-gray-600 font-medium">
                                            Unit Conversion
                                          </p>
                                          <p className="text-sm">
                                            1 Pack ={" "}
                                            {selectedProduct.pieces_per_pack}{" "}
                                            pcs
                                            <br />1 Box ={" "}
                                            {selectedProduct.packs_per_box}{" "}
                                            packs
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Barcode Configuration */}
                                <div>
                                  <h4 className="font-medium mb-3">
                                    Barcode Configuration
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {selectedProduct.piece_barcode && (
                                      <div className="border rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                          <Badge className="bg-blue-500">
                                            <Package className="h-3 w-3 mr-1" />
                                            Piece
                                          </Badge>
                                        </div>
                                        <code className="text-sm font-mono block break-all bg-gray-100 p-2 rounded">
                                          {selectedProduct.piece_barcode}
                                        </code>
                                        <p className="text-xs text-gray-500 mt-2">
                                          Individual unit barcode
                                        </p>
                                      </div>
                                    )}

                                    {selectedProduct.pack_barcode && (
                                      <div className="border rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                          <Badge className="bg-green-500">
                                            <Layers className="h-3 w-3 mr-1" />
                                            Pack
                                          </Badge>
                                        </div>
                                        <code className="text-sm font-mono block break-all bg-gray-100 p-2 rounded">
                                          {selectedProduct.pack_barcode}
                                        </code>
                                        <p className="text-xs text-gray-500 mt-2">
                                          Pack barcode (1 pack ={" "}
                                          {selectedProduct.pieces_per_pack}{" "}
                                          pieces)
                                        </p>
                                      </div>
                                    )}

                                    {selectedProduct.box_barcode && (
                                      <div className="border rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                          <Badge className="bg-purple-500">
                                            <Box className="h-3 w-3 mr-1" />
                                            Box
                                          </Badge>
                                        </div>
                                        <code className="text-sm font-mono block break-all bg-gray-100 p-2 rounded">
                                          {selectedProduct.box_barcode}
                                        </code>
                                        <p className="text-xs text-gray-500 mt-2">
                                          Box barcode (1 box ={" "}
                                          {selectedProduct.packs_per_box} packs
                                          ={" "}
                                          {selectedProduct.pieces_per_pack *
                                            selectedProduct.packs_per_box}{" "}
                                          pieces)
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {getBarcodeCount(selectedProduct) === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                      <Scan className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                      <p>
                                        No barcodes configured for this product
                                      </p>
                                      <p className="text-sm">
                                        Edit the product to add barcode
                                        information
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Recent Scan Result Display */}
                                {scanResult &&
                                  scanResult.product.id ===
                                    selectedProduct.id && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                      <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                                        <Scan className="h-4 w-4" />
                                        Recent Scan Result
                                      </h4>
                                      <div className="text-sm space-y-1">
                                        <div>
                                          <strong>Scanned Barcode:</strong>{" "}
                                          <code className="bg-white px-1 rounded">
                                            {
                                              scanResult.scan_info
                                                .scanned_barcode
                                            }
                                          </code>
                                        </div>
                                        <div>
                                          <strong>Detected Unit:</strong>{" "}
                                          {
                                            scanResult.scan_info
                                              .detected_unit_type
                                          }
                                        </div>
                                        <div>
                                          <strong>Available Units:</strong>{" "}
                                          {scanResult.scan_info.available_units}
                                        </div>
                                        <div>
                                          <strong>Total Stock:</strong>{" "}
                                          {
                                            scanResult.scan_info
                                              .total_pieces_in_stock
                                          }{" "}
                                          pieces
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="mb-4">
                  {searchTerm || stockFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "Add your first product to get started"}
                </p>
                {!searchTerm && stockFilter === "all" && (
                  <Button
                    onClick={() => router.push("/products/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Product
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
