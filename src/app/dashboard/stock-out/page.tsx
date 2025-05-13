"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  PackageCheck, 
  Filter, 
  Search, 
  MoreHorizontal, 
  FileText, 
  Calendar, 
  Package, 
  Download,
  RefreshCw,
  ChevronDown,
  User,
  Clock,
  Tag,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';

// Import mock data
import { mockStockOutTransactions } from '@/lib/mock/transactions';

// Date formatter
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format reason with proper capitalization
const formatReason = (reason: string) => {
  switch(reason) {
    case 'direct_request':
      return 'Direct Request';
    case 'incident':
      return 'Incident';
    case 'regular':
      return 'Regular';
    default:
      return reason.charAt(0).toUpperCase() + reason.slice(1);
  }
};

const StockOutPage = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterReason, setFilterReason] = useState('');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Load transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setTransactions(mockStockOutTransactions);
      setLoading(false);
    };
    
    fetchTransactions();
  }, []);
  
  // Handle refresh
  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    setTransactions(mockStockOutTransactions);
    setLoading(false);
  };
  
  // Filter transactions based on search term and filters
  const filteredTransactions = transactions.filter(transaction => {
    // Search term filter
    if (searchTerm && !transaction.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !transaction.requester?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Reason filter
    if (filterReason && transaction.transaction_reason !== filterReason) {
      return false;
    }
    
    // Date range filter (start)
    if (dateRangeStart) {
      const startDate = new Date(dateRangeStart);
      const transactionDate = new Date(transaction.transaction_date);
      if (transactionDate < startDate) {
        return false;
      }
    }
    
    // Date range filter (end)
    if (dateRangeEnd) {
      const endDate = new Date(dateRangeEnd);
      endDate.setHours(23, 59, 59, 999); // Set to end of day
      const transactionDate = new Date(transaction.transaction_date);
      if (transactionDate > endDate) {
        return false;
      }
    }
    
    return true;
  });
  
  // Navigate to create page
  const handleCreateNew = () => {
    router.push('/dashboard/stock-out/create');
  };
  
  // Toggle filter panel
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilterReason('');
    setDateRangeStart('');
    setDateRangeEnd('');
  };
  
  // Get reason badge color
  const getReasonBadgeColor = (reason: string) => {
    switch(reason) {
      case 'direct_request':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'incident':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'regular':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Get reason icon
  const getReasonIcon = (reason: string) => {
    switch(reason) {
      case 'direct_request':
        return <User className="h-3 w-3 mr-1" />;
      case 'incident':
        return <AlertCircle className="h-3 w-3 mr-1" />;
      case 'regular':
        return <Clock className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stock Out Transactions</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View and manage all outgoing inventory transactions
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Button 
              onClick={handleCreateNew}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PackageCheck className="h-4 w-4 mr-2" />
              Create New Stock Out
            </Button>
          </div>
        </div>
        
        <Card className="mb-6">
          <div className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search by reference number or requester..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={toggleFilter}
                className={isFilterOpen ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" : ""}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
              </Button>
              
              <Button variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => alert('Export as CSV')}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => alert('Export as Excel')}>
                    Export as Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => alert('Export as PDF')}>
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {isFilterOpen && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reason
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                    value={filterReason}
                    onChange={(e) => setFilterReason(e.target.value)}
                  >
                    <option value="">All Reasons</option>
                    <option value="direct_request">Direct Request</option>
                    <option value="incident">Incident</option>
                    <option value="regular">Regular</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date From
                  </label>
                  <Input
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="bg-white dark:bg-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date To
                  </label>
                  <Input
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    className="bg-white dark:bg-gray-700"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" onClick={resetFilters} className="w-full">
                    Reset Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
        
        <Card className="border border-gray-200 dark:border-gray-800 shadow-sm dark:bg-gray-800/50 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-500 dark:text-gray-400">Loading transactions...</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="py-20 text-center">
                <Package className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-1">No transactions found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reference Number
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Requester
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      PIC
                    </th>
                    <th className="px-4 py-3.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-4 py-3.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-4 py-3.5 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.map((transaction, index) => (
                    <motion.tr 
                      key={transaction.transaction_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/30'}
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.reference_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(transaction.transaction_date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {transaction.requester || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {transaction.user_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${getReasonBadgeColor(transaction.transaction_reason)}`}>
                          {getReasonIcon(transaction.transaction_reason)}
                          {formatReason(transaction.transaction_reason)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          {transaction.total_items} items
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => alert(`View details of transaction ${transaction.transaction_id}`)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert(`Print transaction ${transaction.transaction_id}`)}>
                              Print
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {filteredTransactions.length > 0 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button variant="outline" size="sm">Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredTransactions.length}</span> of{' '}
                    <span className="font-medium">{filteredTransactions.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button variant="outline" size="sm" className="rounded-l-md">Previous</Button>
                    <Button variant="outline" size="sm" className="rounded-r-md ml-2">Next</Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default StockOutPage;