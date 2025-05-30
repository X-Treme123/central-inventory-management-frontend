// app/(pages)/defects/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAllDefects } from "@/lib/api/services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { DefectItem, DefectStatus } from "@/lib/api/types";
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Calendar,
  Package,
  TrendingDown,
  CheckCircle,
  Clock,
  ArrowLeftRight,
  FileDown,
} from "lucide-react";

export default function DefectsPage() {
  const { token } = useAuth();
  const router = useRouter();

  // Data state
  const [defects, setDefects] = useState<DefectItem[]>([]);
  const [filteredDefects, setFilteredDefects] = useState<DefectItem[]>([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [defectTypeFilter, setDefectTypeFilter] = useState<string>("all");

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadDefects();
    }
  }, [token]);

  // Apply filters when search term, status filter, or defect type filter changes
  useEffect(() => {
    applyFilters();
  }, [defects, searchTerm, statusFilter, defectTypeFilter]);

  const loadDefects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getAllDefects(token!);
      
      if (response.code === "200" && response.data) {
        setDefects(response.data);
      } else {
        throw new Error(response.message || "Failed to load defects");
      }
    } catch (err: any) {
      console.error("Error loading defects:", err);
      setError(err.message || "Failed to load defects. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...defects];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (defect) =>
          defect.product_name?.toLowerCase().includes(search) ||
          defect.part_number?.toLowerCase().includes(search) ||
          defect.defect_type?.toLowerCase().includes(search) ||
          defect.reported_by_name?.toLowerCase().includes(search) ||
          defect.invoice_code?.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((defect) => defect.status === statusFilter);
    }

    // Apply defect type filter
    if (defectTypeFilter !== "all") {
      filtered = filtered.filter((defect) => defect.defect_type === defectTypeFilter);
    }

    setFilteredDefects(filtered);
  };

  // Get unique defect types for filter
  const getDefectTypes = () => {
    const types = new Set(defects.map((defect) => defect.defect_type));
    return Array.from(types).sort();
  };

  // Status badge component
  const getStatusBadge = (status: DefectStatus) => {
    const configs = {
      pending: {
        className: "bg-yellow-300 text-black border-yellow-200",
        icon: <Clock className="h-3 w-3 mr-1" />,
        label: "Pending",
      },
      returned: {
        className: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <ArrowLeftRight className="h-3 w-3 mr-1" />,
        label: "Returned",
      },
      resolved: {
        className: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        label: "Resolved",
      },
    };

    const config = configs[status] || configs.pending;

    return (
      <Badge className={config.className}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  // Calculate stats
  const getStats = () => {
    return {
      total: defects.length,
      pending: defects.filter((d) => d.status === "pending").length,
      returned: defects.filter((d) => d.status === "returned").length,
      resolved: defects.filter((d) => d.status === "resolved").length,
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading defect reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Defect Management</h1>
            <p className="text-gray-600">Track and manage product defects</p>
          </div>
          <Button onClick={() => router.push("/defects/create")} className="gap-2">
            <Plus className="h-4 w-4" />
            Report Defect
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Defects</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ArrowLeftRight className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Returned</p>
                  <p className="text-2xl font-bold">{stats.returned}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search defects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <Select value={defectTypeFilter} onValueChange={setDefectTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {getDefectTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  More Filters
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <FileDown className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Defects Table */}
        {filteredDefects.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>
                Defect Reports ({filteredDefects.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Product</th>
                      <th className="text-left py-3 px-2 font-medium">Defect Type</th>
                      <th className="text-left py-3 px-2 font-medium">Quantity</th>
                      <th className="text-left py-3 px-2 font-medium">Date</th>
                      <th className="text-left py-3 px-2 font-medium">Status</th>
                      <th className="text-left py-3 px-2 font-medium">Reporter</th>
                      <th className="text-left py-3 px-2 font-medium">Source</th>
                      <th className="text-left py-3 px-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDefects.map((defect) => (
                      <tr key={defect.id} className="border-b hover:bg-gray-700 transition-colors ease-in-out">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{defect.product_name}</div>
                              <div className="text-sm text-gray-500">{defect.part_number}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="text-xs">
                            {defect.defect_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-medium">
                            {defect.quantity} {defect.unit_abbreviation || defect.unit_name}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {new Date(defect.defect_date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {getStatusBadge(defect.status)}
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-sm">{defect.reported_by_name}</div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-sm">
                            {defect.invoice_code && (
                              <code className="px-1 py-0.5 bg-gray-700 rounded text-xs">
                                {defect.invoice_code}
                              </code>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/defects/${defect.id}`)}
                            className="gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="p-12 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <AlertTriangle className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mt-4 text-lg font-medium">
              {defects.length === 0 ? "No defect reports found" : "No defects match your filters"}
            </h3>
            <p className="text-gray-600 mt-2">
              {defects.length === 0 
                ? "Get started by reporting your first defect"
                : "Try adjusting your search criteria or filters"
              }
            </p>
            {defects.length === 0 && (
              <div className="mt-6">
                <Button onClick={() => router.push("/defects/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Report First Defect
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}