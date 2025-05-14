'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
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
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Mock data based on the provided structure
const mockProducts = [
  {
    product_id: 1,
    product_name: "Laptop Dell XPS 13",
    category_id: 1,
    category_name: "Electronics",
    category_type: "GA",
    description: "High-performance laptop for office use",
    status: "active",
    sku: "LAP-DEL-001",
    cost_center: "IT-DEPT",
    approval_threshold: 5000000,
    units: [
      {
        unit_name: "Piece",
        unit_code: "PCS",
        is_base_unit: true,
        conversion_factor: 1.0
      },
      {
        unit_name: "Box",
        unit_code: "BOX",
        is_base_unit: false,
        conversion_factor: 4.0
      }
    ]
  },
  {
    product_id: 2,
    product_name: "Office Chair Ergonomic",
    category_id: 2,
    category_name: "Furniture",
    category_type: "GA",
    description: "Ergonomic office chair with adjustable height",
    status: "active",
    sku: "CHR-ERG-001",
    cost_center: "ADMIN",
    approval_threshold: 2000000,
    units: [
      {
        unit_name: "Piece",
        unit_code: "PCS",
        is_base_unit: true,
        conversion_factor: 1.0
      }
    ]
  },
  {
    product_id: 3,
    product_name: "A4 Copy Paper",
    category_id: 3,
    category_name: "Office Supplies",
    category_type: "GA",
    description: "Standard A4 white copy paper",
    status: "active",
    sku: "PPR-A4-001",
    cost_center: "ADMIN",
    approval_threshold: 1000000,
    units: [
      {
        unit_name: "Pack",
        unit_code: "PACK",
        is_base_unit: true,
        conversion_factor: 1.0
      },
      {
        unit_name: "Box",
        unit_code: "BOX",
        is_base_unit: false,
        conversion_factor: 5.0
      },
      {
        unit_name: "Carton",
        unit_code: "CTN",
        is_base_unit: false,
        conversion_factor: 20.0
      }
    ]
  },
  {
    product_id: 4,
    product_name: "Safety Helmet",
    category_id: 4,
    category_name: "Safety Equipment",
    category_type: "NON-GA",
    description: "Hard hat for construction site safety",
    status: "active",
    sku: "SAF-HLM-001",
    cost_center: "PRODUCTION",
    approval_threshold: 0,
    units: [
      {
        unit_name: "Piece",
        unit_code: "PCS",
        is_base_unit: true,
        conversion_factor: 1.0
      },
      {
        unit_name: "Box",
        unit_code: "BOX",
        is_base_unit: false,
        conversion_factor: 12.0
      }
    ]
  },
  {
    product_id: 5,
    product_name: "Steel Rods 6mm",
    category_id: 5,
    category_name: "Raw Materials",
    category_type: "NON-GA",
    description: "Steel construction rods",
    status: "active",
    sku: "STL-ROD-6MM",
    cost_center: "PRODUCTION",
    approval_threshold: 500000,
    units: [
      {
        unit_name: "Kilogram",
        unit_code: "KG",
        is_base_unit: true,
        conversion_factor: 1.0
      },
      {
        unit_name: "Piece",
        unit_code: "PCS",
        is_base_unit: false,
        conversion_factor: 0.88
      },
      {
        unit_name: "Meter",
        unit_code: "MTR",
        is_base_unit: false,
        conversion_factor: 0.222
      }
    ]
  },
  {
    product_id: 6,
    product_name: "Hydraulic Oil ISO 32",
    category_id: 6,
    category_name: "Lubricants",
    category_type: "NON-GA",
    description: "Industrial hydraulic oil",
    status: "active",
    sku: "OIL-HYD-32",
    cost_center: "MAINTENANCE",
    approval_threshold: 0,
    units: [
      {
        unit_name: "Liter",
        unit_code: "LTR",
        is_base_unit: true,
        conversion_factor: 1.0
      },
      {
        unit_name: "Drum",
        unit_code: "DRUM",
        is_base_unit: false,
        conversion_factor: 200.0
      }
    ]
  },
  {
    product_id: 7,
    product_name: "Medical First Aid Kit",
    category_id: 7,
    category_name: "Medical Supplies",
    category_type: "MIXED",
    description: "Complete first aid kit for medical emergencies",
    status: "active",
    sku: "MED-FAK-001",
    cost_center: "HSE",
    approval_threshold: 250000,
    units: [
      {
        unit_name: "Piece",
        unit_code: "PCS",
        is_base_unit: true,
        conversion_factor: 1.0
      },
      {
        unit_name: "Pack",
        unit_code: "PACK",
        is_base_unit: false,
        conversion_factor: 10.0
      }
    ]
  },
  {
    product_id: 8,
    product_name: "Cleaning Detergent",
    category_id: 8,
    category_name: "Consumables",
    category_type: "MIXED",
    description: "Multi-purpose cleaning detergent",
    status: "inactive",
    sku: "CLN-DET-001",
    cost_center: "GENERAL",
    approval_threshold: 100000,
    units: [
      {
        unit_name: "Liter",
        unit_code: "LTR",
        is_base_unit: true,
        conversion_factor: 1.0
      },
      {
        unit_name: "Piece",
        unit_code: "PCS",
        is_base_unit: false,
        conversion_factor: 0.5
      }
    ]
  }
];

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Office Supplies', label: 'Office Supplies' },
  { value: 'Safety Equipment', label: 'Safety Equipment' },
  { value: 'Raw Materials', label: 'Raw Materials' },
  { value: 'Lubricants', label: 'Lubricants' },
  { value: 'Medical Supplies', label: 'Medical Supplies' },
  { value: 'Consumables', label: 'Consumables' }
];

const categoryTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'GA', label: 'GA' },
  { value: 'NON-GA', label: 'NON-GA' },
  { value: 'MIXED', label: 'MIXED' }
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCategoryType, setSelectedCategoryType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const matchesSearch = product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || product.category_name === selectedCategory;
      const matchesCategoryType = selectedCategoryType === 'all' || product.category_type === selectedCategoryType;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      
      return matchesSearch && matchesCategory && matchesCategoryType && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedCategoryType, statusFilter]);

  const handleCreateProduct = () => {
    setIsCreateModalOpen(true);
    // In real implementation, this would open a create product modal
    console.log('Create product clicked');
  };

  const handleEditProduct = (productId: number) => {
    console.log('Edit product:', productId);
    // In real implementation, this would open an edit modal or navigate to edit page
  };

  const handleDeleteProduct = (productId: number) => {
    console.log('Delete product:', productId);
    // In real implementation, this would show a confirmation dialog
  };

  const handleViewProduct = (productId: number) => {
    console.log('View product:', productId);
    // In real implementation, this would open a detailed view modal
  };

  const getCategoryTypeBadgeColor = (categoryType: string) => {
    switch (categoryType) {
      case 'GA':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'NON-GA':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'MIXED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button onClick={handleCreateProduct} className="gap-2">
          <Plus size={16} />
          Add Product
        </Button>
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
                <p className="text-2xl font-bold">{mockProducts.length}</p>
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
                <p className="text-2xl font-bold">
                  {mockProducts.filter(p => p.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">GA Items</p>
                <p className="text-2xl font-bold">
                  {mockProducts.filter(p => p.category_type === 'GA').length}
                </p>
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
                <p className="text-sm text-muted-foreground">Non-GA Items</p>
                <p className="text-2xl font-bold">
                  {mockProducts.filter(p => p.category_type === 'NON-GA').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                icon={<Search size={16} />}
              />
            </div>
            
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedCategoryType}
                onChange={(e) => setSelectedCategoryType(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {categoryTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter size={14} />
                More Filters
              </Button>
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 font-medium">Product</th>
                  <th className="text-left py-3 px-2 font-medium">SKU</th>
                  <th className="text-left py-3 px-2 font-medium">Category</th>
                  <th className="text-left py-3 px-2 font-medium">Type</th>
                  <th className="text-left py-3 px-2 font-medium">Cost Center</th>
                  <th className="text-left py-3 px-2 font-medium">Units</th>
                  <th className="text-left py-3 px-2 font-medium">Status</th>
                  <th className="text-left py-3 px-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product.product_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-b hover:bg-muted/50"
                  >
                    <td className="py-3 px-2">
                      <div>
                        <div className="font-medium">{product.product_name}</div>
                        <div className="text-sm text-muted-foreground">{product.description}</div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {product.sku}
                      </code>
                    </td>
                    <td className="py-3 px-2">{product.category_name}</td>
                    <td className="py-3 px-2">
                      <Badge className={getCategoryTypeBadgeColor(product.category_type)}>
                        {product.category_type}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">{product.cost_center}</td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap gap-1">
                        {product.units.map((unit, unitIndex) => (
                          <Badge
                            key={unitIndex}
                            variant="secondary"
                            className="text-xs"
                          >
                            {unit.unit_code}
                            {unit.is_base_unit && ' (Base)'}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Badge className={getStatusBadgeColor(product.status)}>
                        {product.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProduct(product.product_id)}>
                            <Eye size={14} className="mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProduct(product.product_id)}>
                            <Edit size={14} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <Separator className="my-1" />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProduct(product.product_id)}
                            className="text-red-600"
                          >
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}