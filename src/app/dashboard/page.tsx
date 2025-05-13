"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PackageCheck, 
  PackagePlus, 
  Truck, 
  AlertTriangle, 
  Layers, 
  Tag,
  Search,
  BarcodeIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowLeftRight,
  Package,
  Archive,
  MousePointerClick,
  RefreshCw,
  Clock
} from 'lucide-react';

// Import mock data
import { 
  mockInventory, 
  mockProducts, 
  mockBarcodes,
  mockUser,
  getProductByBarcode,
  mockStockOutByBarcode
} from '@/lib/mock/data';

// Mock defect and transit data
const mockDefects = [
  {
    defect_id: 1,
    product_id: 1,
    product_unit_id: 1,
    quantity: 2,
    defect_reason: 'factory',
    reported_date: '2025-01-10T14:30:00Z',
    product_name: 'Laptop Dell XPS 13',
    unit_name: 'Piece',
    unit_code: 'PCS'
  },
  {
    defect_id: 2,
    product_id: 4,
    product_unit_id: 6,
    quantity: 5,
    defect_reason: 'shipping',
    reported_date: '2025-01-12T09:15:00Z',
    product_name: 'Safety Helmet',
    unit_name: 'Piece',
    unit_code: 'PCS'
  }
];

const mockTransits = [
  {
    transit_id: 1,
    product_id: 3,
    product_unit_id: 4,
    quantity: 5,
    source_warehouse_id: 1,
    destination_warehouse_id: 3,
    status: 'in_transit',
    transit_reason: 'category_based',
    transit_date: '2025-01-14T10:00:00Z',
    product_name: 'First Aid Kit',
    unit_name: 'Piece',
    unit_code: 'PCS',
    source_warehouse_name: 'Main Warehouse',
    destination_warehouse_name: 'HSE Storage',
    barcode_count: 5
  },
  {
    transit_id: 2,
    product_id: 1,
    product_unit_id: 1,
    quantity: 2,
    source_warehouse_id: 1,
    destination_warehouse_id: 2,
    status: 'in_transit',
    transit_reason: 'transfer_request',
    transit_date: '2025-01-15T14:30:00Z',
    product_name: 'Laptop Dell XPS 13',
    unit_name: 'Piece',
    unit_code: 'PCS',
    source_warehouse_name: 'Main Warehouse',
    destination_warehouse_name: 'East Warehouse',
    barcode_count: 2
  }
];

