"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAllDefects } from "@/lib/api/services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertTriangle, Plus, FileSearch } from "lucide-react";

export default function DefectsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDefects = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        const response = await getAllDefects(token);
        if (response && response.data) {
          setDefects(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch defects:", err);
        setError("Failed to load defects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDefects();
  }, [token]);

  // Status badge colors
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Pending</Badge>;
      case 'returned':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Returned</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container p-6 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Defect Management</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Track and manage product defects
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/defects/create")}>
          <Plus className="mr-2 h-4 w-4" /> Report Defect
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>All Defect Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-40 text-red-500">
              <AlertTriangle className="mr-2 h-5 w-5" /> {error}
            </div>
          ) : defects.length === 0 ? (
            <div className="text-center p-6 text-gray-500 dark:text-gray-400">
              <AlertTriangle className="mx-auto h-10 w-10 text-gray-400 mb-2" />
              <p>No defect reports found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/dashboard/defects/create")}
              >
                Report Your First Defect
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defects.map((defect) => (
                  <TableRow key={defect.id}>
                    <TableCell className="font-medium">
                      {defect.product_name}
                      <div className="text-xs text-gray-500">
                        {defect.part_number}
                      </div>
                    </TableCell>
                    <TableCell>{defect.defect_type}</TableCell>
                    <TableCell>
                      {new Date(defect.defect_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {defect.quantity} {defect.unit_name}
                    </TableCell>
                    <TableCell>{getStatusBadge(defect.status)}</TableCell>
                    <TableCell>{defect.reported_by_name}</TableCell>
                    <TableCell>
                      {defect.warehouse_name} / {defect.container_name} / {defect.rack_name}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/dashboard/defects/${defect.id}`)
                        }
                      >
                        <FileSearch className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}