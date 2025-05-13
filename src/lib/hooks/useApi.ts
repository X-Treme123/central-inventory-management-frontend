// lib/hooks/useApi.ts
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext'; // Adjust the import path as necessary

interface UseApiOptions<T> {
  fetchFn: (token: string) => Promise<T>;
  initialData?: T;
  deps?: any[];
  skipInitialFetch?: boolean;
  enableLogging?: boolean; // Optional parameter to enable logging
}

export function useApi<T>({
  fetchFn,
  initialData,
  deps = [],
  skipInitialFetch = false,
  enableLogging = false, // Default to false
}: UseApiOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(!skipInitialFetch);
  const [error, setError] = useState<Error | null>(null);
  const { token, isAuthenticated } = useAuth();
  
  // Store the latest fetchFn in a ref to avoid dependency issues
  const fetchFnRef = useRef(fetchFn);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  // Convert deps array to a stable string for dependency tracking
  const depsString = JSON.stringify(deps);
  
  const fetchData = useCallback(async () => {
    
    
    if (!token || !isAuthenticated) {
      setError(new Error('Not authenticated'));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use the function from the ref
      const result = await fetchFnRef.current(token);
      setData(result);
    } catch (err) {
      // Only log errors by default, as they're important
      console.error('API Error:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [token, isAuthenticated, depsString, enableLogging]); // Add enableLogging to dependencies

  useEffect(() => {
    if (!skipInitialFetch) {
      fetchData();
    }
  }, [fetchData, skipInitialFetch]);

  return { data, isLoading, error, refetch: fetchData };
}