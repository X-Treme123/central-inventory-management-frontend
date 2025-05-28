// app/(dashboard)/categories/page.tsx - Fixed
"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/hooks/useApi";
import { getAllCategories, deleteCategory } from "@/features/dashboard/categories/api/index";
import { Category } from "@/features/dashboard/categories/api/index";
import { useAuth } from "@/context/AuthContext";
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Filter,
  Folder,
  Package,
  RefreshCcw,
  Calendar,
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
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function CategoriesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories from API
  const {
    data: categories,
    isLoading,
    error,
    refetch,
  } = useApi<Category[]>({
    fetchFn: (token) => getAllCategories(token).then((res) => res.data || []),
    deps: [],
  });

  // Filter categories based on search only
  const filteredCategories = useMemo(() => {
    if (!categories) return [];

    return categories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description &&
          category.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [categories, searchQuery]);

  // Handle category deletion
  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete || !token) return;

    setIsDeleting(true);
    try {
      await deleteCategory(token, categoryToDelete.id);
      toast.success("Category deleted successfully");
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
      refetch(); // Refresh the list
    } catch (err: any) {
      console.error("Error deleting category:", err);
      toast.error(err.message || "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle view and edit actions
  const handleViewCategory = (categoryId: string) => {
    // This could navigate to a detail view if you have one
    console.log("View category:", categoryId);
  };

  const handleEditCategory = (categoryId: string) => {
    router.push(`/categories/edit/${categoryId}`);
  };

  // Handle category creation
  const handleCreateCategory = () => {
    router.push("/categories/create");
  };

  // Calculate stats for the dashboard
  const totalCategories = categories?.length || 0;
  const categoriesWithProducts = categories?.filter(cat => (cat.product_count || 0) > 0).length || 0;
  const categoriesWithoutProducts = totalCategories - categoriesWithProducts;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading categories...</p>
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
            <Trash2 className="h-6 w-6" />
            <h3 className="text-lg font-medium">Error Loading Categories</h3>
          </div>
          <p className="text-gray-700">{error.message}</p>
          <Button className="mt-4 w-full" onClick={() => refetch()}>
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">
            Organize your products into categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCcw size={16} className="mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateCategory} className="gap-2">
            <Plus size={16} />
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Folder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold">{totalCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">With Products</p>
                <p className="text-2xl font-bold">{categoriesWithProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <Folder className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Empty Categories</p>
                <p className="text-2xl font-bold">{categoriesWithoutProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter size={14} />
                Advanced Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {category.description || "No description provided"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewCategory(category.id)}>
                        <Eye size={14} className="mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditCategory(category.id)}>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <Separator className="my-1" />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(category)}
                        className="text-red-600"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {/* Product Count (if available) */}
                  {typeof category.product_count === 'number' && (
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-muted-foreground" />
                      <span className="text-sm">
                        {category.product_count} product{category.product_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Created Date */}
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Calendar size={14} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Created: {new Date(category.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Folder size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No categories found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first category to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={handleCreateCategory} className="mt-4">
                <Plus size={16} className="mr-2" />
                Add Category
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.name}"? 
              This action cannot be undone and may affect related products.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}