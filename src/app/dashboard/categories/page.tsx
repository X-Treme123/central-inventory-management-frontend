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
  Folder,
  Package,
  BarChart3,
  Tag,
  TrendingUp,
  Settings
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

// Mock data for categories
const mockCategories = [
  {
    category_id: 1,
    category_name: "Electronics",
    category_type: "GA",
    description: "Electronic equipment and devices",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    product_count: 15,
    parent_category_id: null,
    subcategories: [
      { id: 11, name: "Laptops", product_count: 8 },
      { id: 12, name: "Monitors", product_count: 4 },
      { id: 13, name: "Peripherals", product_count: 3 }
    ]
  },
  {
    category_id: 2,
    category_name: "Furniture",
    category_type: "GA",
    description: "Office furniture and fixtures",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    product_count: 25,
    parent_category_id: null,
    subcategories: [
      { id: 21, name: "Chairs", product_count: 12 },
      { id: 22, name: "Desks", product_count: 8 },
      { id: 23, name: "Storage", product_count: 5 }
    ]
  },
  {
    category_id: 3,
    category_name: "Office Supplies",
    category_type: "GA",
    description: "Stationery and office consumables",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    product_count: 45,
    parent_category_id: null,
    subcategories: [
      { id: 31, name: "Paper", product_count: 15 },
      { id: 32, name: "Writing Materials", product_count: 18 },
      { id: 33, name: "Storage & Filing", product_count: 12 }
    ]
  },
  {
    category_id: 4,
    category_name: "Safety Equipment",
    category_type: "NON-GA",
    description: "Personal protective equipment and safety tools",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    product_count: 35,
    parent_category_id: null,
    subcategories: [
      { id: 41, name: "PPE", product_count: 20 },
      { id: 42, name: "Safety Tools", product_count: 10 },
      { id: 43, name: "Emergency Equipment", product_count: 5 }
    ]
  },
  {
    category_id: 5,
    category_name: "Raw Materials",
    category_type: "NON-GA",
    description: "Production raw materials and components",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    product_count: 80,
    parent_category_id: null,
    subcategories: [
      { id: 51, name: "Steel & Metals", product_count: 35 },
      { id: 52, name: "Chemical Materials", product_count: 25 },
      { id: 53, name: "Components", product_count: 20 }
    ]
  },
  {
    category_id: 6,
    category_name: "Lubricants",
    category_type: "NON-GA",
    description: "Industrial lubricants and fluids",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    product_count: 22,
    parent_category_id: null,
    subcategories: [
      { id: 61, name: "Engine Oils", product_count: 8 },
      { id: 62, name: "Hydraulic Fluids", product_count: 7 },
      { id: 63, name: "Greases", product_count: 7 }
    ]
  },
  {
    category_id: 7,
    category_name: "Medical Supplies",
    category_type: "MIXED",
    description: "Medical and first aid supplies",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    product_count: 30,
    parent_category_id: null,
    subcategories: [
      { id: 71, name: "First Aid", product_count: 15 },
      { id: 72, name: "Medical Equipment", product_count: 8 },
      { id: 73, name: "Pharmaceuticals", product_count: 7 }
    ]
  },
  {
    category_id: 8,
    category_name: "Consumables",
    category_type: "MIXED",
    description: "General consumable items",
    status: "inactive",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    product_count: 18,
    parent_category_id: null,
    subcategories: [
      { id: 81, name: "Cleaning Supplies", product_count: 8 },
      { id: 82, name: "Maintenance Items", product_count: 6 },
      { id: 83, name: "General Consumables", product_count: 4 }
    ]
  },
  {
    category_id: 9,
    category_name: "Spare Parts",
    category_type: "NON-GA",
    description: "Machine and equipment spare parts",
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    product_count: 95,
    parent_category_id: null,
    subcategories: [
      { id: 91, name: "Motor Parts", product_count: 40 },
      { id: 92, name: "Hydraulic Parts", product_count: 30 },
      { id: 93, name: "Electrical Parts", product_count: 25 }
    ]
  }
];

const categoryTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'GA', label: 'GA' },
  { value: 'NON-GA', label: 'NON-GA' },
  { value: 'MIXED', label: 'MIXED' }
];

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  const filteredCategories = useMemo(() => {
    return mockCategories.filter(category => {
      const matchesSearch = category.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           category.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'all' || category.category_type === selectedType;
      const matchesStatus = statusFilter === 'all' || category.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, selectedType, statusFilter]);

  const handleCreateCategory = () => {
    console.log('Create category clicked');
  };

  const handleEditCategory = (categoryId: number) => {
    console.log('Edit category:', categoryId);
  };

  const handleDeleteCategory = (categoryId: number) => {
    console.log('Delete category:', categoryId);
  };

  const handleViewCategory = (categoryId: number) => {
    console.log('View category:', categoryId);
  };

  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
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
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const totalProducts = mockCategories.reduce((sum, cat) => sum + cat.product_count, 0);
  const gaCategories = mockCategories.filter(cat => cat.category_type === 'GA').length;
  const nonGaCategories = mockCategories.filter(cat => cat.category_type === 'NON-GA').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Organize your products into categories</p>
        </div>
        <Button onClick={handleCreateCategory} className="gap-2">
          <Plus size={16} />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Folder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold">{mockCategories.length}</p>
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
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Tag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">GA Categories</p>
                <p className="text-2xl font-bold">{gaCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Non-GA Categories</p>
                <p className="text-2xl font-bold">{nonGaCategories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                icon={<Search size={16} />}
              />
            </div>
            
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category, index) => (
          <motion.div
            key={category.category_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{category.category_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewCategory(category.category_id)}>
                        <Eye size={14} className="mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditCategory(category.category_id)}>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleCategoryExpansion(category.category_id)}>
                        <Settings size={14} className="mr-2" />
                        Manage Subcategories
                      </DropdownMenuItem>
                      <Separator className="my-1" />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteCategory(category.category_id)}
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
                  {/* Type and Status */}
                  <div className="flex gap-2">
                    <Badge className={getCategoryTypeBadgeColor(category.category_type)}>
                      {category.category_type}
                    </Badge>
                    <Badge className={getStatusBadgeColor(category.status)}>
                      {category.status}
                    </Badge>
                  </div>

                  {/* Product Count */}
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-muted-foreground" />
                    <span className="text-sm">
                      {category.product_count} products
                    </span>
                  </div>

                  {/* Subcategories */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Subcategories</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategoryExpansion(category.category_id)}
                      >
                        {expandedCategory === category.category_id ? 'Collapse' : 'View All'}
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {category.subcategories.slice(0, expandedCategory === category.category_id ? undefined : 2).map((sub, subIndex) => (
                        <div key={sub.id} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{sub.name}</span>
                          <span className="font-medium">{sub.product_count}</span>
                        </div>
                      ))}
                      
                      {expandedCategory !== category.category_id && category.subcategories.length > 2 && (
                        <div className="text-xs text-muted-foreground text-center">
                          +{category.subcategories.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(category.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Folder size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No categories found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}