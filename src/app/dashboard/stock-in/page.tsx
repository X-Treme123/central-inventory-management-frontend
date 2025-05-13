"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/lib/hooks/useApi';
import { fetchWithAuth } from '@/lib/api/config';
import { 
  Loader2, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Package, 
  Warehouse, 
  Truck, 
  BadgeAlert,
  ArrowRight,
  ShoppingCart,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

// Define types for our data
interface Product {
  product_id: number;
  product_name: string;
  category_id: number;
  category_name: string;
  category_type: 'GA' | 'NON-GA';
  units: ProductUnit[];
}

interface ProductUnit {
  product_unit_id: number;
  unit_id: number;
  unit_name: string;
  unit_code: string;
  is_base_unit: boolean;
  conversion_factor: number;
}

interface Warehouse {
  warehouse_id: number;
  warehouse_name: string;
  location: string;
}

interface Rack {
  rack_id: number;
  warehouse_id: number;
  rack_name: string;
  rack_code: string;
  rack_barcode: string;
}

interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_person: string;
}

interface StockInItem {
  product_id: number;
  product_unit_id: number;
  warehouse_id: number;
  rack_id: number;
  quantity: number;
  is_defect: boolean;
  defect_reason?: 'factory' | 'shipping' | 'other' | null;
  is_transit: boolean;
  destination_warehouse_id?: number | null;
  destination_rack_id?: number | null;
}

interface StockInRequest {
  reference_number: string;
  notes: string;
  user_id: number;
  supplier_id: number;
  items: StockInItem[];
}

