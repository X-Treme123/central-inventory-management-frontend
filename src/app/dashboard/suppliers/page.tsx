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
  Building2,
  Phone,
  Mail,
  MapPin,
  Star,
  TrendingUp,
  Package,
  Clock,
  Award,
  ExternalLink
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

// Mock data for suppliers
const mockSuppliers = [
  {
    supplier_id: 1,
    supplier_name: "Tech Solutions Indonesia",
    contact_person: "John Smith",
    email: "john@techsolutions.co.id",
    phone: "+62 812-3456-7890",
    address: "Jl. Sudirman No. 123, Jakarta Pusat",
    tax_id: "TX12345",
    supplier_type: "GA",
    payment_terms: "NET 30",
    rating: 4.5,
    certifications: ["ISO 9001", "ISO 14001"],
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    last_order_date: "2025-01-15T10:30:00Z",
    total_orders: 45,
    total_value: 125000000
  },
  {
    supplier_id: 2,
    supplier_name: "Office Supplies Central",
    contact_person: "Jane Doe",
    email: "jane@officesupplies.co.id",
    phone: "+62 811-2345-6789",
    address: "Jl. Gatot Subroto No. 456, Jakarta Selatan",
    tax_id: "TX54321",
    supplier_type: "GA",
    payment_terms: "NET 45",
    rating: 4.2,
    certifications: ["ISO 9001"],
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    last_order_date: "2025-01-20T14:00:00Z",
    total_orders: 32,
    total_value: 85000000
  },
  {
    supplier_id: 3,
    supplier_name: "Industrial Materials Corp",
    contact_person: "Robert Johnson",
    email: "robert@industrialmat.co.id",
    phone: "+62 813-4567-8901",
    address: "Jl. Thamrin No. 789, Jakarta Barat",
    tax_id: "TX67890",
    supplier_type: "NON-GA",
    payment_terms: "NET 60",
    rating: 4.7,
    certifications: ["ISO 9001", "ISO 45001"],
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    last_order_date: "2025-01-22T09:15:00Z",
    total_orders: 78,
    total_value: 450000000
  },
  {
    supplier_id: 4,
    supplier_name: "Safety Equipment Ltd",
    contact_person: "Sarah Wilson",
    email: "sarah@safetyequip.co.id",
    phone: "+62 814-5678-9012",
    address: "Jl. Kuningan No. 321, Jakarta Selatan",
    tax_id: "TX13579",
    supplier_type: "NON-GA",
    payment_terms: "COD",
    rating: 4.3,
    certifications: ["ISO 9001", "CE"],
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    last_order_date: "2025-01-18T16:30:00Z",
    total_orders: 25,
    total_value: 180000000
  },
  {
    supplier_id: 5,
    supplier_name: "Multi-Purpose Supplies",
    contact_person: "David Chen",
    email: "david@multipurpose.co.id",
    phone: "+62 815-6789-0123",
    address: "Jl. HR Rasuna Said No. 654, Jakarta Selatan",
    tax_id: "TX24680",
    supplier_type: "MIXED",
    payment_terms: "NET 30",
    rating: 4.4,
    certifications: ["ISO 9001"],
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    last_order_date: "2025-01-21T11:45:00Z",
    total_orders: 38,
    total_value: 220000000
  },
  {
    supplier_id: 6,
    supplier_name: "Precision Parts Manufacturing",
    contact_person: "Lisa Zhang",
    email: "lisa@precisionparts.co.id",
    phone: "+62 816-7890-1234",
    address: "Jl. Raya Cikarang, Bekasi",
    tax_id: "TX97531",
    supplier_type: "NON-GA",
    payment_terms: "NET 45",
    rating: 4.8,
    certifications: ["ISO 9001", "ISO/TS 16949"],
    status: "active",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    last_order_date: "2025-01-19T13:20:00Z",
    total_orders: 52,
    total_value: 380000000
  },
  {
    supplier_id: 7,
    supplier_name: "Budget Office Supplies",
    contact_person: "Mike Rodriguez",
    email: "mike@budgetoffice.co.id",
    phone: "+62 817-8901-2345",
    address: "Jl. Mangga Dua No. 789, Jakarta Utara",
    tax_id: "TX86420",
    supplier_type: "GA",
    payment_terms: "COD",
    rating: 3.8,
    certifications: [],
    status: "suspended",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    last_order_date: "2024-12-15T08:00:00Z",
    total_orders: 12,
    total_value: 35000000
  }
];

const supplierTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'GA', label: 'GA Only' },
  { value: 'NON-GA', label: 'Non-GA Only' },
  { value: 'MIXED', label: 'Mixed' }
];

const paymentTerms = [
  { value: 'all', label: 'All Terms' },
  { value: 'COD', label: 'COD' },
  { value: 'NET 30', label: 'NET 30' },
  { value: 'NET 45', label: 'NET 45' },
  { value: 'NET 60', label: 'NET 60' }
];

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSuppliers = useMemo(() => {
    return mockSuppliers.filter(supplier => {
      const matchesSearch = supplier.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           supplier.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           supplier.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = selectedType === 'all' || supplier.supplier_type === selectedType;
      const matchesPaymentTerms = selectedPaymentTerms === 'all' || supplier.payment_terms === selectedPaymentTerms;
      const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
      
      return matchesSearch && matchesType && matchesPaymentTerms && matchesStatus;
    });
  }, [searchQuery, selectedType, selectedPaymentTerms, statusFilter]);

  const handleCreateSupplier = () => {
    console.log('Create supplier clicked');
  };

  const handleEditSupplier = (supplierId: number) => {
    console.log('Edit supplier:', supplierId);
  };

  const handleDeleteSupplier = (supplierId: number) => {
    console.log('Delete supplier:', supplierId);
  };

  const handleViewSupplier = (supplierId: number) => {
    console.log('View supplier:', supplierId);
  };

  const getSupplierTypeBadgeColor = (supplierType: string) => {
    switch (supplierType) {
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
      case 'suspended':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-orange-600';
    return 'text-red-600';
  };

  const activeSuppliers = mockSuppliers.filter(s => s.status === 'active').length;
  const totalOrders = mockSuppliers.reduce((sum, s) => sum + s.total_orders, 0);
  const avgRating = mockSuppliers.reduce((sum, s) => sum + s.rating, 0) / mockSuppliers.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-muted-foreground">Manage your supplier network</p>
        </div>
        <Button onClick={handleCreateSupplier} className="gap-2">
          <Plus size={16} />
          Add Supplier
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Suppliers</p>
                <p className="text-2xl font-bold">{mockSuppliers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Suppliers</p>
                <p className="text-2xl font-bold">{activeSuppliers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{avgRating.toFixed(1)}</p>
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
                placeholder="Search suppliers..."
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
                {supplierTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedPaymentTerms}
                onChange={(e) => setSelectedPaymentTerms(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                {paymentTerms.map(term => (
                  <option key={term.value} value={term.value}>{term.label}</option>
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
                <option value="suspended">Suspended</option>
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

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier, index) => (
          <motion.div
            key={supplier.supplier_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{supplier.supplier_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{supplier.contact_person}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewSupplier(supplier.supplier_id)}>
                        <Eye size={14} className="mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditSupplier(supplier.supplier_id)}>
                        <Edit size={14} className="mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink size={14} className="mr-2" />
                        View Orders
                      </DropdownMenuItem>
                      <Separator className="my-1" />
                      <DropdownMenuItem 
                        onClick={() => handleDeleteSupplier(supplier.supplier_id)}
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
                    <Badge className={getSupplierTypeBadgeColor(supplier.supplier_type)}>
                      {supplier.supplier_type}
                    </Badge>
                    <Badge className={getStatusBadgeColor(supplier.status)}>
                      {supplier.status}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={14} className="text-muted-foreground" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-muted-foreground" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-muted-foreground" />
                      <span className="text-xs">{supplier.address}</span>
                    </div>
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-current" />
                      <span className={`text-sm font-medium ${getRatingColor(supplier.rating)}`}>
                        {supplier.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {supplier.total_orders} orders
                    </div>
                  </div>

                  {/* Payment Terms */}
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-muted-foreground" />
                    <span className="text-sm">{supplier.payment_terms}</span>
                  </div>

                  {/* Certifications */}
                  {supplier.certifications.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Award size={14} className="text-muted-foreground" />
                        <span className="text-xs font-medium">Certifications</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {supplier.certifications.map((cert, certIndex) => (
                          <Badge key={certIndex} variant="outline" className="text-xs">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Last Order */}
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    Last order: {new Date(supplier.last_order_date).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No suppliers found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}