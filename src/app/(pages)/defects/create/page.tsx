// app/(pages)/defects/create/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getStockInItemsForDefect,
  getAllUnits,
  reportDefect,
  getDefectTypeOptions,
  calculateDefectPieces,
} from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type {
  StockInItemForDefect,
  CreateDefectForm,
  Unit,
} from "@/lib/api/types";
import {
  AlertTriangle,
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Calculator,
  FileText,
} from "lucide-react";

export default function ReportDefectPage() {
  const { token } = useAuth();
  const router = useRouter();

  // Data states
  const [stockInItems, setStockInItems] = useState<StockInItemForDefect[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedStockInItem, setSelectedStockInItem] = useState<StockInItemForDefect | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateDefectForm>({
    stock_in_item_id: "",
    unit_id: "",
    quantity: 1,
    defect_type: "",
    defect_description: "",
  });

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (token) {
      loadInitialData();
    }
  }, [token]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [stockInItemsRes, unitsRes] = await Promise.all([
        getStockInItemsForDefect(token!),
        getAllUnits(token!),
      ]);

      if (stockInItemsRes.code === "200" && stockInItemsRes.data) {
        setStockInItems(stockInItemsRes.data);
      } else {
        throw new Error("Failed to load stock in items");
      }

      if (unitsRes.code === "200" && unitsRes.data) {
        setUnits(unitsRes.data);
      } else {
        throw new Error("Failed to load units");
      }
    } catch (err: any) {
      console.error("Error loading initial data:", err);
      setError(err.message || "Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle stock in item selection
  const handleStockInItemChange = (itemId: string) => {
    const selectedItem = stockInItems.find((item) => item.id === itemId);
    setSelectedStockInItem(selectedItem || null);
    
    setFormData(prev => ({
      ...prev,
      stock_in_item_id: itemId,
      unit_id: selectedItem?.unit_id || "",
      quantity: 1,
    }));
  };

  // Handle form field changes
  const handleFormChange = (field: keyof CreateDefectForm, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate defect impact
  const calculateDefectImpact = () => {
    if (!selectedStockInItem || !formData.quantity) {
      return { defectPieces: 0, maxQuantity: 0 };
    }

    const selectedUnit = units.find(u => u.id === formData.unit_id);
    if (!selectedUnit) return { defectPieces: 0, maxQuantity: 0 };

    const defectPieces = calculateDefectPieces(
      formData.quantity,
      selectedUnit.name,
      selectedStockInItem.pieces_per_pack,
      selectedStockInItem.packs_per_box
    );

    // Calculate max quantity based on current stock
    const currentStock = selectedStockInItem.current_stock_pieces || 0;
    let maxQuantity = 0;

    const unitNameLower = selectedUnit.name.toLowerCase();
    if (unitNameLower.includes('box')) {
      maxQuantity = Math.floor(currentStock / (selectedStockInItem.pieces_per_pack * selectedStockInItem.packs_per_box));
    } else if (unitNameLower.includes('pack')) {
      maxQuantity = Math.floor(currentStock / selectedStockInItem.pieces_per_pack);
    } else {
      maxQuantity = currentStock;
    }

    return { defectPieces, maxQuantity };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError("Authentication required");
      return;
    }

    // Validation
    if (!formData.stock_in_item_id) {
      setError("Please select a product");
      return;
    }

    if (!formData.unit_id) {
      setError("Please select a unit");
      return;
    }

    if (!formData.quantity || formData.quantity <= 0) {
      setError("Please enter a valid quantity");
      return;
    }

    if (!formData.defect_type) {
      setError("Please select defect type");
      return;
    }

    const { defectPieces, maxQuantity } = calculateDefectImpact();
    if (formData.quantity > maxQuantity) {
      setError(`Quantity exceeds available stock. Maximum: ${maxQuantity}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await reportDefect(token, {
        stock_in_item_id: formData.stock_in_item_id,
        unit_id: formData.unit_id,
        quantity: formData.quantity,
        defect_type: formData.defect_type,
        defect_description: formData.defect_description || undefined,
      });

      if (response.code === "201" && response.data) {
        // Redirect to the created defect detail page
        router.push(`/defects/${response.data.id}`);
      } else {
        throw new Error(response.message || "Failed to report defect");
      }
    } catch (err: any) {
      setError(err.message || "Failed to report defect. Please try again.");
      console.error("Error reporting defect:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { defectPieces, maxQuantity } = calculateDefectImpact();
  const defectTypeOptions = getDefectTypeOptions();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/defects")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Defects
          </Button>
          <h1 className="text-3xl font-bold">Report Defect</h1>
          <p className="text-gray-600">Report defective items from completed stock ins</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3">Loading data...</span>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Defect Report Form
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Product Selection */}
                    <div>
                      <Label htmlFor="stock_in_item">Product from Stock In *</Label>
                      <Select
                        value={formData.stock_in_item_id}
                        onValueChange={handleStockInItemChange}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select a product from completed stock ins" />
                        </SelectTrigger>
                        <SelectContent>
                          {stockInItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {item.product_name} ({item.part_number})
                                </span>
                                <span className="text-sm text-gray-500">
                                  {item.invoice_code} • {new Date(item.receipt_date).toLocaleDateString()} • {item.supplier_name}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500 mt-1">
                        Only products from completed stock ins are shown
                      </p>
                    </div>

                    {/* Selected Product Info */}
                    {selectedStockInItem && (
                      <div className="p-4 bg-gray-800 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-white">
                          <Package className="h-4 w-4" />
                          <span className="font-medium">Selected Product Information</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-white">Product:</span> {selectedStockInItem.product_name}
                          </div>
                          <div>
                            <span className="text-white">Part Number:</span> {selectedStockInItem.part_number}
                          </div>
                          <div>
                            <span className="text-white">Original Quantity:</span> {selectedStockInItem.quantity} {selectedStockInItem.unit_name}
                          </div>
                          <div>
                            <span className="text-white">Current Stock:</span> {selectedStockInItem.current_stock_pieces || 0} pieces
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-3 w-3 text-white" />
                          <span className="text-white">Location:</span>
                          <span>{selectedStockInItem.warehouse_name} / {selectedStockInItem.container_name} / {selectedStockInItem.rack_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-3 w-3 text-white" />
                          <span className="text-white">Received:</span>
                          <span>{new Date(selectedStockInItem.receipt_date).toLocaleDateString()} ({selectedStockInItem.invoice_code})</span>
                        </div>
                      </div>
                    )}

                    {/* Unit Selection */}
                    {selectedStockInItem && (
                      <div>
                        <Label htmlFor="unit">Unit *</Label>
                        <Select
                          value={formData.unit_id}
                          onValueChange={(value) => handleFormChange("unit_id", value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select unit" />
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
                    )}

                    {/* Quantity */}
                    {selectedStockInItem && formData.unit_id && (
                      <div>
                        <Label htmlFor="quantity">Defect Quantity *</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max={maxQuantity}
                          value={formData.quantity}
                          onChange={(e) => handleFormChange("quantity", parseInt(e.target.value) || 1)}
                          className="mt-1"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum: {maxQuantity} {units.find(u => u.id === formData.unit_id)?.name}(s)
                        </p>
                      </div>
                    )}

                    {/* Defect Type */}
                    <div>
                      <Label htmlFor="defect_type">Defect Type *</Label>
                      <Select
                        value={formData.defect_type}
                        onValueChange={(value) => handleFormChange("defect_type", value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select defect type" />
                        </SelectTrigger>
                        <SelectContent>
                          {defectTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description">Description <span className="text-gray-400">(Optional)</span></Label>
                      <Textarea
                        id="description"
                        value={formData.defect_description}
                        onChange={(e) => handleFormChange("defect_description", e.target.value)}
                        placeholder="Describe the defect in detail..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/defects")}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting || !selectedStockInItem}
                        className="gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4" />
                            Report Defect
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Impact Calculator */}
            <div>
              {selectedStockInItem && formData.unit_id && formData.quantity > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Defect Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Defect Quantity:</span>
                        <span className="font-medium">
                          {formData.quantity} {units.find(u => u.id === formData.unit_id)?.name}(s)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Pieces Affected:</span>
                        <span className="font-medium text-red-600">
                          {defectPieces.toLocaleString()} pieces
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Stock:</span>
                        <span className="font-medium">
                          {(selectedStockInItem.current_stock_pieces || 0).toLocaleString()} pieces
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Remaining After Defect:</span>
                        <span className="font-medium">
                          {((selectedStockInItem.current_stock_pieces || 0) - defectPieces).toLocaleString()} pieces
                        </span>
                      </div>
                    </div>

                    {/* Unit Conversion Info */}
                    <div className="border-t pt-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Unit Conversion</h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p>1 Pack = {selectedStockInItem.pieces_per_pack} pieces</p>
                        <p>1 Box = {selectedStockInItem.packs_per_box} packs = {selectedStockInItem.pieces_per_pack * selectedStockInItem.packs_per_box} pieces</p>
                      </div>
                    </div>

                    {/* Validation Warning */}
                    {formData.quantity > maxQuantity && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          Quantity exceeds available stock! Maximum: {maxQuantity}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Instructions */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Instructions</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>1. Select a product from completed stock ins</p>
                  <p>2. Choose the unit type for reporting defects</p>
                  <p>3. Enter the quantity of defective items</p>
                  <p>4. Specify the type and description of defect</p>
                  <p>5. Submit to record the defect and update inventory</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}