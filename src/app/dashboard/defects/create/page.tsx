"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getAllStockIn,
  getStockInById,
  getAllUnits,
  reportDefect,
} from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";

export default function ReportDefectPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [stockInItems, setStockInItems] = useState([]);
  const [selectedStockIn, setSelectedStockIn] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const form = useForm({
    defaultValues: {
      stock_in_item_id: "",
      unit_id: "",
      quantity: 1,
      defect_type: "",
      defect_description: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        // Fetch completed stock ins
        const stockInResponse = await getAllStockIn(token);

        // Get completed stock ins with items
        if (stockInResponse?.data) {
          const completedStockIns = stockInResponse.data.filter(
            (si) => si.status === "completed"
          );

          // Fetch details for each completed stock in to get items
          const itemPromises = completedStockIns.map((si) =>
            getStockInById(token, si.id)
          );

          const itemResponses = await Promise.all(itemPromises);

          // Flatten all items from all stock ins
          const allItems = itemResponses
            .filter((res) => res?.data?.items)
            .flatMap((res) =>
              res.data.items.map((item) => ({
                ...item,
                stock_in_code: res.data.invoice_code,
                receipt_date: res.data.receipt_date,
              }))
            );

          setStockInItems(allItems);
        }

        // Fetch units
        const unitsResponse = await getAllUnits(token);
        if (unitsResponse?.data) {
          setUnits(unitsResponse.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const onSubmit = async (data) => {
    if (!token) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await reportDefect(token, {
        stock_in_item_id: data.stock_in_item_id,
        unit_id: data.unit_id,
        quantity: Number(data.quantity),
        defect_type: data.defect_type,
        defect_description: data.defect_description,
      });

      if (response && response.data) {
        router.push(`/dashboard/defects/${response.data.id}`);
      } else {
        throw new Error("Failed to report defect");
      }
    } catch (err) {
      console.error("Failed to report defect:", err);
      setError(err.message || "Failed to report defect. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStockInItemChange = (itemId) => {
    const selectedItem = stockInItems.find((item) => item.id === itemId);
    setSelectedStockIn(selectedItem);
    form.setValue("stock_in_item_id", itemId);

    // Default to the same unit as the stock in item
    if (selectedItem) {
      form.setValue("unit_id", selectedItem.unit_id);
    }
  };

  return (
    <div className="container p-4 mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Report Defect</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Report a defective item from your inventory
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Defect Report Form</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex items-center text-red-500 mb-4">
              <AlertTriangle className="mr-2 h-5 w-5" /> {error}
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6">
                <FormField
                  control={form.control}
                  name="stock_in_item_id"
                  rules={{ required: "Please select a product" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Product</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          handleStockInItemChange(value)
                        }
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {stockInItems.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.product_name} ({item.part_number}) -{" "}
                              {item.stock_in_code} (
                              {new Date(item.receipt_date).toLocaleDateString()}
                              )
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedStockIn && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                    <p>
                      <strong>Location:</strong>{" "}
                      {selectedStockIn.warehouse_name} /{" "}
                      {selectedStockIn.container_name} /{" "}
                      {selectedStockIn.rack_name}
                    </p>
                    <p>
                      <strong>Available Quantity:</strong>{" "}
                      {selectedStockIn.total_pieces} pieces
                    </p>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="unit_id"
                  rules={{ required: "Please select a unit" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.name} ({unit.abbreviation})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  rules={{
                    required: "Please enter quantity",
                    min: { value: 1, message: "Quantity must be at least 1" },
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Quantity must be a whole number",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defect_type"
                  rules={{ required: "Please enter defect type" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Defect Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select defect type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Damaged Packaging">
                            Damaged Packaging
                          </SelectItem>
                          <SelectItem value="Broken">Broken</SelectItem>
                          <SelectItem value="Missing Parts">
                            Missing Parts
                          </SelectItem>
                          <SelectItem value="Wrong Product">
                            Wrong Product
                          </SelectItem>
                          <SelectItem value="Expired">Expired</SelectItem>
                          <SelectItem value="Quality Issue">
                            Quality Issue
                          </SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defect_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the defect..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="mr-2">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      "Submit Report"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
