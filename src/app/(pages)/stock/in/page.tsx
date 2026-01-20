// app/stock/in/page.tsx - Fixed card alignment
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
import { Separator } from "@/components/ui/separator";
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

  // Enhanced stats calculation
  const stats = useMemo(() => {
    if (!stockInData) return { 
      total: 0, 
      completed: 0, 
      pending: 0, 
      value: 0,
      totalItems: 0,
      todayReceipts: 0,
    };

    const totalItems = stockInData.reduce((sum, stockIn) => 
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

    return {
      total: stockInData.length,
      completed: stockInData.filter((item) => item.status === "completed").length,
      pending: stockInData.filter((item) => item.status === "pending").length,
      value: totalValue,
      totalItems,
      todayReceipts,
    };
  }, [stockInData]);

  // Get unique suppliers for filter
  const suppliers = useMemo(() => {
    if (!stockInData) return [];
    const uniqueSuppliers = [...new Set(stockInData.map(item => item.supplier_name).filter(Boolean))];
    return uniqueSuppliers.sort();
  }, [stockInData]);

  // Enhanced filtering
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
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
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
      <Badge className={`${getStatusBadgeColor(status)}`}>
        <span className="flex items-center">
          {icon}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    );
  };

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

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="p-8 max-w-md">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">
                Error Loading Stock In Data
              </h3>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Stock In Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage incoming inventory with advanced barcode scanning and real-time tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => router.push("/stock/in/create")}
            className="gap-2">
            <Plus className="h-4 w-4" />
            New Stock In
          </Button>
        </div>
      </div>

      <Separator />

      {/* Stats Cards - Fixed Layout */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Records Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Records
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">All receipts</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg flex-shrink-0">
                  <Database className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">Fully processed</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending
                  </p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">In progress</p>
                </div>
                <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-lg flex-shrink-0">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today's Receipts Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Today's Receipts
                  </p>
                  <p className="text-2xl font-bold">{stats.todayReceipts}</p>
                  <p className="text-xs text-muted-foreground">Received today</p>
                </div>
                <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-lg flex-shrink-0">
                  <Calendar className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice, supplier, or packing list..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filter Row */}
              <div className="flex flex-wrap gap-4 items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[180px]">
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
                  <SelectTrigger className="w-[180px]">
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

                <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
                  <Filter className="h-4 w-4" />
                  <span>{sortedData.length} of {stats.total} records</span>
                </div>

                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>

                {(searchTerm || statusFilter !== "all" || dateFilter !== "all" || supplierFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setDateFilter("all");
                      setSupplierFilter("all");
                    }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Stock In Records ({sortedData.length})</span>
            <span className="text-sm font-normal text-muted-foreground">
              Showing {sortedData.length} of {stats.total} records
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedData.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("invoice_code")}>
                      <div className="flex items-center">
                        Invoice Code
                        {sortField === "invoice_code" && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Supplier & Date</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort("status")}>
                      <div className="flex items-center">
                        Status
                        {sortField === "status" && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Received By</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((item) => {
                    const itemsInfo = getItemsInfo(item);
                    const totalValue = item.items?.reduce(
                      (sum: number, i: any) => sum + i.quantity * i.price_per_unit, 0
                    ) || 0;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="space-y-2">
                            <code className="px-3 py-1.5 bg-muted rounded-lg text-sm font-medium">
                              {item.invoice_code}
                            </code>
                            {item.packing_list_number && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <ClipboardList className="h-3 w-3" />
                                PL: {item.packing_list_number}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-2">
                            <div className="font-medium flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              {item.supplier_name || "N/A"}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
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
                          <StatusBadge status={item.status} />
                        </TableCell>
                        
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              {item.received_by_name || "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
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
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/stock/in/${item.id}`)}
                                className="cursor-pointer">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {item.status === "pending" && (
                                <DropdownMenuItem
                                  onClick={() => router.push(`/stock/in/add-item/${item.id}`)}
                                  className="cursor-pointer">
                                  <Scan className="h-4 w-4 mr-2" />
                                  Continue Scanning
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer">
                                <Download className="h-4 w-4 mr-2" />
                                Export PDF
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Scan className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-3">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all" || supplierFilter !== "all"
                  ? "No stock in records match your filters"
                  : "No stock in records yet"}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
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
                    }}>
                    Clear All Filters
                  </Button>
                ) : (
                  <Button
                    onClick={() => router.push("/stock/in/create")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Stock In
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}