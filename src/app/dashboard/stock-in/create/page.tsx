// app/dashboard/stock-in/create/page.tsx - Simplified untuk barcode scanning workflow
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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
import { getAllSuppliers, createStockIn } from "@/lib/api/services";
import type { Supplier } from "@/lib/api/types";
import { CheckCircle2, AlertCircle, Package, ArrowRight } from "lucide-react";

export default function CreateStockInPage() {
  const { token } = useAuth();
  const router = useRouter();

  // Simplified form state - removed notes as discussed
  const [formData, setFormData] = useState({
    invoice_code: "",
    packing_list_number: "",
    supplier_id: "",
    receipt_date: new Date().toISOString().split('T')[0], // Default to today
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadSuppliers();
    }
  }, [token]);

  const loadSuppliers = async () => {
    try {
      const response = await getAllSuppliers(token!);
      if (response.code === "200" && response.data) {
        setSuppliers(response.data);
      }
    } catch (err: any) {
      setError("Failed to load suppliers");
      console.error("Error loading suppliers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError("Authentication required. Please login again.");
      return;
    }

    // Validation
    if (!formData.invoice_code || !formData.supplier_id || !formData.receipt_date) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await createStockIn(token, {
        invoice_code: formData.invoice_code,
        packing_list_number: formData.packing_list_number || undefined,
        supplier_id: formData.supplier_id,
        receipt_date: formData.receipt_date,
      });

      if (response.code === "201" && response.data) {
        setSuccessMessage("Stock In created successfully! Redirecting to barcode scanning...");
        
        // Redirect ke halaman add item untuk mulai scan barcode
        // Ini adalah workflow baru: buat header → langsung scan items
        setTimeout(() => {
          router.push(`/dashboard/stock-in/add-item/${response.data!.id}`);
        }, 1500);
      } else {
        setError(response.message || "Failed to create Stock In");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create Stock In");
      console.error("Error creating Stock In:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header dengan penjelasan workflow baru */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Stock In</h1>
          <p className="text-gray-600">
            Create stock in header first, then scan items using barcode scanner
          </p>
          
          {/* Workflow indicator */}
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            <Package className="h-4 w-4" />
            <span>Step 1: Create Header</span>
            <ArrowRight className="h-4 w-4" />
            <span>Step 2: Scan Items</span>
            <ArrowRight className="h-4 w-4" />
            <span>Step 3: Complete</span>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Success</AlertTitle>
            <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Simplified Stock In Form */}
        <Card>
          <CardHeader>
            <CardTitle>Stock In Information</CardTitle>
            <p className="text-sm text-gray-600">
              Enter basic receipt information. Item details will be added by scanning.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Invoice Code - Required */}
                <div>
                  <Label htmlFor="invoice_code">
                    Invoice Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="invoice_code"
                    value={formData.invoice_code}
                    onChange={(e) => setFormData({ ...formData, invoice_code: e.target.value })}
                    placeholder="e.g., INV-2025-001"
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Unique invoice number from supplier
                  </p>
                </div>

                {/* Packing List - Optional */}
                <div>
                  <Label htmlFor="packing_list">Packing List Number</Label>
                  <Input
                    id="packing_list"
                    value={formData.packing_list_number}
                    onChange={(e) => setFormData({ ...formData, packing_list_number: e.target.value })}
                    placeholder="e.g., PL-2025-001"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional packing list reference
                  </p>
                </div>

                {/* Supplier Selection - Required */}
                <div>
                  <Label htmlFor="supplier">
                    Supplier <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.supplier_id}
                    onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          <div>
                            <div className="font-medium">{supplier.name}</div>
                            {supplier.contact_person && (
                              <div className="text-sm text-gray-500">{supplier.contact_person}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose the supplier for this receipt
                  </p>
                </div>

                {/* Receipt Date - Required */}
                <div>
                  <Label htmlFor="receipt_date">
                    Receipt Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="receipt_date"
                    type="date"
                    value={formData.receipt_date}
                    onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })}
                    required
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Date when goods were received
                  </p>
                </div>
              </div>

              {/* Information Box - Menjelaskan next step */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">What happens next?</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>• After creating this header, you'll be redirected to the item scanning page</p>
                  <p>• Use your iWare barcode scanner to scan product barcodes</p>
                  <p>• System will automatically detect product and unit type</p>
                  <p>• Enter quantities and storage locations for each scanned item</p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/stock-in")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      Create & Continue to Scanning
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p><strong>Scanner not working?</strong> Make sure your iWare scanner is connected and configured properly.</p>
            <p><strong>Product not found?</strong> Register the product first in the Products section before scanning.</p>
            <p><strong>Wrong supplier?</strong> You can cancel and create a new stock in with the correct supplier.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}