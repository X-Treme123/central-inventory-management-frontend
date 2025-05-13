"use client";

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Loader2, 
  Search, 
  QrCode, 
  AlertCircle, 
  CheckCircle, 
  Trash2, 
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

// Import mock data and functions
import { 
  mockUser, 
  mockBarcodes, 
  getProductByBarcode, 
  mockStockOutByBarcode, 
  mockBulkStockOut 
} from '@/lib/mock/data';

// Define types
interface ScannedItem {
  barcode: string;
  product_name: string;
  unit_name: string;
  unit_code: string;
  scanned_at: string;
}

interface ProductDetails {
  barcode_id: number;
  product_id: number;
  product_name: string;
  unit_name: string;
  unit_code: string;
  warehouse_name: string;
  rack_name: string;
  status: string;
  barcode: string;
}

const StockOutPage = () => {
  // Use mock auth data
  const auth = {
    user: mockUser,
    token: "mock-token-123"
  };
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  
  // State for form data
  const { user, logout } = useAuth();
  const [barcode, setBarcode] = useState('');
  const [notes, setNotes] = useState('');
  const [transactionReason, setTransactionReason] = useState<'direct_request' | 'incident' | 'regular'>('direct_request');
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  
  // Add state for user name input with proper null checking
  const [userName, setUserName] = useState('');
  
  // State for feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanningMode, setIsScanningMode] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
  
  // Initialize user name from auth context when component mounts
  useEffect(() => {
    // Check if user exists before accessing properties
    if (user && user.name) {
      setUserName(user.name);
    }
  }, [user]);
  
  // Focus barcode input when scanning mode is active
  useEffect(() => {
    if (isScanningMode && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [isScanningMode]);
  
  // Reset error/success messages after some time
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  
  // Handle barcode input
  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcode(e.target.value);
    setProductDetails(null); // Clear product details when barcode changes
  };
  
  // Handle user name input change
  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };
  
  // Search for barcode
  const handleBarcodeSearch = async () => {
    if (!barcode.trim()) {
      setErrorMessage('Please enter a barcode');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use mock function to get product details
      const response = getProductByBarcode(barcode.trim());
      
      if (response.code === "200" && response.data) {
        setProductDetails(response.data);
      } else {
        setErrorMessage('Barcode not found or item not available');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to search for barcode');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Process barcode for stock out
  const handleStockOut = async () => {
    if (!barcode.trim()) {
      setErrorMessage('Please enter a barcode');
      return;
    }
    
    if (!auth.user?.id) {
      setErrorMessage('You must be logged in to perform this action');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use mock function to process stock out
      const response = mockStockOutByBarcode(barcode.trim());
      
      if (response.code === "200") {
        // Add scanned item to list
        const newItem: ScannedItem = {
          barcode: barcode.trim(),
          product_name: response.data.product_name || 'Unknown Product',
          unit_name: response.data.unit_name || 'Unknown Unit',
          unit_code: response.data.unit_code || '',
          scanned_at: new Date().toLocaleTimeString()
        };
        
        setScannedItems([newItem, ...scannedItems]);
        setSuccessMessage('Item successfully processed for stock out');
        setBarcode(''); // Clear barcode input for next scan
        setProductDetails(null); // Clear product details
        
        // Auto-focus barcode input for next scan if in scanning mode
        if (isScanningMode && barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      } else {
        setErrorMessage(response.message || 'Failed to process stock out');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred while processing your request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle bulk stock out (all scanned items)
  const handleBulkStockOut = async () => {
    if (scannedItems.length === 0) {
      setErrorMessage('No items have been scanned');
      return;
    }
    
    if (!auth.user?.id) {
      setErrorMessage('You must be logged in to perform this action');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Use mock function to process bulk stock out
      const response = mockBulkStockOut(scannedItems.map(item => item.barcode));
      
      if (response.code === "201") {
        setSuccessMessage(`${scannedItems.length} items successfully processed for stock out`);
        setScannedItems([]); // Clear all scanned items
        setBarcode(''); // Clear barcode input
        setProductDetails(null); // Clear product details
      } else {
        setErrorMessage(response.message || 'Failed to process bulk stock out');
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred while processing your request');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle barcode key press (for scanner)
  const handleBarcodeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (productDetails) {
        // If we already have product details, process stock out
        handleStockOut();
      } else {
        // Otherwise, search for the barcode
        handleBarcodeSearch();
      }
    }
  };
  
  // Toggle scanning mode
  const toggleScanningMode = () => {
    setIsScanningMode(!isScanningMode);
    setBarcode(''); // Clear barcode when switching modes
    setProductDetails(null); // Clear product details
    
    // Focus barcode input when entering scanning mode
    if (!isScanningMode && barcodeInputRef.current) {
      setTimeout(() => {
        if (barcodeInputRef.current) {
          barcodeInputRef.current.focus();
        }
      }, 100);
    }
  };
  
  // Remove a scanned item
  const removeScannedItem = (barcode: string) => {
    setScannedItems(scannedItems.filter(item => item.barcode !== barcode));
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Stock Out</h1>
      </div>
      
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Barcode Scanner</h2>
              <Button 
                variant={isScanningMode ? "default" : "outline"} 
                onClick={toggleScanningMode}
                className="flex items-center"
              >
                <QrCode className="h-4 w-4 mr-2" />
                {isScanningMode ? "Exit Scanning Mode" : "Enter Scanning Mode"}
              </Button>
            </div>
            
            <div className="mb-4">
              <div className="flex">
                <Input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcode}
                  onChange={handleBarcodeChange}
                  onKeyPress={handleBarcodeKeyPress}
                  placeholder="Enter or scan barcode"
                  className="flex-1"
                  disabled={isSubmitting}
                  autoComplete="off"
                />
                <Button
                  type="button"
                  onClick={handleBarcodeSearch}
                  className="ml-2 flex items-center"
                  disabled={isSubmitting || !barcode.trim()}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
              </div>
              
              {isScanningMode && (
                <p className="text-sm text-gray-500 mt-2">
                  Scanning mode active. Scan barcodes with your scanner device.
                </p>
              )}
            </div>
            
            {productDetails && (
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h3 className="font-medium mb-2">Product Details:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><span className="font-medium">Barcode:</span> {barcode}</p>
                  <p><span className="font-medium">Product:</span> {productDetails.product_name}</p>
                  <p><span className="font-medium">Unit:</span> {productDetails.unit_name} ({productDetails.unit_code})</p>
                  <p><span className="font-medium">Location:</span> {productDetails.warehouse_name}, {productDetails.rack_name}</p>
                  <p><span className="font-medium">Status:</span> <span className="text-green-600">{productDetails.status}</span></p>
                </div>
                
                <div className="mt-3">
                  <Button
                    onClick={handleStockOut}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Process Stock Out for This Item
                  </Button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Added User Name input field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIC
                </label>
                <Input
                  type="text"
                  value={userName}
                  disabled
                  onChange={handleUserNameChange}
                  placeholder="Enter your name"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={transactionReason}
                  onChange={(e) => setTransactionReason(e.target.value as any)}
                >
                  <option value="direct_request" className='text-black'>Direct Request</option>
                  <option value="incident" className='text-black'>Incident</option>
                  <option value="regular" className='text-black'>Regular</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <Input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes"
                />
              </div>
            </div>
          </Card>
          
          {scannedItems.length > 0 && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Scanned Items ({scannedItems.length})</h2>
                <Button
                  onClick={handleBulkStockOut}
                  disabled={isSubmitting}
                  variant="default"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Process All Items
                </Button>
              </div>
              
              <ScrollArea className="h-[calc(100vh-500px)]">
                <div className="space-y-2">
                  {scannedItems.map((item, index) => (
                    <div 
                      key={`${item.barcode}-${index}`} 
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <div className="flex text-sm text-gray-500">
                          <p className="mr-4">Barcode: {item.barcode}</p>
                          <p>Unit: {item.unit_name} ({item.unit_code})</p>
                        </div>
                        <p className="text-xs text-gray-400">Scanned at: {item.scanned_at}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeScannedItem(item.barcode)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>
        
        <div className="md:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Instructions</h2>
            
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-medium text-indigo-600">How to Process Stock Out:</h3>
                <ol className="list-decimal list-inside mt-2 space-y-2">
                  <li>Enter a barcode or use a barcode scanner</li>
                  <li>Verify the product details</li>
                  <li>Click "Process Stock Out" button</li>
                  <li>Repeat for all items</li>
                </ol>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-indigo-600">Scanning Mode:</h3>
                <p className="mt-2">
                  Enable "Scanning Mode" to continuously scan multiple barcodes for bulk processing.
                  Items will be added to the scanned list automatically.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-indigo-600">Barcode Types:</h3>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>PCS (Individual pieces): Start with "I"</li>
                  <li>PACK (Package units): Start with "P"</li>
                </ul>
                <p className="mt-2 text-gray-500">
                  The system will automatically reduce inventory by the appropriate unit type.
                </p>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-indigo-600">Valid Test Barcodes:</h3>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>IPCS0001 - Dell XPS 13 (Piece)</li>
                  <li>PBOX0001 - Dell XPS 13 (Box)</li>
                  <li>IPCS0003 - Office Chair</li>
                  <li>IPCS0004 - First Aid Kit (Piece)</li>
                  <li>PPACK0001 - First Aid Kit (Pack)</li>
                  <li>IPCS0005 - Safety Helmet</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StockOutPage;