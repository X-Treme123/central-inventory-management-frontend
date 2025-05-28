// app/(dashboard)/stock/out/create/page.tsx - Updated untuk langsung redirect ke scan
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getAllDepartments, createStockOut } from "@/lib/api/services";
import { Department } from "@/lib/api/types";
import Cookies from "js-cookie";
import { CheckCircle2, AlertCircle, Scan, ArrowRight } from "lucide-react";

export default function CreateStockOutPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  // State untuk form header
  const [referenceNumber, setReferenceNumber] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [requestorName, setRequestorName] = useState("");
  const [notes, setNotes] = useState("");

  // Data dari API
  const [departments, setDepartments] = useState<Department[]>([]);

  // State tambahan
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mendapatkan token dari cookie saat komponen dimuat
  useEffect(() => {
    const storedToken = Cookies.get("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Mengambil data master saat token tersedia
  useEffect(() => {
    if (!token) return;

    const fetchMasterData = async () => {
      setIsLoading(true);
      try {
        const departmentsRes = await getAllDepartments(token);
        setDepartments(departmentsRes.data || []);
      } catch (err: any) {
        setError(err.message || "Error fetching departments");
        console.error("Error fetching departments:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasterData();
  }, [token]);

  // Auto-generate reference number berdasarkan tanggal
  useEffect(() => {
    if (!referenceNumber) {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const timeStr = today.getHours().toString().padStart(2, '0') + 
                    today.getMinutes().toString().padStart(2, '0');
      setReferenceNumber(`REQ-${dateStr}-${timeStr}`);
    }
  }, []);

  // Handle submit form header - langsung redirect ke scan
  const handleSubmitHeader = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Token tidak ditemukan. Silakan login kembali.");
      return;
    }

    // Validasi form
    if (!referenceNumber.trim() || !departmentId || !requestorName.trim()) {
      setError("Harap isi semua field yang wajib (Reference Number, Department, Nama User)");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await createStockOut(token, {
        reference_number: referenceNumber,
        department_id: departmentId,
        requestor_name: requestorName,
        notes: notes.trim() || undefined,
      });

      if (response.data && response.data.id) {
        setSuccessMessage("Stock Out request berhasil dibuat! Mengarahkan ke halaman scan...");
        
        // Redirect ke halaman scan setelah 1.5 detik
        setTimeout(() => {
          router.push(`/stock/out/scan/${response.data.id}`);
        }, 1500);
      } else {
        setError("Gagal membuat Stock Out request. Respons tidak valid.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal membuat Stock Out request");
      console.error("Error creating Stock Out request:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <div className="w-10 h-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Buat Stock Out Request</h1>
          <p className="text-gray-600 mt-2">
            Isi informasi dasar, lalu langsung scan barcode untuk mengeluarkan barang
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">Step 1</span>
          <ArrowRight className="h-4 w-4" />
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full">Scan Barcode</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Sukses</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Form untuk Stock Out Header */}
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Informasi Stock Out Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitHeader} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="referenceNumber">
                  Nomor Referensi <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="referenceNumber"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="REQ-20240518-001"
                  required
                />
                <p className="text-xs text-gray-500">
                  Nomor referensi unik untuk Stock Out ini
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">
                  Departemen <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={departmentId}
                  onValueChange={setDepartmentId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="requestorName">
                  Nama User <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="requestorName"
                  value={requestorName}
                  onChange={(e) => setRequestorName(e.target.value)}
                  placeholder="Nama lengkap user yang mengambil barang"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Catatan</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Catatan tambahan tentang pengambilan barang (opsional)"
                  rows={3}
                />
              </div>
            </div>

            {/* Info box tentang next step */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Scan className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Langkah Selanjutnya</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Setelah submit, Anda akan diarahkan ke halaman scan barcode untuk 
                    langsung mengeluarkan barang dengan scan. Stock akan berkurang otomatis 
                    setiap kali scan.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/stock/out")}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    Lanjut ke Scan Barcode
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}