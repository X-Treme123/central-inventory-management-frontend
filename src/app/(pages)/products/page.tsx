// app/(dashboard)/products/page.tsx - Enhanced with improved UX and edge case handling
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
import { Skeleton } from "@/components/ui/skeleton";
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
  RefreshCw,
  Edit,
  Trash2,
  X,
  Activity,
  TrendingUp,
  Database,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllProducts, scanBarcode } from "@/features/pages/products/api/index";
import type { Product, BarcodeScanResponse } from "@/features/pages/products/api/index";

export default function ProductsPage() {
  const { token } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Quick scan states
  const [quickScanBarcode, setQuickScanBarcode] = useState("");
  const [scanResult, setScanResult] = useState<BarcodeScanResponse | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanDialogOpen, setScanDialogOpen] = useState(false);

  // Filter states
  const [stockFilter, setStockFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [barcodeFilter, setBarcodeFilter] = useState("all");

  useEffect(() => {
    if (token) {
      loadProducts();
    }
  }, [token]);

  const loadProducts = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      const response = await getAllProducts(token!);
      if (response.code === "200" && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Enhanced filtering with multiple criteria
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

      // Category filter
      const matchesCategory = categoryFilter === "all" || 
        product.category_name === categoryFilter;

      // Barcode filter
      let matchesBarcode = true;
      if (barcodeFilter === "with_barcodes") {
        matchesBarcode = getBarcodeCount(product) > 0;
      } else if (barcodeFilter === "no_barcodes") {
        matchesBarcode = getBarcodeCount(product) === 0;
      }

      return matchesSearch && matchesStock && matchesCategory && matchesBarcode;
    });
  }, [products, searchTerm, stockFilter, categoryFilter, barcodeFilter]);

  // Enhanced quick scan with better UX
  const handleQuickScan = async (barcode?: string) => {
    const barcodeToScan = barcode || quickScanBarcode;
    if (!barcodeToScan?.trim()) {
      setScanError("Please enter a barcode first");
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const response = await scanBarcode(token!, barcodeToScan.trim());
      if (response.code === "200" && response.data) {
        setScanResult(response.data);
        
        // Auto-select the product for detailed view
        const product = products.find(
          (p) => p.id === response.data!.product.id
        );
        if (product) {
          setSelectedProduct(product);
        }
        
        // Clear and close scan dialog
        setQuickScanBarcode("");
        setScanDialogOpen(false);
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

  // Enhanced scan input handling
  const handleScanInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleQuickScan();
    }
  };

  // Clear scan result after timeout
  useEffect(() => {
    if (scanResult) {
      const timer = setTimeout(() => {
        setScanResult(null);
      }, 10000); // Clear after 10 seconds
      return () => clearTimeout(timer);
    }
  }, [scanResult]);

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
        color: "bg-gradient-to-r from-red-500 to-red-600 text-white",
        text: "Out of Stock",
        icon: <AlertCircle className="h-3 w-3" />,
      };
    if (stock <= 100)
      return {
        color: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white",
        text: "Low Stock",
        icon: <AlertCircle className="h-3 w-3" />,
      };
    return {
      color: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
      text: "In Stock",
      icon: <CheckCircle2 className="h-3 w-3" />,
    };
  };

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category_name).filter(Boolean))];
    return uniqueCategories.sort();
  }, [products]);

  // Enhanced stats calculation
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const withBarcodes = products.filter((p) => getBarcodeCount(p) > 0).length;
    const inStock = products.filter((p) => (p.total_stock_pieces || 0) > 100).length;
    const lowStock = products.filter((p) => {
      const stock = p.total_stock_pieces || 0;
      return stock > 0 && stock <= 100;
    }).length;
    const outOfStock = products.filter((p) => (p.total_stock_pieces || 0) === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * (p.total_stock_pieces || 0)), 0);

    return { totalProducts, withBarcodes, inStock, lowStock, outOfStock, totalValue };
  }, [products]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
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
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
            <BarcodeIcon type="piece" />
            <span className="ml-1">PC</span>
          </Badge>
          <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded">
            {product.piece_barcode}
          </code>
        </div>
      )}
      {product.pack_barcode && (
        <div className="flex items-center gap-1 text-xs">
          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
            <BarcodeIcon type="pack" />
            <span className="ml-1">PK</span>
          </Badge>
          <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded">
            {product.pack_barcode}
          </code>
        </div>
      )}
      {product.box_barcode && (
        <div className="flex items-center gap-1 text-xs">
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
            <BarcodeIcon type="box" />
            <span className="ml-1">BX</span>
          </Badge>
          <code className="text-xs font-mono bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded">
            {product.box_barcode}
          </code>
        </div>
      )}
      {getBarcodeCount(product) === 0 && (
        <div className="text-xs text-gray-500 italic">No barcodes</div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-6 w-12" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Table Skeleton */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Enhanced Header */}
          <motion.div variants={cardVariants} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Products Inventory
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Manage your product catalog with advanced barcode support and real-time tracking
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => loadProducts(true)}
                  disabled={refreshing}
                  className="border-gray-200 dark:border-gray-700"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => router.push("/products/create")}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.totalProducts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                    <Scan className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">With Barcodes</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.withBarcodes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">In Stock</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.inStock}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.lowStock}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatPrice(stats.totalValue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Quick Scan Section */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  Quick Product Lookup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="quickScan" className="text-gray-700 dark:text-gray-300">
                      Barcode Scanner
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="quickScan"
                        value={quickScanBarcode}
                        onChange={(e) => setQuickScanBarcode(e.target.value)}
                        onKeyDown={handleScanInput}
                        placeholder="Scan or type barcode here..."
                        className="font-mono bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                        disabled={isScanning}
                      />
                      <Button
                        onClick={() => handleQuickScan()}
                        disabled={isScanning || !quickScanBarcode.trim()}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                      >
                        <Scan className="h-4 w-4 mr-2" />
                        {isScanning ? "Scanning..." : "Scan"}
                      </Button>
                      <Dialog open={scanDialogOpen} onOpenChange={setScanDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-gray-200 dark:border-gray-700">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Advanced
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-gray-900 dark:text-gray-100">Advanced Barcode Scanner</DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400">
                              Use advanced scanning features and batch processing
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="advancedScan">Barcode Input</Label>
                              <Input
                                id="advancedScan"
                                value={quickScanBarcode}
                                onChange={(e) => setQuickScanBarcode(e.target.value)}
                                onKeyDown={handleScanInput}
                                placeholder="Enter barcode..."
                                className="font-mono"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleQuickScan()}
                                disabled={isScanning || !quickScanBarcode.trim()}
                                className="flex-1"
                              >
                                {isScanning ? "Scanning..." : "Scan Product"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setQuickScanBarcode("");
                                  setScanError(null);
                                  setScanResult(null);
                                }}
                              >
                                Clear
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                {/* Enhanced Error Display */}
                <AnimatePresence>
                  {scanError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Scan Error</AlertTitle>
                        <AlertDescription>{scanError}</AlertDescription>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setScanError(null)}
                          className="absolute top-2 right-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Enhanced Success Display */}
                <AnimatePresence>
                  {scanResult && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Alert className="mt-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <AlertTitle className="text-green-800 dark:text-green-200">Product Found!</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-300">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div className="space-y-2">
                              <p><strong>Product:</strong> {scanResult.product.name}</p>
                              <p><strong>Unit Type:</strong> {scanResult.scan_info.detected_unit_type}</p>
                            </div>
                            <div className="space-y-2">
                              <p><strong>Available:</strong> {scanResult.scan_info.available_units} {scanResult.scan_info.detected_unit_type}(s)</p>
                              <p><strong>Total Stock:</strong> {scanResult.scan_info.total_pieces_in_stock} pieces</p>
                            </div>
                          </div>
                        </AlertDescription>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setScanResult(null)}
                          className="absolute top-2 right-2"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Search and Filters */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, part number, barcode, or category..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  {/* Filter Row */}
                  <div className="flex flex-wrap gap-4 items-center">
                    <Select value={stockFilter} onValueChange={setStockFilter}>
                      <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Stock Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Stock</SelectItem>
                        <SelectItem value="in_stock">In Stock</SelectItem>
                        <SelectItem value="low_stock">Low Stock</SelectItem>
                        <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={barcodeFilter} onValueChange={setBarcodeFilter}>
                      <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Barcode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Products</SelectItem>
                        <SelectItem value="with_barcodes">With Barcodes</SelectItem>
                        <SelectItem value="no_barcodes">No Barcodes</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Results Counter */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-auto">
                      <Filter className="h-4 w-4" />
                      <span>{filteredProducts.length} of {products.length} products</span>
                    </div>

                    {/* Clear Filters */}
                    {(searchTerm || stockFilter !== "all" || categoryFilter !== "all" || barcodeFilter !== "all") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setStockFilter("all");
                          setCategoryFilter("all");
                          setBarcodeFilter("all");
                        }}
                        className="border-gray-200 dark:border-gray-700"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Products Table */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Product Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 dark:border-gray-700">
                          <TableHead className="text-gray-700 dark:text-gray-300">Product Info</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-300">Barcodes</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-300">Unit Conversion</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-300">Stock Status</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-300">Price</TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredProducts.map((product, index) => {
                          const stockStatus = getStockStatus(product.total_stock_pieces || 0);
                          return (
                            <motion.tr
                              key={product.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">{product.part_number}</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-500">
                                    {product.category_name} • {product.base_unit_name}
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <BarcodeDisplay product={product} />
                                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                  {getBarcodeCount(product)} barcode(s)
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                                  <div>1 Pack = {product.pieces_per_pack} pieces</div>
                                  <div>1 Box = {product.packs_per_box} packs</div>
                                  <div className="text-xs text-gray-500 dark:text-gray-500">
                                    = {product.pieces_per_pack * product.packs_per_box} pieces/box
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="space-y-2">
                                  <Badge className={`${stockStatus.color} shadow-sm`}>
                                    <span className="flex items-center gap-1">
                                      {stockStatus.icon}
                                      {stockStatus.text}
                                    </span>
                                  </Badge>
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {(product.total_stock_pieces || 0).toLocaleString()} pieces
                                  </div>
                                  {product.total_stock_pieces && product.total_stock_pieces > 0 && (
                                    <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                                      <div>
                                        {Math.floor(product.total_stock_pieces / product.pieces_per_pack)} packs
                                      </div>
                                      <div>
                                        {Math.floor(
                                          product.total_stock_pieces / (product.pieces_per_pack * product.packs_per_box)
                                        )} boxes
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                  {formatPrice(product.price)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-500">
                                  per {product.base_unit_name}
                                </div>
                              </TableCell>

                              <TableCell>
                                <div className="flex gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedProduct(product)}
                                        className="border-gray-200 dark:border-gray-700"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                      <DialogHeader>
                                        <DialogTitle className="text-gray-900 dark:text-gray-100">Product Details</DialogTitle>
                                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                                          Complete information for {selectedProduct?.name}
                                        </DialogDescription>
                                      </DialogHeader>
                                      {selectedProduct && (
                                        <div className="space-y-6">
                                          {/* Enhanced Product Details Content */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                              <h4 className="font-medium text-gray-900 dark:text-gray-100">Basic Information</h4>
                                              <div className="space-y-3 text-sm">
                                                {[
                                                  { label: "Name", value: selectedProduct.name },
                                                  { label: "Part Number", value: selectedProduct.part_number },
                                                  { label: "Category", value: selectedProduct.category_name },
                                                  { label: "Base Unit", value: selectedProduct.base_unit_name },
                                                  { label: "Price", value: formatPrice(selectedProduct.price) }
                                                ].map((item, i) => (
                                                  <div key={i} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                                                    <span className="text-gray-600 dark:text-gray-400">{item.label}:</span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{item.value}</span>
                                                  </div>
                                                ))}
                                              </div>

                                              {selectedProduct.description && (
                                                <div>
                                                  <h5 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Description</h5>
                                                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                    {selectedProduct.description}
                                                  </p>
                                                </div>
                                              )}
                                            </div>

                                            <div className="space-y-4">
                                              <h4 className="font-medium text-gray-900 dark:text-gray-100">Stock Information</h4>
                                              <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                                  <Badge className={getStockStatus(selectedProduct.total_stock_pieces || 0).color}>
                                                    <span className="flex items-center gap-1">
                                                      {getStockStatus(selectedProduct.total_stock_pieces || 0).icon}
                                                      {getStockStatus(selectedProduct.total_stock_pieces || 0).text}
                                                    </span>
                                                  </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                  {[
                                                    {
                                                      label: "Total Pieces",
                                                      value: (selectedProduct.total_stock_pieces || 0).toLocaleString(),
                                                      gradient: "from-blue-500 to-blue-600"
                                                    },
                                                    {
                                                      label: "Available Packs",
                                                      value: Math.floor((selectedProduct.total_stock_pieces || 0) / selectedProduct.pieces_per_pack),
                                                      gradient: "from-green-500 to-green-600"
                                                    },
                                                    {
                                                      label: "Available Boxes",
                                                      value: Math.floor((selectedProduct.total_stock_pieces || 0) / (selectedProduct.pieces_per_pack * selectedProduct.packs_per_box)),
                                                      gradient: "from-purple-500 to-purple-600"
                                                    },
                                                    {
                                                      label: "Total Value",
                                                      value: formatPrice((selectedProduct.total_stock_pieces || 0) * selectedProduct.price),
                                                      gradient: "from-emerald-500 to-emerald-600"
                                                    }
                                                  ].map((stat, i) => (
                                                    <div key={i} className={`bg-gradient-to-r ${stat.gradient} p-4 rounded-lg text-white`}>
                                                      <p className="text-sm opacity-90">{stat.label}</p>
                                                      <p className="text-lg font-bold">{stat.value}</p>
                                                    </div>
                                                  ))}
                                                </div>

                                                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Conversion</p>
                                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                                    1 Pack = {selectedProduct.pieces_per_pack} pieces<br />
                                                    1 Box = {selectedProduct.packs_per_box} packs
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Enhanced Barcode Section */}
                                          <div>
                                            <h4 className="font-medium mb-4 text-gray-900 dark:text-gray-100">Barcode Configuration</h4>
                                            {getBarcodeCount(selectedProduct) > 0 ? (
                                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[
                                                  { type: "piece", barcode: selectedProduct.piece_barcode, icon: Package, color: "blue", description: "Individual unit barcode" },
                                                  { type: "pack", barcode: selectedProduct.pack_barcode, icon: Layers, color: "green", description: `Pack barcode (1 pack = ${selectedProduct.pieces_per_pack} pieces)` },
                                                  { type: "box", barcode: selectedProduct.box_barcode, icon: Box, color: "purple", description: `Box barcode (1 box = ${selectedProduct.packs_per_box} packs = ${selectedProduct.pieces_per_pack * selectedProduct.packs_per_box} pieces)` }
                                                ].filter(item => item.barcode).map((item, i) => (
                                                  <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                                    <div className="flex items-center gap-2 mb-3">
                                                      <Badge className={`bg-${item.color}-500 text-white`}>
                                                        <item.icon className="h-3 w-3 mr-1" />
                                                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                                      </Badge>
                                                    </div>
                                                    <code className="text-sm font-mono block break-all bg-white dark:bg-gray-800 p-3 rounded border text-gray-800 dark:text-gray-200">
                                                      {item.barcode}
                                                    </code>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{item.description}</p>
                                                  </div>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                <Scan className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                                                <h5 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Barcodes Configured</h5>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                                  This product doesn't have any barcode information yet
                                                </p>
                                                <Button size="sm" variant="outline" className="border-gray-200 dark:border-gray-600">
                                                  <Edit className="h-4 w-4 mr-2" />
                                                  Edit Product
                                                </Button>
                                              </div>
                                            )}
                                          </div>

                                          {/* Recent Scan Result */}
                                          {scanResult && scanResult.product.id === selectedProduct.id && (
                                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                              <h4 className="font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                                                <Activity className="h-4 w-4" />
                                                Recent Scan Result
                                              </h4>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className="space-y-2">
                                                  <div>
                                                    <strong>Scanned Barcode:</strong>
                                                    <code className="ml-2 bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs">
                                                      {scanResult.scan_info.scanned_barcode}
                                                    </code>
                                                  </div>
                                                  <div><strong>Detected Unit:</strong> {scanResult.scan_info.detected_unit_type}</div>
                                                </div>
                                                <div className="space-y-2">
                                                  <div><strong>Available Units:</strong> {scanResult.scan_info.available_units}</div>
                                                  <div><strong>Total Stock:</strong> {scanResult.scan_info.total_pieces_in_stock} pieces</div>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  /* Enhanced Empty State */
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Package className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                      {searchTerm || stockFilter !== "all" || categoryFilter !== "all" || barcodeFilter !== "all" 
                        ? "No products match your filters" 
                        : "No products found"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {searchTerm || stockFilter !== "all" || categoryFilter !== "all" || barcodeFilter !== "all"
                        ? "Try adjusting your search criteria or filters to find what you're looking for"
                        : "Get started by adding your first product to the inventory system"}
                    </p>
                    <div className="flex gap-3 justify-center">
                      {searchTerm || stockFilter !== "all" || categoryFilter !== "all" || barcodeFilter !== "all" ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("");
                            setStockFilter("all");
                            setCategoryFilter("all");
                            setBarcodeFilter("all");
                          }}
                          className="border-gray-200 dark:border-gray-700"
                        >
                          Clear All Filters
                        </Button>
                      ) : (
                        <Button
                          onClick={() => router.push("/products/create")}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Your First Product
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}