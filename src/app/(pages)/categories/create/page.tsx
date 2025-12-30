// app/(dashboard)/categories/create/page.tsx - With Toast
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createCategory } from "@/features/pages/categories/api/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Loader2, Save } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { toast } from "sonner";

export default function CreateCategoryPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      await createCategory(token, name, description);
      
      toast.success("Category created successfully");
      router.push("/categories");
    } catch (err: any) {
      console.error("Error creating category:", err);
      const errorMessage = err.message || "Failed to create category";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/categories")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Create Category</h2>
            <p className="text-muted-foreground">
              Add a new product category to your inventory
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </Alert>
      )}

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              disabled={isSubmitting}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter category description (optional)"
              disabled={isSubmitting}
              rows={4}
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/categories")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Category
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}