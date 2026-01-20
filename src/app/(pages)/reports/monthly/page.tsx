"use client";

import { useEffect, useState } from "react";
import { getMonthlyReport } from "@/lib/api/services";
import { MonthlyStockReport } from "@/lib/api/types";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Filter, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MonthlyReportPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<MonthlyStockReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [month, setMonth] = useState<string>(new Date().getMonth() + 1 + "");
  const [error, setError] = useState<string | null>(null);

  const years = Array.from({ length: 5 }, (_, i) => 
    (new Date().getFullYear() - i).toString()
  );
  
  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  useEffect(() => {
    if (token) {
      fetchMonthlyReport();
    }
  }, [token]);

  const fetchMonthlyReport = async () => {
    try {
      setLoading(true);
      const response = await getMonthlyReport(token!, {
        year: year ? parseInt(year) : undefined,
        month: month ? parseInt(month) : undefined,
      });
      if (response.data) {
        setReports(response.data);
      }
    } catch (err) {
      setError("Gagal memuat laporan bulanan.");
      console.error("Error fetching monthly report:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchMonthlyReport();
  };

  const exportToCSV = () => {
    // Data to be exported
    const data = reports.map((report) => ({
      "Part Number": report.part_number || "",
      "Nama Produk": report.product_name || "",
      "Kategori": report.category_name || "",
      "Stok Awal (Qty)": report.opening_qty,
      "Stok Awal (Nilai)": `Rp ${report.opening_amount.toLocaleString("id-ID")}`,
      "Barang Masuk (Qty)": report.incoming_qty,
      "Barang Masuk (Nilai)": `Rp ${report.incoming_amount.toLocaleString("id-ID")}`,
      "Barang Keluar (Qty)": report.outgoing_qty,
      "Barang Keluar (Nilai)": `Rp ${report.outgoing_amount.toLocaleString("id-ID")}`,
      "Stok Akhir (Qty)": report.closing_qty,
      "Stok Akhir (Nilai)": `Rp ${report.closing_amount.toLocaleString("id-ID")}`,
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
    
    const monthName = months.find(m => m.value === month)?.label || "";
    link.setAttribute("download", `monthly_report_${monthName}_${year}.csv`);
    
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
          <h1 className="text-2xl font-bold">Laporan Bulanan</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => router.push("/reports/monthly/generate")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Generate Laporan Baru
          </Button>
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Tahun</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Tahun" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Bulan</label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={applyFilters} className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Terapkan Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Laporan Bulan {months.find(m => m.value === month)?.label || ""} {year}
          </CardTitle>
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
          ) : reports.length === 0 ? (
            <div className="flex justify-center items-center h-48">
              <p>Tidak ada laporan untuk periode yang dipilih.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead rowSpan={2}>No</TableHead>
                    <TableHead rowSpan={2}>Part Number</TableHead>
                    <TableHead rowSpan={2}>Nama Produk</TableHead>
                    <TableHead rowSpan={2}>Kategori</TableHead>
                    <TableHead colSpan={2} className="text-center">Stok Awal</TableHead>
                    <TableHead colSpan={2} className="text-center">Barang Masuk</TableHead>
                    <TableHead colSpan={2} className="text-center">Barang Keluar</TableHead>
                    <TableHead colSpan={2} className="text-center">Stok Akhir</TableHead>
                  </TableRow>
                  <TableRow>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Nilai</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Nilai</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Nilai</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report, index) => (
                    <TableRow key={report.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{report.part_number}</TableCell>
                      <TableCell>{report.product_name}</TableCell>
                      <TableCell>{report.category_name}</TableCell>
                      <TableCell className="text-right">{report.opening_qty}</TableCell>
                      <TableCell className="text-right">Rp {report.opening_amount.toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-right">{report.incoming_qty}</TableCell>
                      <TableCell className="text-right">Rp {report.incoming_amount.toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-right">{report.outgoing_qty}</TableCell>
                      <TableCell className="text-right">Rp {report.outgoing_amount.toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-right">{report.closing_qty}</TableCell>
                      <TableCell className="text-right">Rp {report.closing_amount.toLocaleString("id-ID")}</TableCell>
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