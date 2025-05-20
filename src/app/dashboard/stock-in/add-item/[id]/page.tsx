"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  getAllWarehouses,
  getContainersByWarehouse,
  getRacksByContainer,
  getUnitConversionsByProduct,
  getStockInById,
  addStockInItem,
} from "@/lib/api/services";
import {
  Product,
  Unit,
  Warehouse,
  Container,
  Rack,
  UnitConversion,
} from "@/lib/api/types";
import Cookies from "js-cookie";
import { CheckCircle2, AlertCircle, ChevronLeft, Plus } from "lucide-react";

export default function AddStockInItemPage() {
  const router = useRouter();
  const { id } = useParams();

  const [token, setToken] = useState<string | null>(null);

  // State untuk stock in header
  const [stockInHeader, setStockInHeader] = useState<any>(null);

  // State untuk form item
  const [productId, setProductId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [packsPerBox, setPacksPerBox] = useState<number | null>(null);
  const [piecesPerPack, setPiecesPerPack] = useState<number | null>(null);
  const [totalPieces, setTotalPieces] = useState<number>(0);
  const [pricePerUnit, setPricePerUnit] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [warehouseId, setWarehouseId] = useState("");
  const [containerId, setContainerId] = useState("");
  const [rackId, setRackId] = useState("");

  // Data dari API
  const [products, setProducts] = useState<Product[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
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

  // Mengambil data stock in dan data master saat token tersedia
  useEffect(() => {
    if (!token || !id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Ambil data stock in
        const stockInResponse = await getStockInById(token, id);
        if (stockInResponse.data) {
          setStockInHeader(stockInResponse.data);

          // Cek apakah stock in masih pending
          if (stockInResponse.data.status !== "pending") {
            setError("Cannot add items to completed or rejected stock in");
            setTimeout(() => {
              router.push(`/dashboard/stock-in/${id}`);
            }, 3000);
            return;
          }
        } else {
          throw new Error("Stock in not found");
        }

        // Ambil data master
        const [productsRes, unitsRes, warehousesRes] = await Promise.all([
          getAllProducts(token),
          getAllUnits(token),
          getAllWarehouses(token),
        ]);

        setProducts(productsRes.data || []);
        setUnits(unitsRes.data || []);
        setWarehouses(warehousesRes.data || []);
      } catch (err: any) {
        setError(err.message || "Error fetching data");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, id, router]);

  // Mengambil container saat warehouse dipilih
  useEffect(() => {
    if (!token || !warehouseId) return;

    const fetchContainers = async () => {
      try {
        const containersRes = await getContainersByWarehouse(
          token,
          warehouseId
        );
        setContainers(containersRes.data || []);
        setContainerId("");
        setRackId("");
      } catch (err: any) {
        console.error("Error fetching containers:", err);
      }
    };

    fetchContainers();
  }, [token, warehouseId]);

  // Mengambil rack saat container dipilih
  useEffect(() => {
    if (!token || !containerId) return;

    const fetchRacks = async () => {
      try {
        const racksRes = await getRacksByContainer(token, containerId);
        setRacks(racksRes.data || []);
        setRackId("");
      } catch (err: any) {
        console.error("Error fetching racks:", err);
      }
    };

    fetchRacks();
  }, [token, containerId]);

  // Mengambil konversi unit saat produk dipilih
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

        // Mendapatkan konversi unit untuk produk
        const conversionsRes = await getUnitConversionsByProduct(
          token,
          productId
        );
        setUnitConversions(conversionsRes.data || []);

        // Reset unit-specific fields
        setPacksPerBox(null);
        setPiecesPerPack(null);
        setTotalPieces(0);

        // Set default price if product available
        if (product) {
          setPricePerUnit(product.price);
        }
      } catch (err: any) {
        console.error("Error fetching product details:", err);
      }
    };

    fetchProductDetails();
  }, [token, productId, products]);

  // Update current unit when unit is selected
  useEffect(() => {
    if (unitId) {
      const unit = units.find((u) => u.id === unitId) || null;
      setCurrentUnit(unit);
    } else {
      setCurrentUnit(null);
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

    // Calculate based on unit type
    if (
      currentUnit.name.toLowerCase() === "piece" ||
      currentUnit.abbreviation.toLowerCase() === "pcs"
    ) {
      // If unit is piece, total is just quantity
      totalPcs = quantity;
    } else if (
      currentUnit.name.toLowerCase() === "pack" ||
      currentUnit.abbreviation.toLowerCase() === "pack"
    ) {
      // If unit is pack, multiply by pieces per pack
      if (piecesPerPack) {
        totalPcs = quantity * piecesPerPack;
      }
    } else if (
      currentUnit.name.toLowerCase() === "box" ||
      currentUnit.abbreviation.toLowerCase() === "box"
    ) {
      // If unit is box, multiply by packs per box and pieces per pack
      if (packsPerBox && piecesPerPack) {
        totalPcs = quantity * packsPerBox * piecesPerPack;
      }
    }

    setTotalPieces(totalPcs);

    // Calculate total amount
    setTotalAmount(quantity * pricePerUnit);
  }, [
    quantity,
    packsPerBox,
    piecesPerPack,
    pricePerUnit,
    currentProduct,
    currentUnit,
  ]);

  // Handle submit form item
  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !id) {
      setError("Token atau Stock In ID tidak ditemukan");
      return;
    }

    try {
      setIsLoading(true);

      const response = await addStockInItem(token, id, {
        product_id: productId,
        unit_id: unitId,
        quantity,
        packs_per_box: packsPerBox,
        pieces_per_pack: piecesPerPack,
        price_per_unit: pricePerUnit,
        warehouse_id: warehouseId,
        container_id: containerId,
        rack_id: rackId,
      });

      if (response && response.data) {
        setSuccessMessage("Item berhasil ditambahkan ke Stock In");

        // Reset form item
        setProductId("");
        setUnitId("");
        setQuantity(1);
        setPacksPerBox(null);
        setPiecesPerPack(null);
        setTotalPieces(0);
        setPricePerUnit(0);
        setTotalAmount(0);
        setWarehouseId("");
        setContainerId("");
        setRackId("");
      } else {
        setError("Gagal menambahkan item. Respons tidak valid.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal menambahkan item");
      console.error("Error adding Stock In item:", err);
    } finally {
      setIsLoading(false);
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

  // Jika tidak ada stock in header atau statusnya bukan pending
  if (!stockInHeader || stockInHeader.status !== "pending") {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ||
              "Cannot add items to this stock in. It may be completed or not found."}
          </AlertDescription>
        </Alert>
        <Button
          className="mt-4 gap-2"
          onClick={() => router.push(`/dashboard/stock-in/${id}`)}>
          <ChevronLeft size={16} />
          Back to Stock In Details
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Add Item to Stock In</h1>
          <p className="text-muted-foreground">
            {stockInHeader.invoice_code} - {stockInHeader.supplier_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.push(`/dashboard/stock-in/${id}`)}>
            <ChevronLeft size={16} />
            Back to Details
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
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
          <CardTitle>Add Stock In Item</CardTitle>
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
                <Select value={unitId} onValueChange={setUnitId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih satuan" />
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

              {/* Unit conversion fields - conditionally show based on selected unit */}
              {currentUnit &&
                (currentUnit.name.toLowerCase() === "box" ||
                  currentUnit.abbreviation.toLowerCase() === "box") && (
                  <div className="space-y-2">
                    <Label htmlFor="packsPerBox">
                      Jumlah Pack per Dus{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="packsPerBox"
                      type="number"
                      min="1"
                      value={packsPerBox || ""}
                      onChange={(e) =>
                        setPacksPerBox(parseInt(e.target.value) || null)
                      }
                      required
                    />
                  </div>
                )}

              {currentUnit &&
                (currentUnit.name.toLowerCase() === "pack" ||
                  currentUnit.abbreviation.toLowerCase() === "pack" ||
                  currentUnit.name.toLowerCase() === "box" ||
                  currentUnit.abbreviation.toLowerCase() === "box") && (
                  <div className="space-y-2">
                    <Label htmlFor="piecesPerPack">
                      Jumlah Pcs per Pack{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="piecesPerPack"
                      type="number"
                      min="1"
                      value={piecesPerPack || ""}
                      onChange={(e) =>
                        setPiecesPerPack(parseInt(e.target.value) || null)
                      }
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
                <div className="p-2 border rounded-md bg-gray-700">
                  {totalPieces}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Total Nilai</Label>
                <div className="p-2 border rounded-md bg-gray-700">
                  Rp {totalAmount.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="font-medium">Lokasi Penyimpanan</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouse">
                    Gudang <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={warehouseId}
                    onValueChange={setWarehouseId}
                    required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih gudang" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="container">
                    Container <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={containerId}
                    onValueChange={setContainerId}
                    required
                    disabled={!warehouseId}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          warehouseId
                            ? "Pilih container"
                            : "Pilih gudang terlebih dahulu"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {containers.map((container) => (
                        <SelectItem key={container.id} value={container.id}>
                          {container.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rack">
                    Rack <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={rackId}
                    onValueChange={setRackId}
                    required
                    disabled={!containerId}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          containerId
                            ? "Pilih rack"
                            : "Pilih container terlebih dahulu"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {racks.map((rack) => (
                        <SelectItem key={rack.id} value={rack.id}>
                          {rack.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/stock-in/${id}`)}>
                Kembali
              </Button>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="gap-2">
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
