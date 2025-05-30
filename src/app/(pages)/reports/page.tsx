"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BarChart, 
  LineChart, 
  ClipboardList, 
  MapPin, 
  Search,
  TrendingUp,
  FileText,
  ArrowRight,
  Activity,
  Database
} from "lucide-react";
import { motion } from "framer-motion";

interface Report {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  category: "inventory" | "analytics" | "documents" | "location";
  gradient: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const reports: Report[] = [
    {
      title: "Stok Saat Ini",
      description: "Laporan stok barang terkini di semua lokasi",
      icon: <BarChart className="h-6 w-6" />,
      path: "/reports/current-stock",
      category: "inventory",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "Histori Stok",
      description: "Laporan perubahan stok berdasarkan transaksi",
      icon: <LineChart className="h-6 w-6" />,
      path: "/reports/history",
      category: "analytics",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      title: "Laporan Bulanan",
      description: "Lihat dan generate laporan bulanan",
      icon: <ClipboardList className="h-6 w-6" />,
      path: "/reports/monthly",
      category: "documents",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      title: "Stok Berdasarkan Lokasi",
      description: "Lihat stok barang berdasarkan lokasi penyimpanan",
      icon: <MapPin className="h-6 w-6" />,
      path: "/reports/by-location",
      category: "location",
      gradient: "from-orange-500 to-red-500"
    },
  ];

  const categoryIcons = {
    inventory: <Database className="h-4 w-4" />,
    analytics: <TrendingUp className="h-4 w-4" />,
    documents: <FileText className="h-4 w-4" />,
    location: <MapPin className="h-4 w-4" />
  };

  const categoryColors = {
    inventory: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    analytics: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    documents: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    location: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Laporan Inventaris
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Akses berbagai laporan dan analisis data inventaris
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari laporan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>
        </motion.div>

        {/* Reports Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6"
        >
          {filteredReports.map((report, index) => (
            <motion.div key={index} variants={cardVariants}>
              <Card className="group relative overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-gray-200/20 dark:hover:shadow-gray-900/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                {/* Gradient Background */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${report.gradient}`} />
                
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${report.gradient} text-white shadow-lg`}>
                        {report.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2">
                          {report.title}
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {report.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className={categoryColors[report.category]}>
                      {categoryIcons[report.category]}
                      <span className="ml-1 capitalize">{report.category}</span>
                    </Badge>
                  </div>

                  <Button 
                    className="w-full group/btn bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => router.push(report.path)}
                  >
                    <span>Lihat Laporan</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results State */}
        {filteredReports.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Tidak ada laporan ditemukan
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Coba ubah kata kunci pencarian Anda
            </p>
          </motion.div>
        )}

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-8"
        >
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 dark:bg-blue-900/40 rounded-full">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Sistem Pelaporan
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Semua laporan menampilkan data terbaru dari sistem inventaris. 
                Klik pada laporan yang diinginkan untuk melihat detail lengkap.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}