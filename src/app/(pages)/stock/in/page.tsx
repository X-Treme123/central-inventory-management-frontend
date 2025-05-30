// app/stock/in/page.tsx - Enhanced with modern UI and improved UX
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/hooks/useApi";
import { getAllStockIn } from "@/lib/api/services";
import {
  Package,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpDown,
  FileDown,
  MoreVertical,
  Eye,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Scan,
  QrCode,
  BarChart3,
  Layers,
  Box,
  Users,
  Calendar,
  RefreshCw,
  X,
  Download,
  Archive,
  Activity,
  Database,
  Zap,
  ShoppingCart,
  Building2,
  ClipboardList,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default function StockInPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("receipt_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: stockInData,
    isLoading,
    error,
    refetch,
  } = useApi({
    fetchFn: (token) => getAllStockIn(token).then((res) => res.data || []),
    deps: [],
  });

  // Enhanced stats calculation with comprehensive metrics
  const stats = useMemo(() => {
    if (!stockInData) return { 
      total: 0, 
      completed: 0, 
      pending: 0, 
      value: 0,
      totalItems: 0,
      avgItemsPerReceipt: 0,
      totalScans: 0,
      todayReceipts: 0,
      avgReceiptValue: 0,
      totalSuppliers: 0
    };

    const totalItems = stockInData.reduce((sum, stockIn) => 
      sum + (stockIn.items?.length || 0), 0
    );

    const totalScans = stockInData.reduce((sum, stockIn) => 
      sum + (stockIn.items?.length || 0), 0
    );

    const totalValue = stockInData.reduce((sum, item) => {
      const itemValue = item.items?.reduce(
        (total, i) => total + i.quantity * i.price_per_unit, 0
      ) || 0;
      return sum + itemValue;
    }, 0);

    const today = new Date();
    const todayReceipts = stockInData.filter(item => {
      const receiptDate = new Date(item.receipt_date);
      return receiptDate.toDateString() === today.toDateString();
    }).length;

    const uniqueSuppliers = new Set(stockInData.map(item => item.supplier_name).filter(Boolean)).size;

    return {
      total: stockInData.length,
      completed: stockInData.filter((item) => item.status === "completed").length,
      pending: stockInData.filter((item) => item.status === "pending").length,
      value: totalValue,
      totalItems,
      avgItemsPerReceipt: stockInData.length > 0 ? totalItems / stockInData.length : 0,
      totalScans,
      todayReceipts,
      avgReceiptValue: stockInData.length > 0 ? totalValue / stockInData.length : 0,
      totalSuppliers: uniqueSuppliers
    };
  }, [stockInData]);

  // Get unique suppliers for filter
  const suppliers = useMemo(() => {
    if (!stockInData) return [];
    const uniqueSuppliers = [...new Set(stockInData.map(item => item.supplier_name).filter(Boolean))];
    return uniqueSuppliers.sort();
  }, [stockInData]);

  // Enhanced filtering with comprehensive criteria
  const filteredData = useMemo(() => {
    if (!stockInData) return [];

    return stockInData.filter((item) => {
      const matchesSearch =
        item.invoice_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier_name &&
          item.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.notes &&
          item.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.packing_list_number &&
          item.packing_list_number.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      const matchesSupplier =
        supplierFilter === "all" || item.supplier_name === supplierFilter;

      // Enhanced date filtering
      let matchesDate = true;
      if (dateFilter !== "all") {
        const receiptDate = new Date(item.receipt_date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - receiptDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "today":
            matchesDate = diffDays <= 1;
            break;
          case "week":
            matchesDate = diffDays <= 7;
            break;
          case "month":
            matchesDate = diffDays <= 30;
            break;
          case "quarter":
            matchesDate = diffDays <= 90;
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesStatus && matchesDate && matchesSupplier;
    });
  }, [stockInData, searchTerm, statusFilter, dateFilter, supplierFilter]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (sortField === "receipt_date") {
        return sortDirection === "asc"
          ? new Date(a.receipt_date).getTime() - new Date(b.receipt_date).getTime()
          : new Date(b.receipt_date).getTime() - new Date(a.receipt_date).getTime();
      }

      if (a[sortField as keyof typeof a] < b[sortField as keyof typeof b]) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (a[sortField as keyof typeof a] > b[sortField as keyof typeof b]) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-green-500 to-emerald-500 text-white";
      case "pending":
        return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    let icon = null;

    switch (status) {
      case "completed":
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
        break;
      case "pending":
        icon = <Clock className="h-3 w-3 mr-1" />;
        break;
    }

    return (
      <Badge className={`${getStatusBadgeColor(status)} shadow-sm`}>
        <span className="flex items-center">
          {icon}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    );
  };

  // Get enhanced items info with better breakdown
  const getItemsInfo = (stockIn: any) => {
    const items = stockIn.items || [];
    const itemCount = items.length;
    
    const unitTypes = items.reduce((acc: any, item: any) => {
      if (item.unit_type) {
        acc[item.unit_type] = (acc[item.unit_type] || 0) + 1;
      }
      return acc;
    }, {});

    const totalQuantity = items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

    return { itemCount, unitTypes, totalQuantity };
  };

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

  if (isLoading) {
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
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <Card key={i} className="relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-xl" />
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Error Loading Stock In Data
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
              </div>
              <Button 
                onClick={handleRefresh} 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </Card>
        </motion.div>
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
                  Stock In Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Manage incoming inventory with advanced barcode scanning and real-time tracking
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="border-gray-200 dark:border-gray-700"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={() => router.push("/stock/in/create")}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Stock In
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              {
                title: "Total Records",
                value: stats.total,
                icon: Database,
                gradient: "from-blue-500 to-cyan-500",
                description: "All receipts"
              },
              {
                title: "Completed",
                value: stats.completed,
                icon: CheckCircle2,
                gradient: "from-green-500 to-emerald-500",
                description: "Fully processed"
              },
              {
                title: "Pending",
                value: stats.pending,
                icon: Clock,
                gradient: "from-yellow-500 to-orange-500",
                description: "In progress"
              },
              {
                title: "Total Value",
                value: formatCurrency(stats.value),
                icon: TrendingUp,
                gradient: "from-purple-500 to-pink-500",
                description: "Inventory value"
              },
              {
                title: "Total Scans",
                value: stats.totalScans,
                icon: Scan,
                gradient: "from-indigo-500 to-purple-500",
                description: "Barcode scans"
              },
              {
                title: "Total Items",
                value: stats.totalItems,
                icon: Package,
                gradient: "from-emerald-500 to-teal-500",
                description: "Product items"
              },
              {
                title: "Today's Receipts",
                value: stats.todayReceipts,
                icon: Calendar,
                gradient: "from-pink-500 to-rose-500",
                description: "Received today"
              }
            ].map((stat, index) => (
              <Card key={index} className="relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient}`} />
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} text-white shadow-lg`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{stat.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Enhanced Filters */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by invoice, supplier, or packing list..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    />
                  </div>

                  {/* Filter Row */}
                  <div className="flex flex-wrap gap-4 items-center">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Date Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="quarter">This Quarter</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                      <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <SelectValue placeholder="Supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Suppliers</SelectItem>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier} value={supplier}>
                            {supplier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Results Counter */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-auto">
                      <Filter className="h-4 w-4" />
                      <span>{sortedData.length} of {stats.total} records</span>
                    </div>

                    {/* Export Button */}
                    <Button variant="outline" size="sm" className="border-gray-200 dark:border-gray-700">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>

                    {/* Clear Filters */}
                    {(searchTerm || statusFilter !== "all" || dateFilter !== "all" || supplierFilter !== "all") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                          setDateFilter("all");
                          setSupplierFilter("all");
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

          {/* Enhanced Stock In Table */}
          <motion.div variants={cardVariants}>
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
                  <span>Stock In Records ({sortedData.length})</span>
                  <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    Showing {sortedData.length} of {stats.total} records
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sortedData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200 dark:border-gray-700">
                          <TableHead 
                            className="text-gray-700 dark:text-gray-300 cursor-pointer"
                            onClick={() => handleSort("invoice_code")}
                          >
                            <div className="flex items-center">
                              Invoice Code
                              {sortField === "invoice_code" && (
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-300">
                            Supplier & Date
                          </TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-300">
                            Scanning Progress
                          </TableHead>
                          <TableHead 
                            className="text-gray-700 dark:text-gray-300 cursor-pointer"
                            onClick={() => handleSort("status")}
                          >
                            <div className="flex items-center">
                              Status
                              {sortField === "status" && (
                                <ArrowUpDown className="ml-1 h-4 w-4" />
                              )}
                            </div>
                          </TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-300">
                            Received By
                          </TableHead>
                          <TableHead className="text-gray-700 dark:text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {sortedData.map((item, index) => {
                            const itemsInfo = getItemsInfo(item);
                            const totalValue = item.items?.reduce(
                              (sum: number, i: any) => sum + i.quantity * i.price_per_unit, 0
                            ) || 0;

                            return (
                              <motion.tr
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                              >
                                <TableCell>
                                  <div className="space-y-2">
                                    <code className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-800 dark:text-gray-200">
                                      {item.invoice_code}
                                    </code>
                                    {item.packing_list_number && (
                                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                        <ClipboardList className="h-3 w-3" />
                                        PL: {item.packing_list_number}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                
                                <TableCell>
                                  <div className="space-y-2">
                                    <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                      <Building2 className="h-4 w-4 text-gray-400" />
                                      {item.supplier_name || "N/A"}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(item.receipt_date).toLocaleDateString('id-ID', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </div>
                                  </div>
                                </TableCell>
                                
                                <TableCell>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <QrCode className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                          {itemsInfo.itemCount} items
                                        </span>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {itemsInfo.totalQuantity} total quantity
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Enhanced Unit type breakdown */}
                                    {itemsInfo.itemCount > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {itemsInfo.unitTypes.piece > 0 && (
                                          <Badge variant="secondary" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                            <Package className="h-3 w-3 mr-1" />
                                            {itemsInfo.unitTypes.piece} PC
                                          </Badge>
                                        )}
                                        {itemsInfo.unitTypes.pack > 0 && (
                                          <Badge variant="secondary" className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                                            <Layers className="h-3 w-3 mr-1" />
                                            {itemsInfo.unitTypes.pack} PK
                                          </Badge>
                                        )}
                                        {itemsInfo.unitTypes.box > 0 && (
                                          <Badge variant="secondary" className="text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                            <Box className="h-3 w-3 mr-1" />
                                            {itemsInfo.unitTypes.box} BX
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                    
                                    {/* Value with better formatting */}
                                    {totalValue > 0 && (
                                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                                        {formatCurrency(totalValue)}
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                
                                <TableCell>
                                  <StatusBadge status={item.status} />
                                </TableCell>
                                
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                      <Users className="h-4 w-4 text-gray-400" />
                                      {item.received_by_name || "N/A"}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                      <Timer className="h-3 w-3" />
                                      {new Date(item.created_at).toLocaleDateString('id-ID')}
                                    </div>
                                  </div>
                                </TableCell>
                                
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                      <DropdownMenuItem
                                        onClick={() => router.push(`/stock/in/${item.id}`)}
                                        className="cursor-pointer"
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      {item.status === "pending" && (
                                        <DropdownMenuItem
                                          onClick={() => router.push(`/stock/in/add-item/${item.id}`)}
                                          className="cursor-pointer"
                                        >
                                          <Scan className="h-4 w-4 mr-2" />
                                          Continue Scanning
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="cursor-pointer">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export PDF
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="cursor-pointer">
                                        <Archive className="h-4 w-4 mr-2" />
                                        Archive
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </motion.tr>
                            );
                          })}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  /* Enhanced Empty State */
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Scan className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                      {searchTerm || statusFilter !== "all" || dateFilter !== "all" || supplierFilter !== "all"
                        ? "No stock in records match your filters"
                        : "No stock in records yet"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {searchTerm || statusFilter !== "all" || dateFilter !== "all" || supplierFilter !== "all"
                        ? "Try adjusting your search criteria or filters to find what you're looking for"
                        : "Get started by creating your first stock in record with barcode scanning for fast and accurate inventory management"}
                    </p>
                    <div className="flex gap-3 justify-center">
                      {searchTerm || statusFilter !== "all" || dateFilter !== "all" || supplierFilter !== "all" ? (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("all");
                            setDateFilter("all");
                            setSupplierFilter("all");
                          }}
                          className="border-gray-200 dark:border-gray-700"
                        >
                          Clear All Filters
                        </Button>
                      ) : (
                        <Button
                          onClick={() => router.push("/stock/in/create")}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Stock In
                        </Button>
                      )}
                    </div>
                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 max-w-md mx-auto">
                      <Zap className="h-4 w-4 inline mr-2" />
                      Use barcode scanning for fast and accurate data entry
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Footer Info */}
          <motion.div
            variants={cardVariants}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Inventory Management System
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  All data is synchronized in real-time. Use barcode scanning for accurate inventory tracking 
                  and streamlined receiving processes. Export reports for comprehensive analysis.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}