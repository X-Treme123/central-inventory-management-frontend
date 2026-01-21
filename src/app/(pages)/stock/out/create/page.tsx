// app/(pages)/stock/out/create/page.tsx - Simplified version
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
import { Badge } from "@/components/ui/badge";
import { createStockOut } from "@/lib/api/services";
import { 
  getAllUsers,
  type UserListItem 
} from "@/features/auth/api/index";
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
  Loader2,
  RefreshCw,
} from "lucide-react";

export default function CreateStockOutPage() {
  const { token } = useAuth();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState<CreateStockOutForm>({
    reference_number: "",
    department_id: "",
    requestor_name: "",
    notes: "",
  });

  // Selected user info for auto-populating department
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);

  // Master data from auth service
  const [users, setUsers] = useState<UserListItem[]>([]);

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadInitialData();
      generateReferenceNumber();
    }
  }, [token]);

  const loadInitialData = async () => {
    setIsLoadingData(true);
    try {
      // Load users data
      const usersRes = await getAllUsers(token!);

      // Set users
      if (usersRes.code === "200" && usersRes.data) {
        setUsers(usersRes.data);
      } else {
        throw new Error("Failed to load users");
      }

    } catch (err: any) {
      console.error("Error loading initial data:", err);
      setError(err.message || "Failed to load users data");
    } finally {
      setIsLoadingData(false);
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

    if (!formData.requestor_name.trim()) {
      setError("Please select a requestor");
      return;
    }

    if (!formData.department_id.trim()) {
      setError("Department is required (auto-filled when selecting user)");
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

  const handleUserSelect = (selectedUserId: string) => {
    const user = users.find(u => u.idlogin.toString() === selectedUserId);
    if (user) {
      setSelectedUser(user);
      // Auto-populate form with selected user's data
      setFormData(prev => ({
        ...prev,
        requestor_name: user.username,
        department_id: user.department,
      }));
    }
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  // Loading state
  if (isLoadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Loading Form Data</h3>
              <p className="text-gray-400">
                Fetching user information...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Create Stock Out Request</h1>
              <p className="text-gray-400">Create a new request for outgoing inventory</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isLoadingData}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingData ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/stock/out")}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
            </div>
          </div>

          {/* Process Indicator */}
          <div className="mt-4 flex items-center gap-2 text-sm bg-gray-800 p-3 rounded-lg">
            <Plus className="h-4 w-4 text-white" />
            <span className="text-white font-medium">Step 1 of 3: Create Request</span>
            <span className="text-white">→ Add Items → Complete</span>
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
            <p className="text-sm text-gray-400">
              Fill in the basic information for your stock out request
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Request Date (Auto-filled, Read-only) - First */}
              <div>
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Request Date
                </Label>
                <Input
                  value={new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  disabled
                  className="mt-1 bg-gray-800"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Request date is automatically set to today
                </p>
              </div>

              {/* Reference Number - Second with red asterisk */}
              <div>
                <Label htmlFor="reference_number" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Reference Number 
                  <span className="text-red-500 font-bold">*</span>
                </Label>
                <Input
                  id="reference_number"
                  value={formData.reference_number}
                  onChange={(e) => handleInputChange("reference_number", e.target.value)}
                  placeholder="SO-YYYYMMDD-HHMM"
                  required
                  className="mt-1 font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Unique identifier for this stock out request
                </p>
              </div>

              {/* Requestor Name and Department - Third (combined) */}
              <div>
                <Label htmlFor="requestor" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Requestor Name and Department
                  <span className="text-red-500 font-bold">*</span>
                </Label>
                
                <Select
                  value={selectedUser?.idlogin.toString() || ""}
                  onValueChange={handleUserSelect}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select requestor from user list" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.idlogin} value={user.idlogin.toString()}>
                        <div className="flex flex-col w-full">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{user.username}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {user.department}
                            </Badge>
                          </div>
                          <span className="text-xs text-gray-400">
                            {user.position} • {user.lokasi}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Display selected user info */}
                {selectedUser && (
                  <div className="mt-2 p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-white" />
                      <span className="text-white font-medium">Selected:</span>
                      <span className="text-white">
                        {selectedUser.username}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <Building className="h-4 w-4 text-white" />
                      <span className="text-white font-medium">Department:</span>
                      <span className="text-white">
                        {selectedUser.department}
                      </span>
                    </div>
                    <div className="text-xs text-white mt-1">
                      {selectedUser.position} • {selectedUser.lokasi}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-gray-400 mt-1">
                  Select a user from the list. Department will be automatically filled based on the selected user.
                </p>
              </div>

              {/* Notes - Fourth (Optional) */}
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
                <p className="text-xs text-gray-400 mt-1">
                  Optional notes or special instructions for this request
                </p>
              </div>

              {/* Form Summary */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium text-white mb-2">Request Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Reference:</p>
                    <p className="font-medium">{formData.reference_number || "Not set"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Requestor:</p>
                    <p className="font-medium">{formData.requestor_name || "Not selected"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Department:</p>
                    <p className="font-medium">{formData.department_id || "Not selected"}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Status:</p>
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
                      <Loader2 className="h-4 w-4 animate-spin" />
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
                <h4 className="font-medium text-gray-400 mb-2">What happens next?</h4>
                <div className="text-sm text-gray-400 space-y-1">
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