// features/dashboard/suppliers/components/SupplierStats.tsx
"use client";

import { Building2, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Supplier } from "../api/types";

interface SupplierStatsProps {
  suppliers: Supplier[];
  loading?: boolean;
}

export const SupplierStats = ({ suppliers, loading = false }: SupplierStatsProps) => {
  const totalSuppliers = suppliers.length;
  const suppliersWithEmail = suppliers.filter((s) => s.email).length;
  const suppliersWithPhone = suppliers.filter((s) => s.phone).length;

  const stats = [
    {
      title: "Total Suppliers",
      value: totalSuppliers,
      icon: Building2,
      bgColor: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "With Email",
      value: suppliersWithEmail,
      icon: Mail,
      bgColor: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      title: "With Phone",
      value: suppliersWithPhone,
      icon: Phone,
      bgColor: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};