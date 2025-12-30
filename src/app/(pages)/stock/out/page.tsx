// app/(dashboard)/stock/out/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "@/lib/hooks/useApi";
import { getAllStockOut } from "@/lib/api/services";
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
  ShoppingCart,
  Check,
  Building,
  User,
  TrendingDown,
  Calendar,
  DollarSign,
  Activity,
  RefreshCw,
  Download,
  SortAsc,
  SortDesc,
  X,
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AlertCircle } from "lucide-react";

export default function StockOutPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("request_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: stockOutData,
    isLoading,
    error,
    refetch,
  } = useApi({
    fetchFn: (token) => getAllStockOut(token).then((res) => res.data || []),
    deps: [],
  });

  // Calculate comprehensive stats
  const stats = useMemo(() => {
    if (!stockOutData)
      return { 
        total: 0, 
        approved: 0, 
        pending: 0, 
        completed: 0, 
        totalValue: 0,
        completionRate: 0 
      };

    const total = stockOutData.length;
    const approved = stockOutData.filter((item) => item.status === "approved").length;
    const pending = stockOutData.filter((item) => item.status === "pending").length;
    const completed = stockOutData.filter((item) => item.status === "completed").length;
    
    const totalValue = stockOutData.reduce((sum, item) => {
      const itemValue = item.items?.reduce((total, i) => total + (i.total_amount || 0), 0) || 0;
      return sum + itemValue;
    }, 0);

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      approved,
      pending,
      completed,
      totalValue,
      completionRate,
    };
  }, [stockOutData]);

  // Filter and sort data with enhanced search
  const filteredData = useMemo(() => {
    if (!stockOutData) return [];

    return stockOutData.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        item.reference_number?.toLowerCase().includes(searchLower) ||
        item.department_name?.toLowerCase().includes(searchLower) ||
        item.requestor_name?.toLowerCase().includes(searchLower) ||
        item.requestor_username?.toLowerCase().includes(searchLower) ||
        item.notes?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stockOutData, searchTerm, statusFilter]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      let aValue, bValue;

      if (sortField === "request_date") {
        aValue = new Date(a.request_date).getTime();
        bValue = new Date(b.request_date).getTime();
      } else {
        aValue = a[sortField as keyof typeof a] || "";
        bValue = b[sortField as keyof typeof b] || "";
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
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
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortField("request_date");
    setSortDirection("desc");
  };

  // Format currency with better error handling
  const formatCurrency = (amount: number | undefined | null) => {
    if (!amount || isNaN(amount)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Enhanced status badge styling
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
          icon: <CheckCircle2 className="h-3 w-3" />,
          gradient: "from-emerald-500 to-green-500"
        };
      case "pending":
        return {
          color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
          icon: <Clock className="h-3 w-3" />,
          gradient: "from-amber-500 to-orange-500"
        };
      case "approved":
        return {
          color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
          icon: <Check className="h-3 w-3" />,
          gradient: "from-blue-500 to-cyan-500"
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
          icon: <XCircle className="h-3 w-3" />,
          gradient: "from-gray-500 to-slate-500"
        };
    }
  };

  // Enhanced status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const config = getStatusConfig(status);
    return (
      <Badge className={`${config.color} font-medium`}>
        <span className="flex items-center gap-1">
          {config.icon}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  // Enhanced Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-[60vh]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto"></div>
                <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-400 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-lg font-medium text-gray-700 dark:text-gray-300"
              >
                Loading stock out data...
              </motion.p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Please wait while we fetch the latest information
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-[60vh]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full"
            >
              <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
                    Error Loading Data
                  </h3>
                  <p className="text-red-700 dark:text-red-200 mb-6">
                    {error.message || "Unable to load stock out data. Please try again."}
                  </p>
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white" 
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Retrying...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Try Again
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      onClick={() => router.push("/dashboard")}
                    >
                      Back to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Stock Out Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage and track outgoing inventory items across all departments
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => router.push("/stock/out/create")}
              >
                <Plus size={16} />
                New Stock Out
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            {
              title: "Total Records",
              value: stats.total,
              icon: <ShoppingCart className="h-6 w-6" />,
              gradient: "from-blue-500 to-cyan-500",
              bgColor: "bg-blue-100 dark:bg-blue-900/30",
              textColor: "text-blue-600 dark:text-blue-400"
            },
            {
              title: "Completed",
              value: stats.completed,
              icon: <CheckCircle2 className="h-6 w-6" />,
              gradient: "from-emerald-500 to-green-500",
              bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
              textColor: "text-emerald-600 dark:text-emerald-400",
            },
            {
              title: "Approved",
              value: stats.approved,
              icon: <Check className="h-6 w-6" />,
              gradient: "from-purple-500 to-pink-500",
              bgColor: "bg-purple-100 dark:bg-purple-900/30",
              textColor: "text-purple-600 dark:text-purple-400"
            },
            {
              title: "Pending",
              value: stats.pending,
              icon: <Clock className="h-6 w-6" />,
              gradient: "from-amber-500 to-orange-500",
              bgColor: "bg-amber-100 dark:bg-amber-900/30",
              textColor: "text-amber-600 dark:text-amber-400"
            }
          ].map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="group relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-gray-200/20 dark:hover:shadow-gray-900/20 transition-all duration-300 transform hover:-translate-y-1">
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient}`} />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        {stat.value.toLocaleString()}
                      </p>
                      {stat.subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {stat.subtitle}
                        </p>
                      )}
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <div className={stat.textColor}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by reference, department, requestor, or notes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 flex-1"
                    onClick={clearFilters}
                    disabled={!searchTerm && statusFilter === "all"}
                  >
                    <X size={14} />
                    Clear
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 flex-1">
                    <Download size={14} />
                    Export
                  </Button>
                </div>
              </div>

              {/* Active Filters Display */}
              <AnimatePresence>
                {(searchTerm || statusFilter !== "all") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                      {searchTerm && (
                        <Badge variant="outline" className="gap-1">
                          Search: {searchTerm}
                          <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                      {statusFilter !== "all" && (
                        <Badge variant="outline" className="gap-1">
                          Status: {statusFilter}
                          <button onClick={() => setStatusFilter("all")} className="ml-1 hover:text-red-500">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Data Table or Empty State */}
        <AnimatePresence mode="wait">
          {sortedData.length > 0 ? (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Stock Out Records ({sortedData.length})
                    </span>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Showing {sortedData.length} of {stats.total} records
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          {[
                            { key: "reference_number", label: "Reference Number", sortable: true },
                            { key: "department_name", label: "Department", sortable: true },
                            { key: "requestor_name", label: "Requestor", sortable: true },
                            { key: "request_date", label: "Request Date", sortable: true },
                            { key: "status", label: "Status", sortable: true },
                            { key: "actions", label: "Actions", sortable: false }
                          ].map((column) => (
                            <th
                              key={column.key}
                              className={`text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 ${
                                column.sortable ? "cursor-pointer hover:text-gray-900 dark:hover:text-gray-100" : ""
                              }`}
                              onClick={column.sortable ? () => handleSort(column.key) : undefined}
                            >
                              <div className="flex items-center gap-2">
                                {column.label}
                                {column.sortable && (
                                  <div className="flex flex-col">
                                    {sortField === column.key ? (
                                      sortDirection === "asc" ? (
                                        <SortAsc className="h-4 w-4 text-blue-500" />
                                      ) : (
                                        <SortDesc className="h-4 w-4 text-blue-500" />
                                      )
                                    ) : (
                                      <ArrowUpDown className="h-4 w-4 text-gray-400" />
                                    )}
                                  </div>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedData.map((item, index) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200"
                          >
                            <td className="py-4 px-6">
                              <code className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm font-mono">
                                {item.reference_number || "N/A"}
                              </code>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-400" />
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {item.department_name || "Unknown Department"}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-gray-100">
                                    {item.requestor_name || "Unknown User"}
                                  </div>
                                  {item.requestor_username && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      @{item.requestor_username}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {new Date(item.request_date).toLocaleDateString("id-ID", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric"
                                  })}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <StatusBadge status={item.status} />
                            </td>
                            <td className="py-4 px-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/stock/out/${item.id}`)}
                                    className="cursor-pointer"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="cursor-pointer">
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Export PDF
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingDown className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No stock out records found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search terms or filters to find what you're looking for."
                      : "Get started by creating your first stock out record to track outgoing inventory."}
                  </p>
                  <div className="space-y-3">
                    {(searchTerm || statusFilter !== "all") ? (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Clear Filters
                      </Button>
                    ) : (
                      <Button
                        onClick={() => router.push("/stock/out/create")}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Plus className="h-4 w-4" />
                        Create New Stock Out
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded-full">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Stock Out Management System
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Track and manage all outgoing inventory items. Data is updated in real-time across all departments.
                Use the filters above to quickly find specific records.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}