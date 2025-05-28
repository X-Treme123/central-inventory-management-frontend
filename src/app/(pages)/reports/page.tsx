"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, LineChart, ClipboardList, MapPin } from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();

  const reports = [
    {
      title: "Stok Saat Ini",
      description: "Laporan stok barang terkini di semua lokasi",
      icon: <BarChart className="h-6 w-6" />,
      path: "/reports/current-stock",
    },
    {
      title: "Histori Stok",
      description: "Laporan perubahan stok berdasarkan transaksi",
      icon: <LineChart className="h-6 w-6" />,
      path: "/reports/history",
    },
    {
      title: "Laporan Bulanan",
      description: "Lihat dan generate laporan bulanan",
      icon: <ClipboardList className="h-6 w-6" />,
      path: "/reports/monthly",
    },
    {
      title: "Stok Berdasarkan Lokasi",
      description: "Lihat stok barang berdasarkan lokasi penyimpanan",
      icon: <MapPin className="h-6 w-6" />,
      path: "/reports/by-location",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Laporan Inventaris</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <Card key={index} className="hover:shadow-md transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">{report.icon}</div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full mt-2" 
                onClick={() => router.push(report.path)}
              >
                Lihat Laporan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}