const StockInPage = () => {
  const { user, token } = useAuth();
  
  // State for form data
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [supplierId, setSupplierId] = useState<number | null>(null);
  const [items, setItems] = useState<StockInItem[]>([]);
  
  // For feedback messages
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Fetch reference data
  const { data: products, isLoading: loadingProducts, refetch: refetchProducts } = useApi<Product[]>({
    fetchFn: (token) => fetchWithAuth('/api/products', { method: 'GET' }, token)
      .then(response => response.data),
    initialData: [],
  });
  
  const { data: warehouses, isLoading: loadingWarehouses } = useApi<Warehouse[]>({
    fetchFn: (token) => fetchWithAuth('/api/warehouses', { method: 'GET' }, token)
      .then(response => response.data),
    initialData: [],
  });
  
  const { data: suppliers, isLoading: loadingSuppliers } = useApi<Supplier[]>({
    fetchFn: (token) => fetchWithAuth('/api/suppliers', { method: 'GET' }, token)
      .then(response => response.data),
    initialData: [],
  });
  
  // Dynamic state for racks based on selected warehouse
  const [warehouseRacks, setWarehouseRacks] = useState<{ [key: number]: Rack[] }>({});
  
  // Clear messages after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  
  // Add a new empty item to the items list
  const addItem = () => {
    const newItem: StockInItem = {
      product_id: 0,
      product_unit_id: 0,
      warehouse_id: 0,
      rack_id: 0,
      quantity: 1,
      is_defect: false,
      is_transit: false,
    };
    setItems([...items, newItem]);
  };
  
  // Remove an item at the specified index
  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };
  
  // Update an item field
  const updateItem = (index: number, field: keyof StockInItem, value: any) => {
    const newItems = [...items];
    
    // Special handling for product selection to reset unit
    if (field === 'product_id') {
      newItems[index] = {
        ...newItems[index],
        [field]: value,
        product_unit_id: 0 // Reset unit when product changes
      };
    } 
    // Special handling for warehouse selection to reset rack
    else if (field === 'warehouse_id') {
      newItems[index] = {
        ...newItems[index],
        [field]: value,
        rack_id: 0 // Reset rack when warehouse changes
      };
      
      // Fetch racks for this warehouse if not already loaded
      if (value && !warehouseRacks[value]) {
        loadRacksForWarehouse(value);
      }
    }
    // Special handling for defect toggle
    else if (field === 'is_defect') {
      newItems[index] = {
        ...newItems[index],
        [field]: value,
        defect_reason: value ? 'factory' : null, // Set default reason if defect is true
        is_transit: false // Can't be both defect and transit
      };
    }
    // Special handling for transit toggle
    else if (field === 'is_transit') {
      newItems[index] = {
        ...newItems[index],
        [field]: value,
        destination_warehouse_id: value ? warehouses?.[0]?.warehouse_id || null : null,
        destination_rack_id: null,
        is_defect: false // Can't be both defect and transit
      };
    } 
    // Default handling for other fields
    else {
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
    }
    
    setItems(newItems);
  };
  
  // Load racks for a specific warehouse
  const loadRacksForWarehouse = async (warehouseId: number) => {
    if (!token) return;
    
    try {
      const response = await fetchWithAuth(
        `/api/racks/warehouse/${warehouseId}`,
        { method: 'GET' },
        token
      );
      
      if (response.data) {
        setWarehouseRacks(prev => ({
          ...prev,
          [warehouseId]: response.data
        }));
      }
    } catch (error) {
      console.error('Error loading racks:', error);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !user?.id) {
      setErrorMessage('You must be logged in to perform this action');
      return;
    }
    
    if (!reference) {
      setErrorMessage('Reference number is required');
      return;
    }
    
    if (!supplierId) {
      setErrorMessage('Supplier is required');
      return;
    }
    
    if (items.length === 0) {
      setErrorMessage('At least one item is required');
      return;
    }
    
    // Validate all items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (!item.product_id) {
        setErrorMessage(`Item #${i + 1}: Product is required`);
        return;
      }
      
      if (!item.product_unit_id) {
        setErrorMessage(`Item #${i + 1}: Unit is required`);
        return;
      }
      
      if (!item.warehouse_id) {
        setErrorMessage(`Item #${i + 1}: Warehouse is required`);
        return;
      }
      
      if (!item.rack_id) {
        setErrorMessage(`Item #${i + 1}: Rack is required`);
        return;
      }
      
      if (item.quantity <= 0) {
        setErrorMessage(`Item #${i + 1}: Quantity must be greater than 0`);
        return;
      }
      
      if (item.is_transit) {
        if (!item.destination_warehouse_id) {
          setErrorMessage(`Item #${i + 1}: Destination warehouse is required for transit items`);
          return;
        }
      }
    }
    
    // Prepare request data
    const requestData: StockInRequest = {
      reference_number: reference,
      notes: notes,
      user_id: user.id,
      supplier_id: supplierId,
      items: items
    };
    
    // Reset messages
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    try {
      const response = await fetchWithAuth(
        '/api/transactions/stock-in',
        {
          method: 'POST',
          body: JSON.stringify(requestData)
        },
        token
      );
      
      if (response.code === '201') {
        setSuccessMessage('Stock-in processed successfully');
        // Reset form
        setReference('');
        setNotes('');
        setSupplierId(null);
        setItems([]);
        
        // Refresh product data to see updated inventory
        refetchProducts();
      } else {
        setErrorMessage(response.message || 'Failed to process stock-in');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred while processing your request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If warehouse ID changes, load racks for that warehouse
  useEffect(() => {
    // For each item with a warehouse ID, ensure we have racks loaded
    items.forEach(item => {
      if (item.warehouse_id && !warehouseRacks[item.warehouse_id]) {
        loadRacksForWarehouse(item.warehouse_id);
      }
    });
  }, [items]);
  
  // Generate a custom reference number based on current date
  const generateReferenceNumber = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.getHours().toString().padStart(2, '0') + 
                   now.getMinutes().toString().padStart(2, '0');
    const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    setReference(`REF-${dateStr}-${timeStr}-${randomStr}`);
  };
  
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock In</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Record new items entering your inventory
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Button
              variant="outline"
              onClick={generateReferenceNumber}
              className="text-gray-700 dark:text-gray-300"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Generate Reference
            </Button>
          </div>
        </div>
        
        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4"
            >
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            </motion.div>
          )}
          
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4"
            >
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <form onSubmit={handleSubmit}>
          <Card className="p-5 mb-6 border border-gray-200 dark:border-gray-800 shadow-sm dark:bg-gray-800/50">
            <div className="flex items-center text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              <Truck className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
              Transaction Details
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reference Number*
                </label>
                <Input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., REF-GA-001"
                  required
                  className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Supplier*
                </label>
                <select
                  className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-gray-100"
                  value={supplierId || ''}
                  onChange={(e) => setSupplierId(Number(e.target.value))}
                  required
                >
                  <option value="">Select a supplier</option>
                  {loadingSuppliers ? (
                    <option disabled>Loading suppliers...</option>
                  ) : (
                    suppliers?.map((supplier) => (
                      <option key={supplier.supplier_id} value={supplier.supplier_id}>
                        {supplier.supplier_name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-gray-100"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this stock-in"
                rows={3}
              />
            </div>
          </Card>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-lg font-semibold text-gray-900 dark:text-white">
              <Package className="h-5 w-5 mr-2 text-blue-500 dark:text-blue-400" />
              Items {items.length > 0 && <span className="ml-2 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 py-0.5 px-2 rounded-full">{items.length}</span>}
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="flex items-center bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
          
          <AnimatePresence initial={false}>
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-8 mb-6 border border-dashed border-gray-300 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-800/30">
                  <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                    <Package className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-lg font-medium mb-2">No items added yet</p>
                    <p className="text-sm mb-4">Click "Add Item" to start recording items for stock in</p>
                    <Button
                      type="button"
                      onClick={addItem}
                      className="flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Item
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <div>
                <ScrollArea className="h-[calc(100vh-400px)] mb-4 pr-4">
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="p-5 relative border border-gray-200 dark:border-gray-800 dark:bg-gray-800/50 overflow-hidden">
                          {/* Status indicator for defect/transit */}
                          {item.is_defect && (
                            <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 text-xs rounded-md font-medium flex items-center">
                              <BadgeAlert className="h-3 w-3 mr-1" />
                              Defective
                            </div>
                          )}
                          
                          {item.is_transit && (
                            <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-xs rounded-md font-medium flex items-center">
                              <ArrowRight className="h-3 w-3 mr-1" />
                              In Transit
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                              Item #{index + 1}
                            </h3>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Product*
                              </label>
                              <select
                                className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-gray-100"
                                value={item.product_id || ''}
                                onChange={(e) => updateItem(index, 'product_id', Number(e.target.value))}
                                required
                              >
                                <option value="">Select a product</option>
                                {loadingProducts ? (
                                  <option disabled>Loading products...</option>
                                ) : (
                                  products?.map((product) => (
                                    <option key={product.product_id} value={product.product_id}>
                                      {product.product_name} ({product.category_type})
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Unit*
                              </label>
                              <select
                                className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-gray-100"
                                value={item.product_unit_id || ''}
                                onChange={(e) => updateItem(index, 'product_unit_id', Number(e.target.value))}
                                required
                                disabled={!item.product_id}
                              >
                                <option value="">Select a unit</option>
                                {item.product_id ? (
                                  products?.find(p => p.product_id === item.product_id)?.units.map((unit) => (
                                    <option key={unit.product_unit_id} value={unit.product_unit_id}>
                                      {unit.unit_name} ({unit.unit_code})
                                    </option>
                                  ))
                                ) : (
                                  <option disabled>Select a product first</option>
                                )}
                              </select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Warehouse*
                              </label>
                              <select
                                className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-gray-100"
                                value={item.warehouse_id || ''}
                                onChange={(e) => updateItem(index, 'warehouse_id', Number(e.target.value))}
                                required
                              >
                                <option value="">Select a warehouse</option>
                                {loadingWarehouses ? (
                                  <option disabled>Loading warehouses...</option>
                                ) : (
                                  warehouses?.map((warehouse) => (
                                    <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                                      {warehouse.warehouse_name}
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Rack*
                              </label>
                              <select
                                className="w-full px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 text-gray-900 dark:text-gray-100"
                                value={item.rack_id || ''}
                                onChange={(e) => updateItem(index, 'rack_id', Number(e.target.value))}
                                required
                                disabled={!item.warehouse_id}
                              >
                                <option value="">Select a rack</option>
                                {!item.warehouse_id ? (
                                  <option disabled>Select a warehouse first</option>
                                ) : !warehouseRacks[item.warehouse_id] ? (
                                  <option disabled>Loading racks...</option>
                                ) : warehouseRacks[item.warehouse_id].length === 0 ? (
                                  <option disabled>No racks available</option>
                                ) : (
                                  warehouseRacks[item.warehouse_id].map((rack) => (
                                    <option key={rack.rack_id} value={rack.rack_id}>
                                      {rack.rack_name} ({rack.rack_code})
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Quantity*
                              </label>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                                required
                                className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 focus:border-blue-500"
                              />
                            </div>
                            
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md">
                              <input
                                type="checkbox"
                                id={`defect-${index}`}
                                checked={item.is_defect}
                                onChange={(e) => updateItem(index, 'is_defect', e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <label htmlFor={`defect-${index}`} className="text-sm text-gray-700 dark:text-gray-300">
                                Defective Items
                              </label>
                            </div>
                            
                            <div className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md">
                              <input
                                type="checkbox"
                                id={`transit-${index}`}
                                checked={item.is_transit}
                                onChange={(e) => updateItem(index, 'is_transit', e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <label htmlFor={`transit-${index}`} className="text-sm text-gray-700 dark:text-gray-300">
                                Items in Transit
                              </label>
                            </div>
                          </div>
                          
                          <AnimatePresence>
                            {item.is_defect && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mb-4 overflow-hidden"
                              >
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-md">
                                  <label className="block text-sm font-medium text-red-700 dark:text-red-400 mb-1">
                                    Defect Reason*
                                  </label>
                                  <select
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-gray-900 dark:text-gray-100"
                                    value={item.defect_reason || ''}
                                    onChange={(e) => updateItem(index, 'defect_reason', e.target.value)}
                                    required
                                  >
                                    <option value="factory">Factory Defect</option>
                                    <option value="shipping">Shipping Damage</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          
                          <AnimatePresence>
                            {item.is_transit && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="mb-4 overflow-hidden"
                              >
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 rounded-md">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">
                                        Destination Warehouse*
                                      </label>
                                      <select
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-gray-900 dark:text-gray-100"
                                        value={item.destination_warehouse_id || ''}
                                        onChange={(e) => {
                                          const warehouseId = Number(e.target.value);
                                          updateItem(index, 'destination_warehouse_id', warehouseId);
                                          
                                          // Load racks for this warehouse if not already loaded
                                          if (warehouseId && !warehouseRacks[warehouseId]) {
                                            loadRacksForWarehouse(warehouseId);
                                          }
                                        }}
                                        required
                                      >
                                        <option value="">Select destination warehouse</option>
                                        {loadingWarehouses ? (
                                          <option disabled>Loading warehouses...</option>
                                        ) : (
                                          warehouses?.map((warehouse) => (
                                            <option key={warehouse.warehouse_id} value={warehouse.warehouse_id}>
                                              {warehouse.warehouse_name}
                                            </option>
                                          ))
                                        )}
                                      </select>
                                    </div>
                                    
                                    <div>
                                      <label className="block text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">
                                        Destination Rack
                                      </label>
                                      <select
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-gray-900 dark:text-gray-100"
                                        value={item.destination_rack_id || ''}
                                        onChange={(e) => updateItem(index, 'destination_rack_id', Number(e.target.value))}
                                        disabled={!item.destination_warehouse_id}
                                      >
                                        <option value="">Select destination rack (optional)</option>
                                        {!item.destination_warehouse_id ? (
                                          <option disabled>Select a destination warehouse first</option>
                                        ) : !warehouseRacks[item.destination_warehouse_id] ? (
                                          <option disabled>Loading racks...</option>
                                        ) : warehouseRacks[item.destination_warehouse_id].length === 0 ? (
                                          <option disabled>No racks available</option>
                                        ) : (
                                          warehouseRacks[item.destination_warehouse_id].map((rack) => (
                                            <option key={rack.rack_id} value={rack.rack_id}>
                                              {rack.rack_name} ({rack.rack_code})
                                            </option>
                                          ))
                                        )}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Item
                  </Button>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Info className="h-4 w-4 mr-1" />
                    {items.length} {items.length === 1 ? 'item' : 'items'} in this transaction
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
          
          <Separator className="my-6 border-gray-200 dark:border-gray-800" />
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Process Stock In
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StockInPage;