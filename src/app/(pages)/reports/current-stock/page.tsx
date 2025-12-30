"use client";

import { useEffect, useState } from "react";
import { getCurrentStock } from "@/lib/api/services";
import { CurrentStock } from "@/lib/api/types";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CurrentStockPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [stocks, setStocks] = useState<CurrentStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchCurrentStock();
    }
  }, [token]);

  const fetchCurrentStock = async () => {
    try {
      setLoading(true);
      const response = await getCurrentStock(token!);
      if (response.data) {
        setStocks(response.data);
      }
    } catch (err) {
      setError("Gagal memuat data stok saat ini.");
      console.error("Error fetching current stock:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = stocks.filter((stock) => {
    return (
      stock.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stock.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const exportToCSV = () => {
    // Data to be exported
    const data = filteredStocks.map((stock) => ({
      "Part Number": stock.part_number || "",
      "Nama Produk": stock.product_name || "",
      "Kategori": stock.category_name || "",
      "Warehouse": stock.warehouse_name || "",
      "Container": stock.container_name || "",
      "Rack": stock.rack_name || "",
      "Jumlah Pcs": stock.total_pieces,
      "Total Nilai": `Rp ${stock.total_amount.toLocaleString("id-ID")}`,
    }));

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(","));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const escaped = String(row[header as keyof typeof row]).replace(/"/g, '\\"');
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
    link.setAttribute("download", `current_stock_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/reports")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Laporan Stok Saat Ini</h1>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Daftar Stok Barang</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Cari produk, kategori, atau lokasi..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
          </div>
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
          ) : filteredStocks.length === 0 ? (
            <div className="flex justify-center items-center h-48">
              <p>Tidak ada data stok.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead>Container</TableHead>
                    <TableHead>Rack</TableHead>
                    <TableHead className="text-right">Jumlah (Pcs)</TableHead>
                    <TableHead className="text-right">Total Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell>{stock.part_number}</TableCell>
                      <TableCell>{stock.product_name}</TableCell>
                      <TableCell>{stock.category_name}</TableCell>
                      <TableCell>{stock.warehouse_name}</TableCell>
                      <TableCell>{stock.container_name}</TableCell>
                      <TableCell>{stock.rack_name}</TableCell>
                      <TableCell className="text-right">{stock.total_pieces.toLocaleString()}</TableCell>
                      <TableCell className="text-right">Rp {stock.total_amount.toLocaleString("id-ID")}</TableCell>
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