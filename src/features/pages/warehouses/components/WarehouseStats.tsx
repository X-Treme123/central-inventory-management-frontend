// features/dashboard/warehouses/components/WarehouseStats.tsx
"use client";

import { Warehouse, Package, BarChart3, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WarehouseStatsProps {
  totalWarehouses: number;
  totalContainers: number;
  totalRacks: number;
  averageUtilization?: string;
}

export const WarehouseStats = ({
  totalWarehouses,
  totalContainers,
  totalRacks,
  averageUtilization = "--"
}: WarehouseStatsProps) => {
  const stats = [
    {
      title: "Total Warehouses",
      value: totalWarehouses,
      icon: Warehouse,
      bgColor: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Containers",
      value: totalContainers,
      icon: Package,
      bgColor: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      title: "Racks",
      value: totalRacks,
      icon: BarChart3,
      bgColor: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Average Utilization",
      value: averageUtilization,
      icon: AlertTriangle,
      bgColor: "bg-orange-100 dark:bg-orange-900",
      iconColor: "text-orange-600 dark:text-orange-400"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};