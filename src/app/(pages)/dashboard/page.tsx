"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Truck,
  ShoppingCart,
  BarChart2,
  Users,
  Layers,
  Box,
  Grid,
  Plus,
  FileText,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// API imports
import {
  getCurrentStock,
  getAllCategories,
  getAllProducts,
  getAllDepartments,
  getStockHistory,
  getAllStockIn,
  getAllStockOut,
} from "@/lib/api/services";
import { getAllWarehouses } from "@/features/pages/warehouses/api/index";
import { getAllSuppliers } from "@/features/pages/suppliers/api/index";
import { Warehouses } from "@/features/pages/warehouses/api/index";
import {
  CurrentStock,
  StockHistory,
  StockIn,
  StockOut,
  DefectItem,
  Product,
  Category,
  Department,
  Supplier,
} from "@/lib/api/types";
import { useAuth } from "@/context/AuthContext";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FF6B6B",
  "#6B66FF",
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const { token } = useAuth();

  // States for each data type
  const [loading, setLoading] = useState(true);
  const [currentStock, setCurrentStock] = useState<CurrentStock[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouses[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stockHistory, setStockHistory] = useState<StockHistory[]>([]);
  const [recentStockIn, setRecentStockIn] = useState<StockIn[]>([]);
  const [recentStockOut, setRecentStockOut] = useState<StockOut[]>([]);

  // Fetch all the necessary data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;

      setLoading(true);
      try {
        // Fetch all data in parallel
        const [
          stockResponse,
          warehousesResponse,
          suppliersResponse,
          categoriesResponse,
          productsResponse,
          departmentsResponse,
          stockHistoryResponse,
          stockInResponse,
          stockOutResponse,
        ] = await Promise.all([
          getCurrentStock(token),
          getAllWarehouses(token),
          getAllSuppliers(token),
          getAllCategories(token),
          getAllProducts(token),
          getAllDepartments(token),
          getStockHistory(token, {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
          }),
          getAllStockIn(token),
          getAllStockOut(token),
        ]);

        // Update states with the fetched data
        if (stockResponse.data) setCurrentStock(stockResponse.data);
        if (warehousesResponse.data) setWarehouses(warehousesResponse.data);
        if (suppliersResponse.data) setSuppliers(suppliersResponse.data);
        if (categoriesResponse.data) setCategories(categoriesResponse.data);
        if (productsResponse.data) setProducts(productsResponse.data);
        if (departmentsResponse.data) setDepartments(departmentsResponse.data);
        if (stockHistoryResponse.data)
          setStockHistory(stockHistoryResponse.data);
        if (stockInResponse.data) {
          // Sort by date and get most recent
          const sortedStockIn = stockInResponse.data.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          setRecentStockIn(sortedStockIn.slice(0, 5));
        }
        if (stockOutResponse.data) {
          const sortedStockOut = stockOutResponse.data.sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          );
          setRecentStockOut(sortedStockOut.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  // Calculate summary metrics
  const totalStockValue = currentStock.reduce(
    (sum, item) => sum + item.total_amount,
    0
  );
  const totalStockItems = currentStock.reduce(
    (sum, item) => sum + item.total_pieces,
    0
  );
  const lowStockProducts = currentStock.filter(
    (item) => item.total_pieces < 10
  ).length;

  // Calculate product distribution by category
  const categoryDistribution = categories.map((category) => {
    const productsInCategory = products.filter(
      (product) => product.category_id === category.id
    );
    const stockInCategory = currentStock.filter((stock) =>
      productsInCategory.some((product) => product.id === stock.product_id)
    );
    const totalValue = stockInCategory.reduce(
      (sum, item) => sum + item.total_amount,
      0
    );
    const totalItems = stockInCategory.reduce(
      (sum, item) => sum + item.total_pieces,
      0
    );

    return {
      name: category.name,
      items: totalItems,
      value: totalValue,
    };
  });

  // Calculate stock in vs stock out trends
  const stockTrends = [];

  // Create a map to store stock in/out by date
  const stockInByDate = new Map();
  const stockOutByDate = new Map();

  // Process stock history to get stock in/out by date
  stockHistory.forEach((history) => {
    const date = new Date(history.transaction_date).toISOString().split("T")[0];

    if (history.transaction_type === "stock_in") {
      const current = stockInByDate.get(date) || 0;
      stockInByDate.set(date, current + history.total_pieces);
    } else if (history.transaction_type === "stock_out") {
      const current = stockOutByDate.get(date) || 0;
      stockOutByDate.set(date, current + history.total_pieces);
    }
  });

  // Get all unique dates
  const allDates = new Set([...stockInByDate.keys(), ...stockOutByDate.keys()]);

  // Sort dates
  const sortedDates = Array.from(allDates).sort();

  // Create trend data
  sortedDates.slice(-7).forEach((date) => {
    stockTrends.push({
      date,
      in: stockInByDate.get(date) || 0,
      out: stockOutByDate.get(date) || 0,
    });
  });

  // Navigation handlers
  const navigateToStockIn = () => router.push("/stock/in/create");
  const navigateToStockOut = () => router.push("/stock/out/create");
  const navigateToReports = () => router.push("/reports");

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get status icon and color
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { 
          icon: CheckCircle, 
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
        };
      case "approved":
        return { 
          icon: CheckCircle, 
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        };
      case "pending":
        return { 
          icon: Clock, 
          color: "text-amber-600 dark:text-amber-400",
          bgColor: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
        };
      default:
        return { 
          icon: XCircle, 
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="space-y-8 p-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Overview of your inventory system
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={navigateToReports}
              variant="outline"
              className="gap-2 hover:bg-purple-50 hover:border-purple-200 dark:hover:bg-purple-900/20 dark:hover:border-purple-800 transition-all duration-200">
              <FileText size={16} />
              Reports
            </Button>
            <Button 
              onClick={navigateToStockIn} 
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
              <Plus size={16} />
              New Stock In
            </Button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants}>
            <Card
              className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 hover:shadow-xl hover:shadow-blue-200/20 dark:hover:shadow-blue-900/20 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
              onClick={navigateToStockIn}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Stock In</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Record new incoming items
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card
              className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800 hover:shadow-xl hover:shadow-emerald-200/20 dark:hover:shadow-emerald-900/20 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
              onClick={navigateToStockOut}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-400/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Stock Out</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Process item requests
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card
              className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 hover:shadow-xl hover:shadow-purple-200/20 dark:hover:shadow-purple-900/20 cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
              onClick={navigateToReports}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-400/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BarChart2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Analytics</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View inventory reports
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Total Inventory Value
                    </p>
                    {loading ? (
                      <Skeleton className="h-8 w-32 mb-2" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {formatCurrency(totalStockValue)}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-emerald-600">
                      <TrendingUp size={16} />
                      <span className="text-sm font-medium">Active</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Total Stock Items
                    </p>
                    {loading ? (
                      <Skeleton className="h-8 w-24 mb-2" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {totalStockItems.toLocaleString()}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-blue-600">
                      <Package size={16} />
                      <span className="text-sm font-medium">Items</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 rounded-xl">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Low Stock Items
                    </p>
                    {loading ? (
                      <Skeleton className="h-8 w-16 mb-2" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {lowStockProducts}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-amber-600">
                      <AlertTriangle size={16} />
                      <span className="text-sm font-medium">Alert</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-3 rounded-xl">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Master Data Stats */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Warehouses", value: warehouses.length, icon: Grid, color: "from-indigo-500 to-indigo-600" },
            { label: "Products", value: products.length, icon: Box, color: "from-violet-500 to-violet-600" },
            { label: "Suppliers", value: suppliers.length, icon: Truck, color: "from-teal-500 to-teal-600" },
            { label: "Departments", value: departments.length, icon: Users, color: "from-orange-500 to-orange-600" }
          ].map((item, index) => (
            <motion.div key={item.label} variants={itemVariants}>
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {item.label}
                      </p>
                      {loading ? (
                        <Skeleton className="h-6 w-12" />
                      ) : (
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {item.value}
                        </p>
                      )}
                    </div>
                    <div className={`bg-gradient-to-r ${item.color} p-2 rounded-lg`}>
                      <item.icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts and Recent Activities */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Stock In vs Stock Out Chart */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-blue-600" />
                  Stock In vs Stock Out (Last 7 Days)
                </CardTitle>
                <CardDescription>
                  Compare incoming and outgoing inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="w-full h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[280px] w-full rounded-lg" />
                  </div>
                ) : stockTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={stockTrends}
                      margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                      <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        fontSize={12}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar
                        dataKey="in"
                        name="Stock In"
                        stackId="a"
                        fill="#0088FE"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="out"
                        name="Stock Out"
                        stackId="a"
                        fill="#FF8042"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <BarChart2 size={48} className="text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                      No stock data available for the last 7 days
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Distribution Chart */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-600" />
                  Category Distribution
                </CardTitle>
                <CardDescription>Inventory breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="w-full h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[280px] w-full rounded-lg" />
                  </div>
                ) : categoryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="items">
                        {categoryDistribution.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => value.toLocaleString()}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <Layers size={48} className="text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-center text-sm">
                      No category data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Tabs defaultValue="stock-in" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <TabsTrigger value="stock-in" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                Recent Stock In
              </TabsTrigger>
              <TabsTrigger value="stock-out" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                Recent Stock Out
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stock-in">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    Recent Stock In Transactions
                  </CardTitle>
                  <CardDescription>Latest inventory receipts</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : recentStockIn.length > 0 ? (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {recentStockIn.map((stockIn, index) => {
                          const statusConfig = getStatusConfig(stockIn.status);
                          return (
                            <motion.div
                              key={stockIn.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30`}>
                                  <statusConfig.icon className={`h-4 w-4 ${statusConfig.color}`} />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {stockIn.invoice_code}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {stockIn.supplier_name} • {formatDate(stockIn.receipt_date)}
                                  </p>
                                </div>
                              </div>
                              <Badge className={statusConfig.bgColor}>
                                {stockIn.status.toUpperCase()}
                              </Badge>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                        <Truck size={32} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-center">
                        No recent stock in transactions
                      </p>
                    </div>
                  )}

                  {recentStockIn.length > 0 && (
                    <div className="mt-6 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/stock/in")}
                        className="hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-800"
                      >
                        View All Stock In
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stock-out">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-emerald-600" />
                    Recent Stock Out Transactions
                  </CardTitle>
                  <CardDescription>Latest inventory distributions</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : recentStockOut.length > 0 ? (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {recentStockOut.map((stockOut, index) => {
                          const statusConfig = getStatusConfig(stockOut.status);
                          return (
                            <motion.div
                              key={stockOut.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30`}>
                                  <statusConfig.icon className={`h-4 w-4 ${statusConfig.color}`} />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {stockOut.reference_number}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {stockOut.department_name} • {stockOut.requestor_name}
                                  </p>
                                </div>
                              </div>
                              <Badge className={statusConfig.bgColor}>
                                {stockOut.status.toUpperCase()}
                              </Badge>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-full mb-4">
                        <ShoppingCart size={32} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-center">
                        No recent stock out transactions
                      </p>
                    </div>
                  )}

                  {recentStockOut.length > 0 && (
                    <div className="mt-6 flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/stock/out")}
                        className="hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-800"
                      >
                        View All Stock Out
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}