// features/dashboard/warehouses/components/WarehouseSearchFilter.tsx
"use client";

import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface WarehouseSearchFilterProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  placeholder?: string;
}

export const WarehouseSearchFilter = ({
  searchQuery,
  onSearchQueryChange,
  placeholder = "Search warehouses..."
}: WarehouseSearchFilterProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};