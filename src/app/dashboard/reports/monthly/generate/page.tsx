"use client";

import { useState } from "react";
import { generateMonthlyReport } from "@/lib/api/services";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GenerateMonthlyReportPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [month, setMonth] = useState<string>(new Date().getMonth() + 1 + "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setSuccess(false);
      setError(null);
      
      const response = await generateMonthlyReport(
        token!, 
        parseInt(year), 
        parseInt(month)
      );
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/reports/monthly");
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal generate laporan bulanan.");
      }
      console.error("Error generating monthly report:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/reports/monthly")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Generate Laporan Bulanan</h1>
      </div>

      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Generate Laporan Baru</CardTitle>
        </CardHeader>
        <CardContent>
          {success && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Berhasil</AlertTitle>
              <AlertDescription className="text-green-700">
                Laporan bulanan berhasil digenerate. Anda akan dialihkan ke halaman laporan bulanan.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertTitle className="text-red-800">Error</AlertTitle>
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium">Tahun</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="mt-1">
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
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Pilih Bulan" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleGenerate} 
                disabled={loading || !year || !month || success}
                className="w-full flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Calendar className="h-4 w-4" />
                )}
                {loading ? "Generating..." : "Generate Laporan"}
              </Button>
            </div>

            <div className="text-sm text-gray-500 pt-2">
              <p>Proses ini akan mengkalkulasi laporan bulanan untuk semua produk pada bulan dan tahun yang dipilih. Data akan dihitung berdasarkan:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Stok awal (dari bulan sebelumnya)</li>
                <li>Transaksi barang masuk</li>
                <li>Transaksi barang keluar</li>
                <li>Barang rusak/defect</li>
                <li>Kalkulasi stok akhir</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}