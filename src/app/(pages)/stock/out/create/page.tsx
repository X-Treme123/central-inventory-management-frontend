// app/stock/out/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { createStockOut } from "@/lib/api/services";
import { getAllDepartments } from "@/lib/api/services"; // Assuming this exists
import type { CreateStockOutForm } from "@/lib/api/types";
import {
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  Plus,
  Building,
  User,
  FileText,
  Calendar,
  MessageSquare,
} from "lucide-react";

interface Department {
  id: string;
  name: string;
  description?: string;
}

export default function CreateStockOutPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState<CreateStockOutForm>({
    reference_number: "",
    department_id: "",
    requestor_name: "",
    notes: "",
  });

  // Master data
  const [departments, setDepartments] = useState<Department[]>([]);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadDepartments();
      generateReferenceNumber();
      setDefaultRequestorName();
    }
  }, [token]);

  const loadDepartments = async () => {
    try {
      const response = await getAllDepartments(token!);
      
      if (response.code === "200" && response.data) {
        setDepartments(response.data);
      } else {
        setError("Failed to load departments");
      }
    } catch (err: any) {
      console.error("Error loading departments:", err);
      setError(err.message || "Failed to load departments");
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const generateReferenceNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const time = String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0");
    
    const referenceNumber = `SO-${year}${month}${day}-${time}`;
    setFormData(prev => ({ ...prev, reference_number: referenceNumber }));
  };

  const setDefaultRequestorName = () => {
    if (user?.username) {
      setFormData(prev => ({ ...prev, requestor_name: user.username }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError("Authentication required");
      return;
    }

    // Validation
    if (!formData.reference_number.trim()) {
      setError("Reference number is required");
      return;
    }

    if (!formData.department_id) {
      setError("Please select a department");
      return;
    }

    if (!formData.requestor_name.trim()) {
      setError("Requestor name is required");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await createStockOut(token, {
        reference_number: formData.reference_number,
        department_id: formData.department_id,
        requestor_name: formData.requestor_name,
        notes: formData.notes || undefined,
      });

      if (response.code === "201" && response.data) {
        // Redirect to the created stock out detail page
        router.push(`/stock/out/${response.data.id}`);
      } else {
        setError(response.message || "Failed to create stock out request");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create stock out request");
      console.error("Error creating stock out:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateStockOutForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Create Stock Out Request</h1>
              <p className="text-gray-600">Create a new request for outgoing inventory</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/stock/out")}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </div>

          {/* Process Indicator */}
          <div className="mt-4 flex items-center gap-2 text-sm bg-blue-50 p-3 rounded-lg">
            <Plus className="h-4 w-4 text-blue-600" />
            <span className="text-blue-800 font-medium">Step 1 of 3: Create Request</span>
            <span className="text-blue-600">→ Add Items → Complete</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Request Information
            </CardTitle>
            <p className="text-sm text-gray-600">
              Fill in the basic information for your stock out request
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reference Number */}
              <div>
                <Label htmlFor="reference_number" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Reference Number *
                </Label>
                <Input
                  id="reference_number"
                  value={formData.reference_number}
                  onChange={(e) => handleInputChange("reference_number", e.target.value)}
                  placeholder="SO-YYYYMMDD-HHMM"
                  required
                  className="mt-1 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unique identifier for this stock out request
                </p>
              </div>

              {/* Department Selection */}
              <div>
                <Label htmlFor="department" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Department *
                </Label>
                <Select
                  value={formData.department_id}
                  onValueChange={(value) => handleInputChange("department_id", value)}
                  disabled={isLoadingDepartments}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue 
                      placeholder={isLoadingDepartments ? "Loading departments..." : "Select department"} 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the department requesting these items
                </p>
              </div>

              {/* Requestor Name */}
              <div>
                <Label htmlFor="requestor_name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Requestor Name *
                </Label>
                <Input
                  onChange={(e) => handleInputChange("requestor_name", e.target.value)}
                  placeholder="Enter requestor name"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Name of the person requesting these items
                </p>
              </div>

              {/* Request Date (Auto-filled, Read-only) */}
              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Request Date
                </Label>
                <Input
                  value={new Date().toLocaleDateString()}
                  disabled
                  className="mt-1 bg-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Request date is automatically set to today
                </p>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Notes <span className="text-gray-400">(Optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Add any additional notes or special instructions..."
                  rows={3}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional notes or special instructions for this request
                </p>
              </div>

              {/* Form Summary */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Request Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Reference:</p>
                    <p className="font-medium">{formData.reference_number || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Department:</p>
                    <p className="font-medium">
                      {formData.department_id 
                        ? departments.find(d => d.id === formData.department_id)?.name || "Selected"
                        : "Not selected"
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Requestor:</p>
                    <p className="font-medium">{formData.requestor_name || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status:</p>
                    <p className="font-medium text-yellow-600">Pending</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/stock/out")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Creating Request...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Create Request
                    </>
                  )}
                </Button>
              </div>

              {/* Next Steps Info */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-2">What happens next?</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>1. Your request will be created with status "Pending"</p>
                  <p>2. You can then add items by scanning barcodes</p>
                  <p>3. Request needs approval before items can be dispensed</p>
                  <p>4. Once approved, items will be deducted from inventory</p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}