export default function DashboardPage() {
  // Directly use mockUser instead of auth context for demonstration
  const auth = { user: mockUser, token: 'mock-token' };
  
  const [quickBarcode, setQuickBarcode] = useState('');
  const [barcodeResult, setBarcodeResult] = useState(null);
  const [barcodeError, setBarcodeError] = useState(null);
  const [processingBarcode, setProcessingBarcode] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('activities');
  const barcodeInputRef = useRef(null);
  
  // Mock loading states with state variables
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingDefects, setLoadingDefects] = useState(true);
  const [loadingTransits, setLoadingTransits] = useState(true);
  
  // State for mock data
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [defects, setDefects] = useState([]);
  const [transits, setTransits] = useState([]);
  
  // Simulate data loading
  useEffect(() => {
    const loadData = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setInventory(mockInventory);
      setProducts(mockProducts);
      setDefects(mockDefects);
      setTransits(mockTransits);
      
      setLoadingInventory(false);
      setLoadingProducts(false);
      setLoadingDefects(false);
      setLoadingTransits(false);
    };
    
    loadData();
  }, []);
  
  // Auto-focus barcode input on load
  useEffect(() => {
    if (barcodeInputRef.current) {
      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 500);
    }
  }, []);

  // Refetch function to simulate reloading data
  const refetchInventory = async () => {
    setLoadingInventory(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setInventory(mockInventory);
    setLoadingInventory(false);
  };

  // Handle quick barcode lookup/stock-out
  const handleQuickBarcode = async (e) => {
    e.preventDefault();
    
    if (!quickBarcode.trim() || !auth.user?.id) {
      return;
    }

    setProcessingBarcode(true);
    setBarcodeError(null);
    setBarcodeResult(null);
    setSuccessMessage(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get barcode item info using our mock function
      const response = getProductByBarcode(quickBarcode);
      
      if (response.code === "200" && response.data) {
        setBarcodeResult(response.data);
      } else {
        setBarcodeError(response.message || 'Item not found');
      }
    } catch (err) {
      setBarcodeError(err.message || 'Item not found');
    } finally {
      setProcessingBarcode(false);
    }
  };

  // Process stock out for quick barcode
  const processStockOut = async () => {
    if (!barcodeResult || !auth.user?.id) {
      return;
    }

    setProcessingBarcode(true);
    setBarcodeError(null);
    setSuccessMessage(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Process stock out with mock function
      const response = mockStockOutByBarcode(barcodeResult.barcode);
      
      if (response.code === "200") {
        setSuccessMessage(`Successfully processed stock-out for ${barcodeResult.product_name} (${barcodeResult.unit_name})`);
        setBarcodeResult(null);
        setQuickBarcode('');
        
        // Simulate refetching inventory after stock out
        await refetchInventory();
        
        // Focus barcode input again for the next scan
        setTimeout(() => {
          barcodeInputRef.current?.focus();
        }, 100);
      } else {
        setBarcodeError(response.message || 'Failed to process stock-out');
      }
    } catch (err) {
      setBarcodeError(err.message || 'Failed to process stock-out');
    } finally {
      setProcessingBarcode(false);
    }
  };

  // Clear messages after a delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (barcodeError) {
      const timer = setTimeout(() => {
        setBarcodeError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [barcodeError]);

  // Calculate key metrics
  const totalInventoryItems = inventory?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
  const totalProducts = products?.length || 0;
  const totalDefects = defects?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
  const inTransitItems = transits?.filter(t => t.status === 'in_transit').length || 0;

  // Get recent activity from various sources
  const getRecentTransits = () => {
    if (!transits) return [];
    return transits
      .filter(t => t.status === 'in_transit')
      .slice(0, 5)
      .map(t => ({
        id: `transit-${t.transit_id}`,
        type: 'transit',
        icon: <ArrowLeftRight size={16} />,
        title: `${t.product_name} (${t.quantity} ${t.unit_name})`,
        description: `In transit to ${t.destination_warehouse_name}`,
        date: new Date(t.transit_date).toLocaleString(),
      }));
  };

  const getRecentDefects = () => {
    if (!defects) return [];
    return defects
      .slice(0, 5)
      .map(d => ({
        id: `defect-${d.defect_id}`,
        type: 'defect',
        icon: <AlertTriangle size={16} />,
        title: `${d.product_name} (${d.quantity} ${d.unit_name})`,
        description: `Defect reason: ${d.defect_reason}`,
        date: new Date(d.reported_date).toLocaleString(),
      }));
  };

  // Combine recent activities
  const recentActivities = [...getRecentTransits(), ...getRecentDefects()]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  // Get low stock items (less than 5 items in inventory)
  const lowStockItems = inventory?.filter(item => Number(item.quantity) < 5) || [];

  // Get inventory by category type
  const getInventoryByCategory = () => {
    if (!inventory) return { GA: 0, 'NON-GA': 0 };
    
    return inventory.reduce((acc, item) => {
      const category = item.category_type || 'Unknown';
      acc[category] = (acc[category] || 0) + Number(item.quantity);
      return acc;
    }, {});
  };

  const inventoryByCategory = getInventoryByCategory();

  return (
    <div className="p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Dashboard</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Overview of your inventory system status and activities
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Last updated:
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {new Date().toLocaleString()}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              className="ml-2 flex items-center gap-1"
              onClick={() => {
                refetchInventory();
              }}
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline-block">Refresh</span>
            </Button>
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Inventory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden h-full dark:bg-gray-800">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Inventory</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {loadingInventory ? (
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                      ) : (
                        <span>{totalInventoryItems.toLocaleString()}</span>
                      )}
                    </h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Across {inventory?.length || 0} locations</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
            </Card>
          </motion.div>
          
          {/* Total Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden h-full dark:bg-gray-800">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Products</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {loadingProducts ? (
                        <Loader2 className="h-6 w-6 animate-spin text-green-500" />
                      ) : (
                        <span>{totalProducts.toLocaleString()}</span>
                      )}
                    </h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">In the product catalog</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600" />
            </Card>
          </motion.div>
          
          {/* Defects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="relative overflow-hidden h-full dark:bg-gray-800">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Defects</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {loadingDefects ? (
                        <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                      ) : (
                        <span>{totalDefects.toLocaleString()}</span>
                      )}
                    </h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Defective items reported</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-600" />
            </Card>
          </motion.div>
          
          {/* In Transit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="relative overflow-hidden h-full dark:bg-gray-800">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">In Transit</p>
                    <h3 className="text-2xl font-bold mt-1 text-gray-900 dark:text-white">
                      {loadingTransits ? (
                        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                      ) : (
                        <span>{inTransitItems.toLocaleString()}</span>
                      )}
                    </h3>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Truck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Items currently in transit</span>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
            </Card>
          </motion.div>
        </div>
        
        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mb-6"
        >
          <Card className="p-5 dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Inventory by Category</h2>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[120px]">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GA</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {inventoryByCategory.GA || 0} items
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div 
                    className="h-2.5 rounded-full bg-green-500"
                    style={{ 
                      width: `${totalInventoryItems > 0 
                        ? Math.round((inventoryByCategory.GA || 0) / totalInventoryItems * 100) 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="flex-1 min-w-[120px]">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">NON-GA</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {inventoryByCategory['NON-GA'] || 0} items
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-200 dark:bg-gray-700">
                  <div 
                    className="h-2.5 rounded-full bg-blue-500"
                    style={{ 
                      width: `${totalInventoryItems > 0 
                        ? Math.round((inventoryByCategory['NON-GA'] || 0) / totalInventoryItems * 100) 
                        : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card className="dark:bg-gray-800 h-full flex flex-col">
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <MousePointerClick className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                  Quick Actions
                </h2>
              </div>
              
              <div className="p-5">
                {/* Quick Barcode Lookup/Stock-Out */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <BarcodeIcon className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                    Quick Barcode Lookup
                  </h3>
                  <form onSubmit={handleQuickBarcode} className="space-y-3">
                    <div className="flex">
                      <div className="relative flex-1">
                        <Input
                          ref={barcodeInputRef}
                          type="text"
                          placeholder="Scan or enter barcode"
                          value={quickBarcode}
                          onChange={(e) => setQuickBarcode(e.target.value)}
                          className="pl-10 pr-4 py-2 w-full border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BarcodeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="ml-2 whitespace-nowrap"
                        disabled={processingBarcode || !quickBarcode.trim()}
                      >
                        {processingBarcode ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Search className="h-4 w-4 mr-2" />
                        )}
                        Lookup
                      </Button>
                    </div>
                    
                    {/* Error and success messages */}
                    <AnimatePresence>
                      {barcodeError && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center text-sm text-red-500 mt-1"
                        >
                          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                          {barcodeError}
                        </motion.div>
                      )}
                      
                      {successMessage && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-center text-sm text-green-500 mt-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                          {successMessage}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Barcode result */}
                    <AnimatePresence>
                      {barcodeResult && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md"
                        >
                          <div className="font-medium text-gray-800 dark:text-white">{barcodeResult.product_name}</div>
                          <div className="mt-2 space-y-1 text-sm">
                            <p className="flex items-center text-gray-600 dark:text-gray-300">
                              <Tag className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400" />
                              <span className="font-medium mr-1">Unit:</span> 
                              {barcodeResult.unit_name} ({barcodeResult.unit_code})
                            </p>
                            <p className="flex items-center text-gray-600 dark:text-gray-300">
                              <Warehouse className="h-3.5 w-3.5 mr-2 text-gray-500 dark:text-gray-400" />
                              <span className="font-medium mr-1">Location:</span> 
                              {barcodeResult.warehouse_name} - {barcodeResult.rack_name}
                            </p>
                            <p className="flex items-center text-gray-600 dark:text-gray-300">
                              <div className={`h-2 w-2 rounded-full mr-2 ${
                                barcodeResult.status === 'available' 
                                  ? 'bg-green-500' 
                                  : barcodeResult.status === 'transit'
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                              }`} />
                              <span className="font-medium mr-1">Status:</span> 
                              <span className={`capitalize ${
                                barcodeResult.status === 'available' 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : barcodeResult.status === 'transit'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-red-600 dark:text-red-400'
                              }`}>
                                {barcodeResult.status}
                              </span>
                            </p>
                          </div>
                          <div className="mt-3">
                            <Button
                              size="sm"
                              variant={barcodeResult.status === 'available' ? 'default' : 'outline'}
                              onClick={processStockOut}
                              disabled={processingBarcode || barcodeResult.status !== 'available'}
                              className="w-full"
                            >
                              {processingBarcode ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <ArrowUpCircle className="h-4 w-4 mr-2" />
                              )}
                              Process Stock-Out
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </div>
                
                {/* Common Operations */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Common Operations</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/dashboard/stock-in">
                      <Button variant="outline" className="w-full justify-start text-gray-800 dark:text-gray-200">
                        <PackagePlus className="h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                        Stock In
                      </Button>
                    </Link>
                    <Link href="/dashboard/stock-out">
                      <Button variant="outline" className="w-full justify-start text-gray-800 dark:text-gray-200">
                        <PackageCheck className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                        Stock Out
                      </Button>
                    </Link>
                    <Link href="/dashboard/transit">
                      <Button variant="outline" className="w-full justify-start text-gray-800 dark:text-gray-200">
                        <Truck className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
                        Transit
                      </Button>
                    </Link>
                    <Link href="/dashboard/defects">
                      <Button variant="outline" className="w-full justify-start text-gray-800 dark:text-gray-200">
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
                        Defects
                      </Button>
                    </Link>
                    <Link href="/dashboard/inventory">
                      <Button variant="outline" className="w-full justify-start text-gray-800 dark:text-gray-200">
                        <Archive className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" />
                        Inventory
                      </Button>
                    </Link>
                    <Link href="/dashboard/products">
                      <Button variant="outline" className="w-full justify-start text-gray-800 dark:text-gray-200">
                        <Tag className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                        Products
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
          
          {/* Activity & Low Stock Tabs */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card className="dark:bg-gray-800 h-full">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex flex-wrap -mb-px">
                  <button
                    className={`px-6 py-4 text-sm font-medium inline-flex items-center border-b-2 ${
                      activeTab === 'activities'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('activities')}
                  >
                    <Clock className={`h-4 w-4 mr-2 ${
                      activeTab === 'activities'
                        ? 'text-blue-500 dark:text-blue-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    Recent Activity
                  </button>
                  <button
                    className={`px-6 py-4 text-sm font-medium inline-flex items-center border-b-2 ${
                      activeTab === 'lowstock'
                        ? 'border-red-500 text-red-600 dark:text-red-400 dark:border-red-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('lowstock')}
                  >
                    <AlertCircle className={`h-4 w-4 mr-2 ${
                      activeTab === 'lowstock'
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-gray-400 dark:text-gray-500'
                    }`} />
                    Low Stock Alert
                    {lowStockItems.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full">
                        {lowStockItems.length}
                      </span>
                    )}
                  </button>
                </nav>
              </div>
              
              <div className="p-5">
                <AnimatePresence mode="wait">
                  {activeTab === 'activities' && (
                    <motion.div
                      key="activities"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {recentActivities.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="mx-auto h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
                            <Clock className="h-7 w-7 text-gray-500 dark:text-gray-400" />
                          </div>
                          <p className="text-gray-500 dark:text-gray-400 italic">No recent activities found.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {recentActivities.map((activity) => (
                            <div 
                              key={activity.id} 
                              className={`p-3 rounded-md border ${
                                activity.type === 'transit' 
                                  ? 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30' 
                                  : 'bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-900/30'
                              }`}
                            >
                              <div className="flex items-center">
                                <span className={`p-1 rounded-full ${
                                  activity.type === 'transit' 
                                    ? 'bg-amber-100 dark:bg-amber-800/50' 
                                    : 'bg-red-100 dark:bg-red-800/50'
                                }`}>
                                  {activity.icon}
                                </span>
                                <span className={`ml-2 font-medium ${
                                  activity.type === 'transit' 
                                    ? 'text-amber-800 dark:text-amber-300' 
                                    : 'text-red-800 dark:text-red-300'
                                }`}>
                                  {activity.title}
                                </span>
                              </div>
                              <div className="mt-1 ml-7 text-sm text-gray-700 dark:text-gray-300">{activity.description}</div>
                              <div className="ml-7 text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {activity.date}
                              </div>
                            </div>
                          ))}
                          
                          <div className="mt-4 text-center">
                            <Link href="/dashboard/activity">
                              <Button variant="link" className="text-blue-600 dark:text-blue-400">
                                View All Activity →
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                  
                  {activeTab === 'lowstock' && (
                    <motion.div
                      key="lowstock"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {loadingInventory ? (
                        <div className="flex justify-center py-10">
                          <Loader2 className="h-10 w-10 animate-spin text-gray-500 dark:text-gray-400" />
                        </div>
                      ) : lowStockItems.length === 0 ? (
                        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-md border border-green-100 dark:border-green-900/30 text-center">
                          <div className="mx-auto h-14 w-14 rounded-full bg-green-100 dark:bg-green-800/40 flex items-center justify-center mb-3">
                            <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                          </div>
                          <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">All Items Well-Stocked</h3>
                          <p className="text-green-700 dark:text-green-400">All items in your inventory have sufficient quantities.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 text-black">
                          {lowStockItems.map((item, index) => (
                            <motion.div 
                              key={item.inventory_id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-100 dark:border-red-900/30"
                            >
                              <div className="flex items-center">
                                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mr-2 flex-shrink-0" />
                                <div className="font-medium text-red-800 dark:text-red-300">{item.product_name}</div>
                              </div>
                              <div className="mt-2 flex justify-between ml-7">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  <strong>Quantity:</strong> {item.quantity} {item.unit_name}
                                </span>
                                <span className="text-sm font-medium text-red-600 dark:text-red-400 animate-pulse">
                                  Low Stock
                                </span>
                              </div>
                              <div className="text-sm text-gray-700 dark:text-gray-300 ml-7">
                                <strong>Location:</strong> {item.warehouse_name} - {item.rack_name}
                              </div>
                            </motion.div>
                          ))}
                          
                          <div className="mt-3">
                            <Link href="/dashboard/stock-in">
                              <Button className="w-full">
                                <ArrowDownCircle className="h-4 w-4 mr-2" />
                                Restock Inventory
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>
        </div>
        
        {/* Inventory Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="mt-6"
        >
          <Card className="dark:bg-gray-800 overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Layers className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
                Inventory Summary
              </h2>
              
              <Link href="/dashboard/inventory">
                <Button variant="outline" size="sm" className="text-gray-700 dark:text-gray-300">
                  View Complete Inventory
                </Button>
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              {loadingInventory ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-gray-500 dark:text-gray-400" />
                </div>
              ) : inventory && inventory.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Warehouse
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rack
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {inventory.slice(0, 5).map((item, index) => (
                      <motion.tr 
                        key={item.inventory_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            item.category_type === 'GA' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {item.category_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {item.unit_name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {item.warehouse_name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {item.rack_name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            Number(item.quantity) < 5
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {item.quantity}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400 italic">
                  No inventory data available.
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}