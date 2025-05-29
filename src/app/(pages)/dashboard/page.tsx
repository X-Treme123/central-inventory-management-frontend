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
  const navigateToReports = () => router.push("/reports"); // Assuming you have this route

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

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your inventory system
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={navigateToReports}
            variant="outline"
            className="gap-2">
            <FileText size={16} />
            Reports
          </Button>
          <Button onClick={navigateToStockIn} className="gap-2">
            <Plus size={16} />
            New Stock In
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card
          className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer transition-colors"
          onClick={navigateToStockIn}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-blue-500 text-white p-3 rounded-full">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="font-medium">Stock In</h3>
              <p className="text-sm text-muted-foreground">
                Record new incoming items
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900 cursor-pointer transition-colors"
          onClick={navigateToStockOut}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-green-500 text-white p-3 rounded-full">
              <ShoppingCart size={24} />
            </div>
            <div>
              <h3 className="font-medium">Stock Out</h3>
              <p className="text-sm text-muted-foreground">
                Process item requests
              </p>
            </div>
          </CardContent>
        </Card>


        <Card
          className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer transition-colors"
          onClick={navigateToReports}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="bg-purple-500 text-white p-3 rounded-full">
              <BarChart2 size={24} />
            </div>
            <div>
              <h3 className="font-medium">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                View inventory reports
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Inventory Value
                </p>
                {loading ? (
                  <Skeleton className="h-7 w-28 mt-1" />
                ) : (
                  <p className="text-xl font-bold">1.000.000</p>

                  // <p className="text-xl font-bold">{formatCurrency(totalStockValue)}</p>
                )}
              </div>
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Stock Items
                </p>
                {loading ? (
                  <Skeleton className="h-7 w-28 mt-1" />
                ) : (
                  <p className="text-xl font-bold">
                    {totalStockItems.toLocaleString()}
                  </p>
                )}
              </div>
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                {loading ? (
                  <Skeleton className="h-7 w-28 mt-1" />
                ) : (
                  <p className="text-xl font-bold">{lowStockProducts}</p>
                )}
              </div>
              <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Master Data Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Warehouses
                </p>
                {loading ? (
                  <Skeleton className="h-7 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-bold">{warehouses.length}</p>
                )}
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-full">
                <Grid className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                {loading ? (
                  <Skeleton className="h-7 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-bold">{products.length}</p>
                )}
              </div>
              <div className="bg-violet-100 dark:bg-violet-900 p-2 rounded-full">
                <Box className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Suppliers</p>
                {loading ? (
                  <Skeleton className="h-7 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-bold">{suppliers.length}</p>
                )}
              </div>
              <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded-full">
                <Truck className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Departments
                </p>
                {loading ? (
                  <Skeleton className="h-7 w-16 mt-1" />
                ) : (
                  <p className="text-xl font-bold">{departments.length}</p>
                )}
              </div>
              <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock In vs Stock Out Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Stock In vs Stock Out (Last 7 Days)</CardTitle>
            <CardDescription>
              Compare incoming and outgoing inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
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
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="in"
                    name="Stock In"
                    stackId="a"
                    fill="#0088FE"
                  />
                  <Bar
                    dataKey="out"
                    name="Stock Out"
                    stackId="a"
                    fill="#FF8042"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] border rounded-lg border-dashed p-4">
                <BarChart2 size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No stock data available for the last 7 days
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Inventory breakdown by category</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="w-full h-[300px] flex items-center justify-center">
                <Skeleton className="h-[250px] w-full" />
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
                  <Tooltip formatter={(value) => value.toLocaleString()} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] border rounded-lg border-dashed p-4">
                <Layers size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No category data available
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Tabs defaultValue="stock-in" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="stock-in">Recent Stock In</TabsTrigger>
          <TabsTrigger value="stock-out">Recent Stock Out</TabsTrigger>
        </TabsList>

        <TabsContent value="stock-in">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock In Transactions</CardTitle>
              <CardDescription>Latest inventory receipts</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : recentStockIn.length > 0 ? (
                <div className="space-y-4">
                  {recentStockIn.map((stockIn) => (
                    <div
                      key={stockIn.id}
                      className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{stockIn.invoice_code}</p>
                        <p className="text-sm text-muted-foreground">
                          {stockIn.supplier_name} -{" "}
                          {formatDate(stockIn.receipt_date)}
                        </p>
                      </div>
                      <div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs ${
                            stockIn.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : stockIn.status === "pending"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}>
                          {stockIn.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <Truck size={48} className="text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No recent stock in transactions
                  </p>
                </div>
              )}

              {recentStockIn.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/stock/in")}>
                    View All Stock In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock-out">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Out Transactions</CardTitle>
              <CardDescription>Latest inventory distributions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : recentStockOut.length > 0 ? (
                <div className="space-y-4">
                  {recentStockOut.map((stockOut) => (
                    <div
                      key={stockOut.id}
                      className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {stockOut.reference_number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {stockOut.department_name} - {stockOut.requestor_name}
                        </p>
                      </div>
                      <div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs ${
                            stockOut.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : stockOut.status === "approved"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : stockOut.status === "pending"
                                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}>
                          {stockOut.status.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <ShoppingCart
                    size={48}
                    className="text-muted-foreground mb-4"
                  />
                  <p className="text-muted-foreground">
                    No recent stock out transactions
                  </p>
                </div>
              )}

              {recentStockOut.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/stock/out")}>
                    View All Stock Out
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="defects">
          <Card>
            <CardHeader>
              <CardTitle>Recent Defect Reports</CardTitle>
              <CardDescription>Latest reported defective items</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
