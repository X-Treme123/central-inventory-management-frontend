// app/dashboard/stock-out/create/page.tsx
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
import {
  getAllDepartments,
  getAllProducts,
  getAllUnits,
  getCurrentStock,
  getUnitConversionsByProduct,
  createStockOut,
  addStockOutItem,
} from "@/lib/api/services";
import {
  Department,
  Product,
  Unit,
  CurrentStock,
  UnitConversion,
} from "@/lib/api/types";
import Cookies from "js-cookie";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function CreateStockOutPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  // State untuk form header
  const [referenceNumber, setReferenceNumber] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [requestorName, setRequestorName] = useState("");
  const [notes, setNotes] = useState("");

  // State untuk form item
  const [stockOutId, setStockOutId] = useState<string | null>(null);
  const [productId, setProductId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [pricePerUnit, setPricePerUnit] = useState<number>(0);
  
  // Tambahan state untuk unit konversi
  const [packsPerBox, setPacksPerBox] = useState<number | undefined>(undefined);
  const [piecesPerPack, setPiecesPerPack] = useState<number | undefined>(undefined);
  const [showPacksPerBox, setShowPacksPerBox] = useState(false);
  const [showPiecesPerPack, setShowPiecesPerPack] = useState(false);
  
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [totalPieces, setTotalPieces] = useState<number>(0);
  const [availableStock, setAvailableStock] = useState<number>(0);

  // Data dari API
  const [departments, setDepartments] = useState<Department[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [currentStock, setCurrentStock] = useState<CurrentStock[]>([]);
  const [unitConversions, setUnitConversions] = useState<UnitConversion[]>([]);

  // State tambahan
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [headerCreated, setHeaderCreated] = useState(false);

  // Mendapatkan token dari cookie saat komponen dimuat
  useEffect(() => {
    const storedToken = Cookies.get("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Mengambil data master saat token tersedia
  useEffect(() => {
    if (!token) return;

    const fetchMasterData = async () => {
      setIsLoading(true);
      try {
        const [departmentsRes, productsRes, unitsRes, currentStockRes] =
          await Promise.all([
            getAllDepartments(token),
            getAllProducts(token),
            getAllUnits(token),
            getCurrentStock(token),
          ]);

        setDepartments(departmentsRes.data || []);
        setProducts(productsRes.data || []);
        setUnits(unitsRes.data || []);
        setCurrentStock(currentStockRes.data || []);
      } catch (err: any) {
        setError(err.message || "Error fetching master data");
        console.error("Error fetching master data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasterData();
  }, [token]);

  // Mengambil konversi unit dan stok saat produk dipilih
  useEffect(() => {
    if (!token || !productId) return;

    const fetchProductDetails = async () => {
      try {
        // Mendapatkan detail produk
        const product = products.find((p) => p.id === productId) || null;
        setCurrentProduct(product);

        // Reset unit selection
        setUnitId("");
        setCurrentUnit(null);
        setShowPacksPerBox(false);
        setShowPiecesPerPack(false);
        setPacksPerBox(undefined);
        setPiecesPerPack(undefined);

        // Mendapatkan konversi unit untuk produk
        const conversionsRes = await getUnitConversionsByProduct(
          token,
          productId
        );
        setUnitConversions(conversionsRes.data || []);

        // Mendapatkan stok saat ini
        const availableStock = currentStock
          .filter((stock) => stock.product_id === productId)
          .reduce((total, stock) => total + stock.total_pieces, 0);

        setAvailableStock(availableStock);

        // Set default price if product available
        if (product) {
          setPricePerUnit(product.price);
        }
      } catch (err: any) {
        console.error("Error fetching product details:", err);
      }
    };

    fetchProductDetails();
  }, [token, productId, products, currentStock]);

  // Update current unit when unit is selected and show appropriate conversion fields
  useEffect(() => {
    if (unitId) {
      const unit = units.find((u) => u.id === unitId) || null;
      setCurrentUnit(unit);
      
      if (unit) {
        const unitNameLower = unit.name.toLowerCase();
        
        // Tampilkan field packs_per_box jika unit adalah box/dus
        setShowPacksPerBox(
          unitNameLower.includes("box") || unitNameLower.includes("dus")
        );
        
        // Tampilkan field pieces_per_pack jika unit adalah pack atau box/dus
        setShowPiecesPerPack(
          unitNameLower.includes("pack") || 
          unitNameLower.includes("box") || 
          unitNameLower.includes("dus")
        );
        
        // Reset nilai konversi jika unit berubah
        if (!showPacksPerBox) setPacksPerBox(undefined);
        if (!showPiecesPerPack) setPiecesPerPack(undefined);
      }
    } else {
      setCurrentUnit(null);
      setShowPacksPerBox(false);
      setShowPiecesPerPack(false);
    }
  }, [unitId, units]);

  // Calculate total pieces and amount when inputs change
  useEffect(() => {
    if (!currentProduct || !currentUnit) {
      setTotalPieces(0);
      setTotalAmount(0);
      return;
    }

    let totalPcs = 0;
    
    // Hitung total pieces berdasarkan unit type dan faktor konversi
    const unitNameLower = currentUnit.name.toLowerCase();
    
    if ((unitNameLower.includes("box") || unitNameLower.includes("dus")) && packsPerBox && piecesPerPack) {
      // Jika unit adalah box/dus dan parameter konversi tersedia
      totalPcs = quantity * packsPerBox * piecesPerPack;
    } else if (unitNameLower.includes("pack") && piecesPerPack) {
      // Jika unit adalah pack dan parameter konversi tersedia
      totalPcs = quantity * piecesPerPack;
    } else if (unitId === currentProduct.base_unit_id) {
      // Jika unit adalah base unit (pieces), total adalah quantity
      totalPcs = quantity;
    } else {
      // Coba gunakan konversi unit dari database
      const unitToBase = unitConversions.find(
        (c) =>
          c.from_unit_id === unitId &&
          c.to_unit_id === currentProduct.base_unit_id
      );

      if (unitToBase) {
        // If conversion found, use it
        totalPcs = quantity * unitToBase.conversion_factor;
      } else {
        // No direct conversion, try to find through other units
        const sameFromConversions = unitConversions.filter(
          (c) => c.from_unit_id === unitId
        );
        if (sameFromConversions.length > 0) {
          // Find any conversion that leads to the base unit
          const anyConversion = sameFromConversions[0];
          totalPcs = quantity * anyConversion.conversion_factor;
        }
      }
    }

    setTotalPieces(totalPcs);

    // Calculate total amount
    setTotalAmount(quantity * pricePerUnit);
  }, [
    quantity,
    pricePerUnit,
    currentProduct,
    currentUnit,
    unitId,
    packsPerBox,
    piecesPerPack,
    unitConversions,
  ]);

  // Handle submit form header
  const handleSubmitHeader = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Token tidak ditemukan. Silakan login kembali.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await createStockOut(token, {
        reference_number: referenceNumber,
        department_id: departmentId,
        requestor_name: requestorName,
        notes,
      });

      if (response.data && response.data.id) {
        setStockOutId(response.data.id);
        setHeaderCreated(true);
        setSuccessMessage(
          "Stock Out request berhasil dibuat. Silakan tambahkan item."
        );
      } else {
        setError("Gagal membuat Stock Out request. Respons tidak valid.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal membuat Stock Out request");
      console.error("Error creating Stock Out request:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submit form item
  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !stockOutId) {
      setError("Token atau Stock Out ID tidak ditemukan");
      return;
    }

    // Validasi stok tersedia
    if (totalPieces > availableStock) {
      setError(
        `Stok tidak cukup. Stok tersedia: ${availableStock} pcs, Dibutuhkan: ${totalPieces} pcs`
      );
      return;
    }

    // Validasi input konversi jika diperlukan
    const unitNameLower = currentUnit?.name.toLowerCase() || "";
    if ((unitNameLower.includes("box") || unitNameLower.includes("dus")) && (!packsPerBox || !piecesPerPack)) {
      setError("Untuk unit box/dus, jumlah pack per box dan piece per pack harus diisi");
      return;
    } else if (unitNameLower.includes("pack") && !piecesPerPack) {
      setError("Untuk unit pack, jumlah piece per pack harus diisi");
      return;
    }

    try {
      setIsLoading(true);

      const requestData = {
        product_id: productId,
        unit_id: unitId,
        quantity,
        price_per_unit: pricePerUnit,
        packs_per_box: packsPerBox,
        pieces_per_pack: piecesPerPack
      };

      const response = await addStockOutItem(token, stockOutId, requestData);

      if (response && response.data) {
        setSuccessMessage("Item berhasil ditambahkan ke Stock Out request");

        // Reset form item
        setProductId("");
        setUnitId("");
        setQuantity(1);
        setPacksPerBox(undefined);
        setPiecesPerPack(undefined);
        setTotalPieces(0);
        setPricePerUnit(0);
        setTotalAmount(0);

        // Refresh available stock
        const currentStockRes = await getCurrentStock(token);
        setCurrentStock(currentStockRes.data || []);
      } else {
        setError("Gagal menambahkan item. Respons tidak valid.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal menambahkan item");
      console.error("Error adding Stock Out item:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle complete stock out
  const handleCompleteStockOut = () => {
    router.push(`/dashboard/stock-out`);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Render loading state
  if (isLoading && !headerCreated) {
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
      <h1 className="text-3xl font-bold">Buat Permintaan Stock Out</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-4 bg-green-900/20 border border-green-700 text-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-300" />
          <AlertTitle>Sukses</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {!headerCreated ? (
        // Form untuk Stock Out Header
        <Card>
          <CardHeader>
            <CardTitle>Informasi Permintaan</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitHeader} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">
                    Departemen <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={departmentId}
                    onValueChange={setDepartmentId}
                    required>
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

                <div className="space-y-2">
                  <Label htmlFor="requestorName">
                    Nama User <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="requestorName"
                    value={requestorName}
                    onChange={(e) => setRequestorName(e.target.value)}
                    placeholder="Nama User"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan tambahan tentang permintaan barang"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Lanjutkan ke Input Item"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        // Form untuk Stock Out Item
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tambah Item Permintaan</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitItem} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">
                      Produk <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={productId}
                      onValueChange={setProductId}
                      required>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih produk" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.part_number} - {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">
                      Satuan <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={unitId}
                      onValueChange={setUnitId}
                      required
                      disabled={!productId}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            productId
                              ? "Pilih satuan"
                              : "Pilih produk terlebih dahulu"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name} ({unit.abbreviation})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      Jumlah <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value) || 0)
                      }
                      required
                    />
                  </div>

                  {/* Tampilkan field packs_per_box jika diperlukan */}
                  {showPacksPerBox && (
                    <div className="space-y-2">
                      <Label htmlFor="packsPerBox">
                        Pack per Box <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="packsPerBox"
                        type="number"
                        min="1"
                        value={packsPerBox || ""}
                        onChange={(e) => setPacksPerBox(parseInt(e.target.value) || undefined)}
                        required
                      />
                    </div>
                  )}

                  {/* Tampilkan field pieces_per_pack jika diperlukan */}
                  {showPiecesPerPack && (
                    <div className="space-y-2">
                      <Label htmlFor="piecesPerPack">
                        Pieces per Pack <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="piecesPerPack"
                        type="number"
                        min="1"
                        value={piecesPerPack || ""}
                        onChange={(e) => setPiecesPerPack(parseInt(e.target.value) || undefined)}
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="pricePerUnit">
                      Harga per Unit <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="pricePerUnit"
                      type="number"
                      min="0"
                      value={pricePerUnit}
                      onChange={(e) =>
                        setPricePerUnit(parseFloat(e.target.value) || 0)
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Total Jumlah (Pcs)</Label>
                    <div className="p-2 border rounded-md bg-gray-50 dark:bg-white/5 dark:border-white/10">
                      {totalPieces}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Total Nilai</Label>
                    <div className="p-2 border rounded-md bg-gray-50 dark:bg-white/5 dark:border-white/10">
                      {formatCurrency(totalAmount)}
                    </div>
                  </div>
                </div>

                {productId && (
                  <div className="p-4 rounded-md bg-white/5 border">
                    <div className="font-medium text-blue-300 mb-2">
                      Informasi Stok
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <span className="text-sm text-gray-400">
                          Stok tersedia:
                        </span>
                        <p className="font-medium text-white">
                          {availableStock} pcs
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">
                          Stok setelah pengambilan:
                        </span>
                        <p
                          className={`font-medium ${
                            availableStock < totalPieces
                              ? "text-red-400"
                              : "text-green-400"
                          }`}>
                          {Math.max(0, availableStock - totalPieces)} pcs
                        </p>
                      </div>
                    </div>
                    {availableStock < totalPieces && (
                      <p className="text-red-400 text-sm mt-2">
                        Stok tidak mencukupi untuk permintaan ini!
                      </p>
                    )}
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCompleteStockOut}>
                    Selesai Input Stock Out
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isLoading || 
                      (productId && totalPieces > availableStock) ||
                      (showPacksPerBox && !packsPerBox) ||
                      (showPiecesPerPack && !piecesPerPack)
                    }>
                    {isLoading ? "Memproses..." : "Tambah Item"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}