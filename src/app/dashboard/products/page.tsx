// app/dashboard/products/page.tsx
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApi } from "@/lib/hooks/useApi";
import { getAllProducts, deleteProduct } from "@/lib/api/services";
import { Product } from "@/lib/api/types";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Filter,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Zap,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function ProductsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Fetch products data
  const {
    data: products,
    isLoading,
    error,
    refetch,
  } = useApi<Product[]>({
    fetchFn: (token) => getAllProducts(token).then((res) => res.data || []),
    deps: [],
  });

  // Handle delete confirmation
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct(
        localStorage.getItem("token") || "",
        productToDelete.id
      );
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      refetch(); // Refresh the product list
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Create categories from products for filter
  const categories = useMemo(() => {
    if (!products) return [{ value: "all", label: "All Categories" }];

    const uniqueCategories = [
      ...new Set(products.map((p) => p.category_name).filter(Boolean)),
    ];

    return [
      { value: "all", label: "All Categories" },
      ...uniqueCategories.map((cat) => ({ value: cat, label: cat })),
    ];
  }, [products]);

  // Filter products based on search, category, and status
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category_name &&
          product.category_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" ||
        product.category_name === selectedCategory;
      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, selectedCategory, statusFilter]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle view product details
  const handleViewProduct = (productId: string) => {
    router.push(`/dashboard/products/${productId}`);
  };

  // Handle edit product
  const handleEditProduct = (productId: string) => {
    router.push(`/dashboard/products/edit/${productId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="p-6 max-w-md">
          <div className="flex items-center space-x-2 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
            <h3 className="text-lg font-medium">Error Loading Products</h3>
          </div>
          <p className="text-gray-700">{error.message}</p>
          <Button className="mt-4 w-full" onClick={() => refetch()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  // Calculate stats for the stats cards
  const totalProducts = products?.length || 0;
  const activeProducts =
    products?.filter((p) => p.status === "active").length || 0;
  const inactiveProducts =
    products?.filter((p) => p.status === "inactive").length || 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link href="/dashboard/products/create">
          <Button className="gap-2">
            <Plus size={16} />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Products</p>
                <p className="text-2xl font-bold">{activeProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Inactive Products
                </p>
                <p className="text-2xl font-bold">{inactiveProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <AlertCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">
                  {categories.length - 1}{" "}
                  {/* Subtract 1 for the "All" option */}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Products ({filteredProducts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Product</th>
                    <th className="text-left py-3 px-2 font-medium">
                      Part Number
                    </th>
                    <th className="text-left py-3 px-2 font-medium">
                      Category
                    </th>
                    <th className="text-left py-3 px-2 font-medium">
                      Base Unit
                    </th>
                    <th className="text-left py-3 px-2 font-medium">Price</th>
                    <th className="text-left py-3 px-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.description || "No description"}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <code className="px-2 py-1 bg-muted rounded text-sm">
                          {product.part_number}
                        </code>
                      </td>
                      <td className="py-3 px-2">
                        {product.category_name || "-"}
                      </td>
                      <td className="py-3 px-2">
                        {product.base_unit_name || "-"}
                      </td>
                      <td className="py-3 px-2">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="py-3 px-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewProduct(product.id)}>
                              <Eye size={14} className="mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditProduct(product.id)}>
                              <Edit size={14} className="mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <Separator className="my-1" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(product)}
                              className="text-red-600">
                              <Trash2 size={14} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package
                size={48}
                className="mx-auto text-muted-foreground mb-4"
              />
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground">
                {searchQuery ||
                selectedCategory !== "all" ||
                statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first product"}
              </p>
              {!searchQuery &&
                selectedCategory === "all" &&
                statusFilter === "all" && (
                  <Link href="/dashboard/products/create">
                    <Button className="mt-4">
                      <Plus size={16} className="mr-2" />
                      Add Product
                    </Button>
                  </Link>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Are you sure you want to delete the product{" "}
              <strong>{productToDelete?.name}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
