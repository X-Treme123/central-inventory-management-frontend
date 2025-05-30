"use client";

import { useEffect, useState } from "react";
import {
  getStockByLocation,
} from "@/lib/api/services";
import { getAllWarehouses, getContainersByWarehouse, getRacksByContainer, Warehouses, Container, Rack } from "@/features/pages/warehouses/api";
import { CurrentStock } from "@/lib/api/types";
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
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Filter, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StockByLocationPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [stocks, setStocks] = useState<CurrentStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<Warehouses[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [racks, setRacks] = useState<Rack[]>([]);
  const [warehouseId, setWarehouseId] = useState<string>("all");
  const [containerId, setContainerId] = useState<string>("all");
  const [rackId, setRackId] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchWarehouses();
      fetchStockByLocation();
    }
  }, [token]);

  useEffect(() => {
    if (token && warehouseId && warehouseId !== "all") {
      fetchContainers(warehouseId);
      setContainerId("all");
      setRackId("all");
    }
  }, [token, warehouseId]);

  useEffect(() => {
    if (token && containerId && containerId !== "all") {
      fetchRacks(containerId);
      setRackId("all");
    }
  }, [token, containerId]);

  const fetchWarehouses = async () => {
    try {
      const response = await getAllWarehouses(token!);
      if (response.data) {
        setWarehouses(response.data);
      }
    } catch (err) {
      console.error("Error fetching warehouses:", err);
    }
  };

  const fetchContainers = async (warehouseId: string) => {
    try {
      const response = await getContainersByWarehouse(token!, warehouseId);
      if (response.data) {
        setContainers(response.data);
      }
    } catch (err) {
      console.error("Error fetching containers:", err);
    }
  };

  const fetchRacks = async (containerId: string) => {
    try {
      const response = await getRacksByContainer(token!, containerId);
      if (response.data) {
        setRacks(response.data);
      }
    } catch (err) {
      console.error("Error fetching racks:", err);
    }
  };

  const fetchStockByLocation = async () => {
    try {
      setLoading(true);
      const response = await getStockByLocation(token!, {
        warehouseId: warehouseId === "all" ? undefined : warehouseId,
        containerId: containerId === "all" ? undefined : containerId,
        rackId: rackId === "all" ? undefined : rackId,
      });
      if (response.data) {
        setStocks(response.data);
      }
    } catch (err) {
      setError("Gagal memuat data stok berdasarkan lokasi.");
      console.error("Error fetching stock by location:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    fetchStockByLocation();
  };

  const resetFilters = () => {
    setWarehouseId("all");
    setContainerId("all");
    setRackId("all");
    // Fetch all stock without filters
    fetchStockByLocation();
  };

  const exportToCSV = () => {
    // Data to be exported
    const data = stocks.map((stock) => ({
      "Part Number": stock.part_number || "",
      "Nama Produk": stock.product_name || "",
      Kategori: stock.category_name || "",
      Warehouse: stock.warehouse_name || "",
      Container: stock.container_name || "",
      Rack: stock.rack_name || "",
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
      `stock_by_location_${new Date().toLocaleDateString()}.csv`
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
          <h1 className="text-2xl font-bold">
            Laporan Stok Berdasarkan Lokasi
          </h1>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Filter Lokasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Warehouse</label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Warehouse</SelectItem>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Container</label>
              <Select
                value={containerId}
                onValueChange={setContainerId}
                disabled={!warehouseId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      warehouseId
                        ? "Semua Container"
                        : "Pilih Warehouse Terlebih Dahulu"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {warehouseId && (
                    <SelectItem value="all">Semua Container</SelectItem>
                  )}
                  {containers.map((container) => (
                    <SelectItem key={container.id} value={container.id}>
                      {container.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Rack</label>
              <Select
                value={rackId}
                onValueChange={setRackId}
                disabled={!containerId}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      containerId
                        ? "Semua Rack"
                        : "Pilih Container Terlebih Dahulu"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {containerId && <SelectItem value="all">Semua Rack</SelectItem>}
                  {racks.map((rack) => (
                    <SelectItem key={rack.id} value={rack.id}>
                      {rack.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          <CardTitle>
            Daftar Stok
            {warehouseId &&
              warehouses.find((w) => w.id === warehouseId) &&
              ` di ${warehouses.find((w) => w.id === warehouseId)?.name}`}
            {containerId &&
              containers.find((c) => c.id === containerId) &&
              ` - ${containers.find((c) => c.id === containerId)?.name}`}
            {rackId &&
              racks.find((r) => r.id === rackId) &&
              ` - ${racks.find((r) => r.id === rackId)?.name}`}
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
          ) : stocks.length === 0 ? (
            <div className="flex justify-center items-center h-48">
              <p>Tidak ada data stok di lokasi yang dipilih.</p>
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
                  {stocks.map((stock) => (
                    <TableRow key={stock.id}>
                      <TableCell>{stock.part_number}</TableCell>
                      <TableCell>{stock.product_name}</TableCell>
                      <TableCell>{stock.category_name}</TableCell>
                      <TableCell>{stock.warehouse_name}</TableCell>
                      <TableCell>{stock.container_name}</TableCell>
                      <TableCell>{stock.rack_name}</TableCell>
                      <TableCell className="text-right">
                        {stock.total_pieces.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        Rp {stock.total_amount.toLocaleString("id-ID")}
                      </TableCell>
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
