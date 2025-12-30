// features/dashboard/suppliers/components/SupplierSearchFilter.tsx
"use client";

import { Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SupplierSearchFilterProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  placeholder?: string;
  onMoreFilters?: () => void;
}

export const SupplierSearchFilter = ({
  searchQuery,
  onSearchQueryChange,
  placeholder = "Search suppliers...",
  onMoreFilters
}: SupplierSearchFilterProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              className="w-full pl-10"
              type="search"
            />
          </div>

          <div className="flex justify-end gap-2">
            {onMoreFilters && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={onMoreFilters}
              >
                <Filter size={14} />
                More Filters
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};