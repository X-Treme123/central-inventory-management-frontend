// app/stock/in/page.tsx - Updated dengan barcode workflow information
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

export default function StockInPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("receipt_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month

  const {
    data: stockInData,
    isLoading,
    error,
    refetch,
  } = useApi({
    fetchFn: (token) => getAllStockIn(token).then((res) => res.data || []),
    deps: [],
  });

  // Enhanced stats calculation with barcode scanning metrics
  const stats = useMemo(() => {
    if (!stockInData) return { 
      total: 0, 
      completed: 0, 
      pending: 0, 
      value: 0,
      totalItems: 0,
      avgItemsPerReceipt: 0,
      totalScans: 0
    };

    const totalItems = stockInData.reduce((sum, stockIn) => 
      sum + (stockIn.items?.length || 0), 0
    );

    // Estimate total scans (in real implementation, this would come from barcode_scans table)
    const totalScans = stockInData.reduce((sum, stockIn) => 
      sum + (stockIn.items?.length || 0), 0 // Each item represents one barcode scan
    );

    return {
      total: stockInData.length,
      completed: stockInData.filter((item) => item.status === "completed").length,
      pending: stockInData.filter((item) => item.status === "pending").length,
      value: stockInData.reduce((sum, item) => {
        const itemValue = item.items?.reduce(
          (total, i) => total + i.quantity * i.price_per_unit, 0
        ) || 0;
        return sum + itemValue;
      }, 0),
      totalItems,
      avgItemsPerReceipt: stockInData.length > 0 ? totalItems / stockInData.length : 0,
      totalScans
    };
  }, [stockInData]);

  // Enhanced filtering with date filter
  const filteredData = useMemo(() => {
    if (!stockInData) return [];

    return stockInData.filter((item) => {
      const matchesSearch =
        item.invoice_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier_name &&
          item.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.notes &&
          item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      // Date filtering
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
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [stockInData, searchTerm, statusFilter, dateFilter]);

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
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
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
      <Badge className={getStatusBadgeColor(status)}>
        <span className="flex items-center">
          {icon}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    );
  };

  // Get items count with unit type breakdown
  const getItemsInfo = (stockIn: any) => {
    const items = stockIn.items || [];
    const itemCount = items.length;
    
    // Group by unit type for visual indication
    const unitTypes = items.reduce((acc: any, item: any) => {
      if (item.unit_type) {
        acc[item.unit_type] = (acc[item.unit_type] || 0) + 1;
      }
      return acc;
    }, {});

    return { itemCount, unitTypes };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading stock in data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="p-6 max-w-md">
          <div className="flex items-center space-x-2 text-red-600 mb-4">
            <AlertCircle className="h-6 w-6" />
            <h3 className="text-lg font-medium">Error Loading Stock In Data</h3>
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
          <h1 className="text-2xl font-bold">Stock In Management</h1>
          <p className="text-muted-foreground">
            Manage incoming inventory with barcode scanning
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => router.push("/stock/in/create")}>
          <Plus size={16} />
          New Stock In
        </Button>
      </div>

      {/* Enhanced Stats Cards dengan Barcode Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">{formatCurrency(stats.value)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Scan className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Scans</p>
                <p className="text-2xl font-bold">{stats.totalScans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                <BarChart3 className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                <Users className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Items</p>
                <p className="text-2xl font-bold">{Math.round(stats.avgItemsPerReceipt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by invoice, supplier..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <FileDown size={14} />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock In Table */}
      {sortedData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Stock In Records ({sortedData.length})</span>
              <div className="text-sm text-gray-500">
                Showing {sortedData.length} of {stats.total} records
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th
                      className="text-left py-3 px-2 font-medium cursor-pointer"
                      onClick={() => handleSort("invoice_code")}>
                      <div className="flex items-center">
                        Invoice Code
                        {sortField === "invoice_code" && (
                          <ArrowUpDown size={14} className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-2 font-medium">
                      Supplier & Date
                    </th>
                    <th className="text-left py-3 px-2 font-medium">
                      Scanning Progress
                    </th>
                    <th
                      className="text-left py-3 px-2 font-medium cursor-pointer"
                      onClick={() => handleSort("status")}>
                      <div className="flex items-center">
                        Status
                        {sortField === "status" && (
                          <ArrowUpDown size={14} className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-2 font-medium">
                      Received By
                    </th>
                    <th className="text-left py-3 px-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
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
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2">
                          <div>
                            <code className="px-2 py-1 bg-muted rounded text-sm font-medium">
                              {item.invoice_code}
                            </code>
                            {item.packing_list_number && (
                              <div className="text-xs text-gray-500 mt-1">
                                PL: {item.packing_list_number}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-3 px-2">
                          <div>
                            <div className="font-medium">{item.supplier_name || "N/A"}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.receipt_date).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                        </td>
                        
                        <td className="py-3 px-2">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <QrCode className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{itemsInfo.itemCount} items scanned</span>
                            </div>
                            
                            {/* Unit type breakdown */}
                            {itemsInfo.itemCount > 0 && (
                              <div className="flex gap-1">
                                {itemsInfo.unitTypes.piece > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                    <Package className="h-3 w-3 mr-1" />
                                    {itemsInfo.unitTypes.piece}
                                  </Badge>
                                )}
                                {itemsInfo.unitTypes.pack > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    <Layers className="h-3 w-3 mr-1" />
                                    {itemsInfo.unitTypes.pack}
                                  </Badge>
                                )}
                                {itemsInfo.unitTypes.box > 0 && (
                                  <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                                    <Box className="h-3 w-3 mr-1" />
                                    {itemsInfo.unitTypes.box}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            {/* Value */}
                            {totalValue > 0 && (
                              <div className="text-sm text-gray-600">
                                Value: {formatCurrency(totalValue)}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="py-3 px-2">
                          <StatusBadge status={item.status} />
                        </td>
                        
                        <td className="py-3 px-2">
                          <div>
                            <div className="font-medium">{item.received_by_name || "N/A"}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(item.created_at).toLocaleDateString('id-ID')}
                            </div>
                          </div>
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
                                onClick={() =>
                                  router.push(`/stock/in/${item.id}`)
                                }>
                                <Eye size={14} className="mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {item.status === "pending" && (
                                <DropdownMenuItem
                                  onClick={() =>
                                    router.push(`/stock/in/add-item/${item.id}`)
                                  }>
                                  <Scan size={14} className="mr-2" />
                                  Continue Scanning
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Scan size={48} className="text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">
            {searchTerm || statusFilter !== "all" || dateFilter !== "all"
              ? "No stock in records found"
              : "No stock in records yet"}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" || dateFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating a new stock in record with barcode scanning"}
          </p>
          <div className="mt-6 space-y-3">
            <Button onClick={() => router.push("/stock/in/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Stock In
            </Button>
            <div className="text-sm text-gray-500">
              Use barcode scanning for fast and accurate data entry
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}