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
  getAllSuppliers,
  getAllProducts,
  getAllUnits,
  getAllWarehouses,
  getContainersByWarehouse,
  getRacksByContainer,
  getUnitConversionsByProduct,
  createStockIn,
  addStockInItem,
} from "@/lib/api/services";
import {
  Supplier,
  Product,
  Unit,
  Warehouse,
  Container,
  Rack,
  UnitConversion,
} from "@/lib/api/types";
import Cookies from "js-cookie";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function CreateStockInPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  // State untuk form header
  const [invoiceCode, setInvoiceCode] = useState("");
  const [packingList, setPackingList] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [receiptDate, setReceiptDate] = useState("");
  const [notes, setNotes] = useState("");

  // State untuk form item
  const [stockInId, setStockInId] = useState<string | null>(null);
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
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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
        const [suppliersRes, productsRes, unitsRes, warehousesRes] =
          await Promise.all([
            getAllSuppliers(token),
            getAllProducts(token),
            getAllUnits(token),
            getAllWarehouses(token),
          ]);

        setSuppliers(suppliersRes.data || []);
        setProducts(productsRes.data || []);
        setUnits(unitsRes.data || []);
        setWarehouses(warehousesRes.data || []);
      } catch (err: any) {
        setError(err.message || "Error fetching master data");
        console.error("Error fetching master data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMasterData();
  }, [token]);

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

  // Handle submit form header
  const handleSubmitHeader = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Token tidak ditemukan. Silakan login kembali.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await createStockIn(token, {
        invoice_code: invoiceCode,
        packing_list_number: packingList,
        supplier_id: supplierId,
        receipt_date: receiptDate,
        notes,
      });

      if (response.data && response.data.id) {
        setStockInId(response.data.id);
        setHeaderCreated(true);
        setSuccessMessage(
          "Stock In header berhasil dibuat. Silakan tambahkan item."
        );
      } else {
        setError("Gagal membuat Stock In header. Respons tidak valid.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal membuat Stock In header");
      console.error("Error creating Stock In header:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submit form item
  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !stockInId) {
      setError("Token atau Stock In ID tidak ditemukan");
      return;
    }

    try {
      setIsLoading(true);

      const response = await addStockInItem(token, stockInId, {
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

  // Handle complete stock in
  const handleCompleteStockIn = () => {
    router.push(`/dashboard/stock-in`);
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
      <h1 className="text-3xl font-bold">Tambah Stock In Baru</h1>

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

      {!headerCreated ? (
        // Form untuk Stock In Header
        <Card>
          <CardHeader>
            <CardTitle>Informasi Stock In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitHeader} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceCode">
                    Nomor Invoice <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="invoiceCode"
                    value={invoiceCode}
                    onChange={(e) => setInvoiceCode(e.target.value)}
                    placeholder="INV-20240518-001"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="packingList">Nomor Packing List</Label>
                  <Input
                    id="packingList"
                    value={packingList}
                    onChange={(e) => setPackingList(e.target.value)}
                    placeholder="PL-20240518-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier">
                    Supplier <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={supplierId}
                    onValueChange={setSupplierId}
                    required>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptDate">
                    Tanggal Penerimaan <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="receiptDate"
                    type="date"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Catatan</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan tambahan tentang penerimaan barang"
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
        // Form untuk Stock In Item
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tambah Item Stock In</CardTitle>
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
                      onChange={(e) =>
                        setQuantity(parseInt(e.target.value) || 0)
                      }
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
                    onClick={handleCompleteStockIn}>
                    Selesai Input Stock In
                  </Button>
                  <Button type="submit" disabled={isLoading}>
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
