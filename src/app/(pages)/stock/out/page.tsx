// app/(dashboard)/stock/out/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function StockOutPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("request_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("all");

  const {
    data: stockOutData,
    isLoading,
    error,
    refetch,
  } = useApi({
    fetchFn: (token) => getAllStockOut(token).then((res) => res.data || []),
    deps: [],
  });

  // Calculate stats for the stats cards
  const stats = useMemo(() => {
    if (!stockOutData)
      return { total: 0, approved: 0, pending: 0, completed: 0 };

    return {
      total: stockOutData.length,
      approved: stockOutData.filter((item) => item.status === "approved")
        .length,
      pending: stockOutData.filter((item) => item.status === "pending").length,
      completed: stockOutData.filter((item) => item.status === "completed")
        .length,
      value: stockOutData.reduce((sum, item) => {
        // Calculate total value if item has price data
        const itemValue =
          item.items?.reduce((total, i) => total + (i.total_amount || 0), 0) ||
          0;
        return sum + itemValue;
      }, 0),
    };
  }, [stockOutData]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!stockOutData) return [];

    return stockOutData.filter((item) => {
      const matchesSearch =
        item.reference_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (item.department_name &&
          item.department_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (item.requestor_name &&
          item.requestor_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (item.notes &&
          item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stockOutData, searchTerm, statusFilter]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (sortField === "request_date") {
        return sortDirection === "asc"
          ? new Date(a.request_date).getTime() -
              new Date(b.request_date).getTime()
          : new Date(b.request_date).getTime() -
              new Date(a.request_date).getTime();
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Get status badge styling
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "approved":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let icon = null;

    switch (status) {
      case "completed":
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
        break;
      case "pending":
        icon = <Clock className="h-3 w-3 mr-1" />;
        break;
      case "approved":
        icon = <Check className="h-3 w-3 mr-1" />;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading stock out data...</p>
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
            <h3 className="text-lg font-medium">
              Error Loading Stock Out Data
            </h3>
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
          <h1 className="text-2xl font-bold">Stock Out</h1>
          <p className="text-muted-foreground">
            Manage outgoing inventory items
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => router.push("/stock/out/create")}>
          <Plus size={16} />
          New Stock Out
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
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
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
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
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Check className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
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
              <Input
                placeholder="Search by reference, department or requestor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                icon={<Search size={16} />}
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm">
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Filter size={14} />
                More Filters
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <FileDown size={14} />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stock Out Table */}
      {sortedData.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Stock Out Records ({sortedData.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th
                      className="text-left py-3 px-2 font-medium cursor-pointer"
                      onClick={() => handleSort("reference_number")}>
                      <div className="flex items-center">
                        Reference Number
                        {sortField === "reference_number" && (
                          <ArrowUpDown size={14} className="ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-3 px-2 font-medium">
                      Department
                    </th>
                    <th className="text-left py-3 px-2 font-medium">
                      Requestor
                    </th>
                    <th
                      className="text-left py-3 px-2 font-medium cursor-pointer"
                      onClick={() => handleSort("request_date")}>
                      <div className="flex items-center">
                        Request Date
                        {sortField === "request_date" && (
                          <ArrowUpDown size={14} className="ml-1" />
                        )}
                      </div>
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
                    <th className="text-left py-3 px-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <code className="px-2 py-1 bg-muted rounded text-sm">
                          {item.reference_number}
                        </code>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium">
                          {item.department_name || "N/A"}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium">
                          {item.requestor_name || "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.requestor_username || ""}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {new Date(item.request_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={item.status} />
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
                                router.push(`/stock/out/${item.id}`)
                              }>
                              <Eye size={14} className="mr-2" />
                              View Details
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
      ) : (
        <Card className="p-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <TrendingDown size={48} className="text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium">
            No stock out records found
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating a new stock out record"}
          </p>
          <div className="mt-6">
            <Button onClick={() => router.push("/stockout/create")}>
              <Plus className="mr-2 h-4 w-4" />
              New Stock Out
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
