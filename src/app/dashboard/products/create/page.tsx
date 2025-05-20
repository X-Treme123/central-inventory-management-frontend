// app/dashboard/products/create/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useApi } from "@/lib/hooks/useApi";
import {
  createProduct,
  getAllCategories,
  getAllUnits,
  createUnitConversion,
} from "@/lib/api/services";
import { Category, Unit } from "@/lib/api/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface FormData {
  part_number: string;
  name: string;
  description: string;
  category_id: string;
  base_unit_id: string;
  price: string;
}

interface ConversionData {
  from_unit_id: string;
  to_unit_id: string;
  conversion_factor: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    part_number: "",
    name: "",
    description: "",
    category_id: "",
    base_unit_id: "",
    price: "",
  });

  const [conversions, setConversions] = useState<ConversionData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch categories and units
  const { data: categories } = useApi<Category[]>({
    fetchFn: (token) => getAllCategories(token).then((res) => res.data || []),
    deps: [],
  });

  const { data: units } = useApi<Unit[]>({
    fetchFn: (token) => getAllUnits(token).then((res) => res.data || []),
    deps: [],
  });

  // Add a new conversion field
  const addConversion = () => {
    setConversions([
      ...conversions,
      { from_unit_id: "", to_unit_id: "", conversion_factor: "" },
    ]);
  };

  // Remove a conversion field
  const removeConversion = (index: number) => {
    const updatedConversions = [...conversions];
    updatedConversions.splice(index, 1);
    setConversions(updatedConversions);
  };

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle conversion field changes
  const handleConversionChange = (
    index: number,
    field: keyof ConversionData,
    value: string
  ) => {
    const updatedConversions = [...conversions];
    updatedConversions[index] = {
      ...updatedConversions[index],
      [field]: value,
    };
    setConversions(updatedConversions);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (
        !formData.part_number ||
        !formData.name ||
        !formData.category_id ||
        !formData.base_unit_id ||
        !formData.price
      ) {
        throw new Error("Mohon isi semua kolom wajib.");
      }

      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error("Harga harus berupa angka positif.");
      }

      const createdProduct = await createProduct(token || "", {
        part_number: formData.part_number,
        name: formData.name,
        description: formData.description,
        category_id: formData.category_id,
        base_unit_id: formData.base_unit_id,
        price: price,
      });

      if (createdProduct.data?.id) {
        const productId = createdProduct.data.id;

        for (const conversion of conversions) {
          if (
            conversion.from_unit_id &&
            conversion.to_unit_id &&
            conversion.conversion_factor
          ) {
            const factor = parseInt(conversion.conversion_factor);
            if (isNaN(factor) || factor <= 0) continue;

            await createUnitConversion(token || "", {
              product_id: productId,
              from_unit_id: conversion.from_unit_id,
              to_unit_id: conversion.to_unit_id,
              conversion_factor: factor,
            });
          }
        }

        setSuccessMessage("🎉 Produk berhasil ditambahkan!");
        setFormData({
          part_number: "",
          name: "",
          description: "",
          category_id: "",
          base_unit_id: "",
          price: "",
        });
        setConversions([]);

        setTimeout(() => {
          router.push("/dashboard/products");
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Gagal menambahkan produk.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/products">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Create Product
            </h2>
            <p className="text-muted-foreground">
              Add a new product to your inventory
            </p>
          </div>
        </div>
      </div>

      <Card className="p-6">
        {error && (
          <Alert className="mb-6 bg-red-50 text-red-800 border border-red-200">
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-50 text-green-800 border border-green-200">
            {successMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                name="part_number"
                value={formData.part_number}
                onChange={handleChange}
                placeholder="ATK-001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category_id: value }))
                }
                required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_unit_id">
                Base Unit <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.base_unit_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, base_unit_id: value }))
                }
                required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih base unit" />
                </SelectTrigger>
                <SelectContent>
                  {units?.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.name} ({unit.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                The smallest countable unit (usually piece)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  Rp
                </span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="pl-8"
                  required
                />
              </div>
            </div>
          </div>

          {/* Unit Conversions Section */}
          {/* <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Unit Conversions</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addConversion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Conversion
              </Button>
            </div>

            {conversions.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">
                Add unit conversions to help with stock calculations (e.g., 1
                box = 10 pieces)
              </p>
            ) : (
              <div className="space-y-4">
                {conversions.map((conversion, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border p-4 rounded-md bg-gray-50">
                    <div className="md:col-span-5 space-y-2">
                      <Label htmlFor={`from_unit_${index}`}>From Unit</Label>
                      <select
                        id={`from_unit_${index}`}
                        value={conversion.from_unit_id}
                        onChange={(e) =>
                          handleConversionChange(
                            index,
                            "from_unit_id",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        required>
                        <option value="">Select unit</option>
                        {units?.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name} ({unit.abbreviation})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-5 space-y-2">
                      <Label htmlFor={`to_unit_${index}`}>To Unit</Label>
                      <select
                        id={`to_unit_${index}`}
                        value={conversion.to_unit_id}
                        onChange={(e) =>
                          handleConversionChange(
                            index,
                            "to_unit_id",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        required>
                        <option value="">Select unit</option>
                        {units?.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name} ({unit.abbreviation})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-1 space-y-2">
                      <Label htmlFor={`conversion_factor_${index}`}>
                        Factor
                      </Label>
                      <Input
                        id={`conversion_factor_${index}`}
                        type="number"
                        value={conversion.conversion_factor}
                        onChange={(e) =>
                          handleConversionChange(
                            index,
                            "conversion_factor",
                            e.target.value
                          )
                        }
                        placeholder="1"
                        min="1"
                        required
                      />
                    </div>
                    <div className="md:col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeConversion(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div> */}

          <div className="flex justify-end gap-4 pt-6">
            <Link href="/dashboard/products">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></div>
                  Saving...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
