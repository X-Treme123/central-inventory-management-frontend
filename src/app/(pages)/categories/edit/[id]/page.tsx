// app/(dashboard)/categories/edit/[id]/page.tsx - With Toast
"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCategoryById, updateCategory } from '@/features/pages/categories/api/index';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Loader2, Save } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { useApi } from '@/lib/hooks/useApi';
import { Category } from '@/features/pages/categories/api/index';
import { toast } from 'sonner';

export default function EditCategoryPage() {
  const router = useRouter();
  const { token } = useAuth();
  const params = useParams()
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    data: category, 
    isLoading, 
    error: fetchError 
  } = useApi<Category>({
    fetchFn: (token) => getCategoryById(token, params.id).then(res => res.data),
    deps: [params.id],
  });

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (!token) {
        throw new Error('Authentication token is missing');
      }

      await updateCategory(token, params.id, { name, description });
      
      toast.success('Category updated successfully');
      router.push('/categories');
    } catch (err: any) {
      console.error('Error updating category:', err);
      const errorMessage = err.message || 'Failed to update category';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <span className="ml-2 text-muted-foreground">Loading category...</span>
        </div>
      </div>
    );
  }

  if (fetchError || !category) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium">Failed to load category</h3>
        <p className="text-muted-foreground mb-4">
          {fetchError?.toString() || 'Category not found'}
        </p>
        <Button 
          onClick={() => router.push('/categories')}
          variant="outline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/categories')}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Edit Category</h2>
            <p className="text-muted-foreground">
              Modify the details of "{category.name}"
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
              onClick={() => router.push('/categories')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Category
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}