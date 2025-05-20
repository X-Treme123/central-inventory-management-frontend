// dashboard/stock-out/add-item/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  getAllProducts,
  getAllUnits,
  getCurrentStock,
  getUnitConversionsByProduct,
  getStockOutById,
  addStockOutItem,
} from "@/lib/api/services";
import { Product, Unit, CurrentStock, UnitConversion } from "@/lib/api/types";
import Cookies from "js-cookie";
import { CheckCircle2, AlertCircle, ChevronLeft, Plus } from "lucide-react";

export default function AddStockOutItemPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const { id } = useParams();

  // State untuk stock out header
  const [stockOutHeader, setStockOutHeader] = useState<any>(null);
  // State untuk form item
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

  // Mendapatkan token dari cookie saat komponen dimuat
  useEffect(() => {
    const storedToken = Cookies.get("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Mengambil data stock out dan data master saat token tersedia
  useEffect(() => {
    if (!token || !id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Ambil data stock out
        const stockOutResponse = await getStockOutById(token, id);
        if (stockOutResponse.data) {
          setStockOutHeader(stockOutResponse.data);

          // Cek apakah stock out masih pending
          if (stockOutResponse.data.status !== "pending") {
            setError(
              "Cannot add items to approved, completed, or rejected stock out requests"
            );
            setTimeout(() => {
              router.push(`/dashboard/stock-out/${id}`);
            }, 3000);
            return;
          }
        } else {
          throw new Error("Stock out not found");
        }

        // Ambil data master
        const [productsRes, unitsRes, currentStockRes] = await Promise.all([
          getAllProducts(token),
          getAllUnits(token),
          getCurrentStock(token),
        ]);

        setProducts(productsRes.data || []);
        setUnits(unitsRes.data || []);
        setCurrentStock(currentStockRes.data || []);
      } catch (err: any) {
        setError(err.message || "Error fetching data");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, id, router]);

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
      
      // Find conversion to piece
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

  // Handle submit form item
  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !id) {
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
      setError(null);
      setSuccessMessage(null);

      const requestData = {
        product_id: productId,
        unit_id: unitId,
        quantity,
        price_per_unit: pricePerUnit,
        packs_per_box: packsPerBox,
        pieces_per_pack: piecesPerPack
      };

      const response = await addStockOutItem(token, id as string, requestData);

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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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

  // Jika tidak ada stock out header atau statusnya bukan pending
  if (!stockOutHeader || stockOutHeader.status !== "pending") {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ||
              "Cannot add items to this stock out request. It may be approved, completed, or not found."}
          </AlertDescription>
        </Alert>
        <Button
          className="mt-4 gap-2"
          onClick={() => router.push(`/dashboard/stock-out/${id}`)}>
          <ChevronLeft size={16} />
          Back to Stock Out Details
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Add Item to Stock Out Request</h1>
          <p className="text-muted-foreground">
            {stockOutHeader.reference_number} - {stockOutHeader.department_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push(`/dashboard/stock-out/${id}`)}>
            <ChevronLeft size={16} />
            Back to Details
          </Button>
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
        <Alert className="mb-4 bg-green-900/20 border border-green-700 text-green-300">
          <CheckCircle2 className="h-4 w-4 text-green-300" />
          <AlertTitle>Sukses</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add Stock Out Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitItem} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">
                  Produk <span className="text-red-500">*</span>
                </Label>
                <Select value={productId} onValueChange={setProductId} required>
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
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
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
                onClick={() =>
                  router.push(`/dashboard/stock-out/${id}`)
                }>
                Kembali
              </Button>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={
                    isLoading || 
                    (productId && totalPieces > availableStock) || 
                    (showPacksPerBox && !packsPerBox) ||
                    (showPiecesPerPack && !piecesPerPack)
                  }
                  className="gap-2">
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Tambah Item
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}