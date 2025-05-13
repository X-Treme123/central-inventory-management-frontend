// components/BarcodeScanner.tsx
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { stockOutByBarcode, getProductByBarcode } from '@/lib/api/services';
import { BarcodeItem, StockOutResponse } from '@/lib/api/types';

interface BarcodeScannerProps {
  onScanSuccess?: (response: StockOutResponse) => void;
  onScanError?: (error: Error) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ 
  onScanSuccess, 
  onScanError 
}) => {
  const [barcode, setBarcode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<BarcodeItem | null>(null);
  const [scanMode, setScanMode] = useState<'manual' | 'camera'>('manual');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, token } = useAuth();

  // Function to handle manual barcode input change
  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcode(e.target.value);
    setError(null);
  };

  // Function to handle lookup of product by barcode
  const handleLookupBarcode = async () => {
    if (!barcode) {
      setError('Please enter a barcode');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await getProductByBarcode(barcode, token!);
      
      if (response.code === "200" && response.data) {
        setProductInfo(response.data);
      } else {
        setError('Product not found for this barcode');
        setProductInfo(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error looking up barcode');
      setProductInfo(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle stock out by barcode
  const handleStockOut = async () => {
    if (!barcode) {
      setError('Please enter a barcode');
      return;
    }

    if (!user?.id) {
      setError('User information missing');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const stockOutData = {
        barcode,
        user_id: user.id,
        transaction_reason: 'direct_request', // Default reason
        notes: 'Scanned via barcode scanner'
      };

      const response = await stockOutByBarcode(stockOutData, token!);
      
      if (response.code === "200") {
        // Clear the input after successful scan
        setBarcode('');
        setProductInfo(null);
        
        // Call the success callback if provided
        if (onScanSuccess) {
          onScanSuccess(response);
        }
      } else {
        throw new Error(response.message || 'Failed to process stock out');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error processing stock out';
      setError(errorMessage);
      
      // Call the error callback if provided
      if (onScanError) {
        onScanError(err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to toggle camera mode
  const toggleCamera = async () => {
    if (isCameraActive) {
      // Stop the camera
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
    } else {
      // Start the camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
          
          // We would normally add barcode detection here
          // This would require a library like zxing or quagga
          console.log('Camera activated - barcode detection would be implemented here');
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please check permissions.');
      }
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Enter key for submitting after manual entry
      if (event.key === 'Enter' && barcode) {
        handleStockOut();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    
    return () => {
      window.removeEventListener('keypress', handleKeyPress);
    };
  }, [barcode]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Inventory Stock Out</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Button 
              onClick={() => setScanMode('manual')}
              variant={scanMode === 'manual' ? "default" : "outline"}
              className="flex-1"
            >
              Manual Entry
            </Button>
            <Button 
              onClick={() => setScanMode('camera')}
              variant={scanMode === 'camera' ? "default" : "outline"}
              className="flex-1"
            >
              Camera Scan
            </Button>
          </div>

          {scanMode === 'manual' ? (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Enter barcode"
                  value={barcode}
                  onChange={handleBarcodeChange}
                  className="flex-1"
                  disabled={isProcessing}
                  autoFocus
                />
                <Button onClick={handleLookupBarcode} disabled={isProcessing || !barcode}>
                  Lookup
                </Button>
              </div>
              
              {productInfo && (
                <div className="p-4 border rounded-md bg-gray-50">
                  <h3 className="font-bold">{productInfo.product_name}</h3>
                  <p className="text-sm">Type: {productInfo.unit_code}</p>
                  <p className="text-sm">Location: {productInfo.warehouse_name} - {productInfo.rack_name}</p>
                  <p className="text-sm">Barcode: {productInfo.barcode}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-200 rounded-md overflow-hidden">
                {isCameraActive ? (
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Camera inactive</p>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={toggleCamera} 
                variant={isCameraActive ? "destructive" : "default"}
                className="w-full"
              >
                {isCameraActive ? "Stop Camera" : "Start Camera"}
              </Button>
              
              {isCameraActive && (
                <p className="text-sm text-center text-gray-500">
                  Point camera at barcode to scan automatically
                </p>
              )}
            </div>
          )}
          
          {error && (
            <div className="p-2 text-sm text-white bg-red-500 rounded-md">
              {error}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleStockOut} 
          className="w-full" 
          disabled={isProcessing || !barcode}
        >
          {isProcessing ? "Processing..." : "Process Stock Out"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BarcodeScanner;