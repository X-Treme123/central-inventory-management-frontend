"use client";

import { useEffect, useState } from "react";
import { getStockHistory, getAllProducts } from "@/lib/api/services";
import { StockHistory, Product } from "@/lib/api/types";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Filter, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default function StockHistoryPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<StockHistory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchProducts();
      fetchStockHistory();
    }
  }, [token]);

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts(token!);
      if (response.data) {
        setProducts(response.data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchStockHistory = async () => {
    try {
      setLoading(true);
      const response = await getStockHistory(token!, {
        productId: productId === "all" ? undefined : productId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      if (response.data) {
        setHistory(response.data);
      }
    } catch (err) {
      setError("Gagal memuat data histori stok.");
      console.error("Error fetching stock history:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchStockHistory();
  };

  const resetFilters = () => {
    setProductId("");
    setStartDate("");
    setEndDate("");
    // Fetch all history without filters
    fetchStockHistory();
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "stock_in":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Barang Masuk
          </Badge>
        );
      case "stock_out":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Barang Keluar
          </Badge>
        );
      case "defect":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Barang Rusak
          </Badge>
        );
      case "adjustment":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Penyesuaian
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const exportToCSV = () => {
    // Data to be exported
    const data = history.map((item) => ({
      Tanggal: new Date(item.transaction_date).toLocaleDateString("id-ID"),
      "Part Number": item.part_number || "",
      "Nama Produk": item.product_name || "",
      "Tipe Transaksi":
        item.transaction_type === "stock_in"
          ? "Barang Masuk"
          : item.transaction_type === "stock_out"
            ? "Barang Keluar"
            : item.transaction_type === "defect"
              ? "Barang Rusak"
              : "Penyesuaian",
      Jumlah: item.quantity,
      Satuan: item.unit_name || "",
      "Total Pieces": item.total_pieces,
      "Stok Sebelum": item.previous_stock,
      "Stok Setelah": item.current_stock,
      Warehouse: item.warehouse_name || "",
      Container: item.container_name || "",
      Rack: item.rack_name || "",
      Oleh: item.user_name || "",
      Catatan: item.notes || "",
    }));

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Add headers
    csvRows.push(headers.join(","));

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const escaped = String(row[header as keyof typeof row]).replace(
          /"/g,
          '\\"'
        );
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    }

    const csvString = csvRows.join("\n");

    // Create and download file
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `stock_history_${new Date().toLocaleDateString()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/reports")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Laporan Histori Stok</h1>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Produk</label>
              <Select value={productId} onValueChange={setProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Produk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Produk</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.part_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Tanggal Mulai</label>
              <div className="relative">
                <Calendar className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Tanggal Selesai</label>
              <div className="relative">
                <Calendar className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-end gap-2">
              <Button
                onClick={applyFilters}
                className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Terapkan Filter
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Histori Stok</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <p>Memuat data...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-48">
              <p className="text-red-500">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex justify-center items-center h-48">
              <p>Tidak ada data histori stok.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Produk</TableHead>
                    <TableHead>Tipe Transaksi</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Stok Sebelum</TableHead>
                    <TableHead className="text-right">Stok Setelah</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Oleh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {new Date(item.created_at).toLocaleString(
                          "id-ID",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-gray-500">
                          {item.part_number}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTransactionTypeBadge(item.transaction_type)}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity} {item.unit_name} ({item.total_pieces}{" "}
                        pcs)
                      </TableCell>
                      <TableCell className="text-right">
                        {item.previous_stock}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.current_stock}
                      </TableCell>
                      <TableCell>
                        <div>{item.warehouse_name}</div>
                        <div className="text-sm text-gray-500">
                          {item.container_name} / {item.rack_name}
                        </div>
                      </TableCell>
                      <TableCell>{item.user_name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
