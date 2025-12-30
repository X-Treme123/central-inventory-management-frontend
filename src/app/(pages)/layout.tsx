"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  PackageCheck,
  PackagePlus,
  Warehouse,
  Tags,
  Truck,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Moon,
  Sun,
  User,
  Menu,
  X,
  Bell,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  Package2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Cookies from 'js-cookie';

// Nav item type definition
interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
  children?: NavItem[];
  isGroup?: boolean;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
    stock: pathname.startsWith('/stock') // Auto expand if currently on stock page
  });

  // Handle theme switching using cookies instead of localStorage
  useEffect(() => {
    // Check if user has preferred dark mode before
    const savedTheme = Cookies.get("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    setIsLoaded(true);
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      Cookies.set("theme", "light", { expires: 365 });
    } else {
      document.documentElement.classList.add("dark");
      Cookies.set("theme", "dark", { expires: 365 });
    }
    setIsDarkMode(!isDarkMode);
  };

  // Check window size on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Call once on mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle group expansion
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  // Navigation items with their paths and icons - Enhanced with stock grouping
  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      description: "Overview of inventory system",
    },
    {
      name: "Stock Management",
      path: "/stock",
      icon: <Package2 size={20} />,
      description: "Manage inventory transactions",
      isGroup: true,
      children: [
        {
          name: "Stock In",
          path: "/stock/in",
          icon: <PackagePlus size={18} />,
          description: "Add new items to inventory",
        },
        {
          name: "Stock Out",
          path: "/stock/out",
          icon: <PackageCheck size={18} />,
          description: "Process items leaving inventory",
        },
      ]
    },
    {
      name: "Products",
      path: "/products",
      icon: <Package size={20} />,
      description: "Manage product catalog",
    },
    {
      name: "Warehouses",
      path: "/warehouses",
      icon: <Warehouse size={20} />,
      description: "Manage storage locations",
    },
    {
      name: "Categories",
      path: "/categories",
      icon: <Tags size={20} />,
      description: "Organize product categories",
    },
    {
      name: "Suppliers",
      path: "/suppliers",
      icon: <Truck size={20} />,
      description: "Manage vendor relationships",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <BarChart3 size={20} />,
      description: "View inventory analytics",
    },
  ];

  // Check if any stock path is active
  const isStockActive = pathname.startsWith('/stock');

  // Auto expand stock group if we're on a stock page
  useEffect(() => {
    if (isStockActive && !expandedGroups.stock) {
      setExpandedGroups(prev => ({ ...prev, stock: true }));
    }
  }, [pathname, isStockActive]);

  const renderNavItem = (item: NavItem, isMobile = false) => {
    if (item.isGroup) {
      const isExpanded = expandedGroups.stock;
      const hasActiveChild = item.children?.some(child => 
        pathname === child.path || pathname.startsWith(child.path + '/')
      );

      return (
        <div key={item.path}>
          {/* Group Header */}
          <button
            onClick={() => toggleGroup('stock')}
            className={`
              w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
              ${
                hasActiveChild || isStockActive
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }
              group relative overflow-hidden
            `}>
            
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
              initial={{ x: '-100%' }}
              whileHover={{ x: 0 }}
              transition={{ duration: 0.3 }}
            />
            
            <span
              className={`relative z-10 ${
                hasActiveChild || isStockActive
                  ? "text-blue-600 dark:text-blue-400" 
                  : "text-gray-500 dark:text-gray-400"
              }`}>
              {item.icon}
            </span>
            
            {(isSidebarOpen || isMobile) && (
              <>
                <motion.span
                  className="ml-3 whitespace-nowrap overflow-hidden relative z-10"
                  initial={!isMobile ? { opacity: 0, width: 0 } : false}
                  animate={!isMobile ? { opacity: 1, width: "auto" } : false}
                  transition={{ duration: 0.2 }}>
                  {item.name}
                </motion.span>
                
                <motion.div
                  className="ml-auto relative z-10"
                  animate={{ 
                    rotate: isExpanded ? 180 : 0,
                    scale: isExpanded ? 1.1 : 1
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}>
                  <ChevronDown 
                    size={16} 
                    className={`transition-colors ${
                      hasActiveChild || isStockActive
                        ? "text-blue-600 dark:text-blue-400" 
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                </motion.div>
              </>
            )}

            {/* Tooltip for collapsed sidebar */}
            {!isSidebarOpen && !isMobile && item.description && (
              <div className="absolute left-14 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap shadow-lg">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-gray-300 dark:text-gray-400">
                    {item.description}
                  </div>
                </div>
                <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"></div>
              </div>
            )}
          </button>

          {/* Children with Animation */}
          <AnimatePresence>
            {isExpanded && (isSidebarOpen || isMobile) && item.children && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ 
                  duration: 0.3, 
                  ease: "easeOut",
                  opacity: { duration: 0.2 }
                }}
                className="overflow-hidden ml-6 space-y-1 mt-1">
                {item.children.map((child, index) => (
                  <motion.div
                    key={child.path}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ 
                      delay: index * 0.1,
                      duration: 0.3,
                      ease: "easeOut"
                    }}>
                    <Link
                      href={child.path}
                      className={`
                        relative group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                        ${
                          pathname === child.path || pathname.startsWith(child.path + '/')
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-800/60 dark:text-blue-200 shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/70 hover:text-gray-800 dark:hover:text-gray-200"
                        }
                        border-l-2 transition-all duration-200
                        ${
                          pathname === child.path || pathname.startsWith(child.path + '/')
                            ? "border-blue-500 dark:border-blue-400"
                            : "border-transparent hover:border-gray-300 dark:hover:border-gray-600"
                        }
                      `}
                      onClick={isMobile ? () => setIsMobileMenuOpen(false) : undefined}>
                      
                      {/* Animated background */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100"
                        initial={{ scale: 0.8 }}
                        whileHover={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                      
                      <span className={`relative z-10 ${
                        pathname === child.path || pathname.startsWith(child.path + '/')
                          ? "text-blue-600 dark:text-blue-300" 
                          : "text-gray-500 dark:text-gray-400"
                      }`}>
                        {child.icon}
                      </span>
                      
                      <span className="ml-3 whitespace-nowrap relative z-10">
                        {child.name}
                      </span>

                      {/* Active indicator */}
                      {(pathname === child.path || pathname.startsWith(child.path + '/')) && (
                        <motion.div
                          className="ml-auto relative z-10"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}>
                          <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                        </motion.div>
                      )}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // Regular nav item (non-group)
    return (
      <Link
        key={item.path}
        href={item.path}
        className={`
          relative group flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
          ${
            pathname === item.path || pathname.startsWith(item.path + '/')
              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }
          overflow-hidden
        `}
        onClick={isMobile ? () => setIsMobileMenuOpen(false) : undefined}>
        
        {/* Animated background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
          initial={{ x: '-100%' }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.3 }}
        />
        
        <span
          className={`relative z-10 ${
            pathname === item.path || pathname.startsWith(item.path + '/')
              ? "text-blue-600 dark:text-blue-400" 
              : "text-gray-500 dark:text-gray-400"
          }`}>
          {item.icon}
        </span>
        
        {(isSidebarOpen || isMobile) && (
          <motion.span
            initial={!isMobile ? { opacity: 0, width: 0 } : false}
            animate={!isMobile ? { opacity: 1, width: "auto" } : false}
            transition={{ duration: 0.2 }}
            className="ml-3 whitespace-nowrap overflow-hidden relative z-10">
            {item.name}
          </motion.span>
        )}

        {/* Tooltip for collapsed sidebar */}
        {!isSidebarOpen && !isMobile && item.description && (
          <div className="absolute left-14 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900 dark:bg-gray-700 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap shadow-lg">
              <div className="font-semibold">{item.name}</div>
              <div className="text-xs text-gray-300 dark:text-gray-400">
                {item.description}
              </div>
            </div>
            <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"></div>
          </div>
        )}
      </Link>
    );
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? "dark" : ""}`}>
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              type="button"
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}>
              <span className="sr-only">Open menu</span>
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo/Brand */}
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 font-bold text-lg text-blue-600 dark:text-blue-400">
              <img
                src="/images/logo.png"
                alt="MAA Logo"
                className="h-5 w-auto"
              />
            </Link>

            {/* Sidebar toggle for desktop */}
            <button
              type="button"
              className="hidden md:flex p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <span className="sr-only">
                {isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              </span>
              {isSidebarOpen ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
              <Bell size={20} />
            </button>

            {/* Help */}
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none">
              <HelpCircle size={20} />
            </button>

            {/* Dark mode toggle */}
            <button
              className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none"
              onClick={toggleDarkMode}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                  <User size={16} />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.position || "Staff"} • {user?.lokasi || "Location"}
                  </p>
                </div>
                <ChevronRight
                  size={16}
                  className={`text-gray-500 dark:text-gray-400 transition-transform ${isUserMenuOpen ? "rotate-90" : ""}`}
                />
              </button>

              {/* User dropdown */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-1 mt-2 w-80 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="p-2 divide-y divide-gray-100 dark:divide-gray-700">
                      <div className="px-3 py-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium pb-1">
                          {user?.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {user?.idnik}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user?.position} • {user?.lokasi}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard/profile"
                          className="group flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                          onClick={() => setIsUserMenuOpen(false)}>
                          <User size={16} className="mr-2" />
                          Profile Settings
                        </Link>
                        <button
                          className="w-full text-left group flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}>
                          <LogOut size={16} className="mr-2" />
                          Logout
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar/Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 bg-black"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white dark:bg-gray-900 shadow-xl flex flex-col">
                <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 font-bold text-lg text-blue-600 dark:text-blue-400"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    <Package className="h-6 w-6" />
                    <span>Inventory System</span>
                  </Link>
                  <button
                    type="button"
                    className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                    onClick={() => setIsMobileMenuOpen(false)}>
                    <span className="sr-only">Close sidebar</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                  {navItems.map((item) => renderNavItem(item, true))}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="mb-3 px-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Logged in as
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.position} • {user?.lokasi}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <motion.div
          initial={false}
          animate={{
            width: isSidebarOpen ? 260 : 80,
            transition: { duration: 0.3, ease: "easeOut" },
          }}
          className={`hidden md:block relative border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto`}>
          <div className="flex flex-col h-full py-4">
            <div className="px-3 space-y-1 flex-1">
              {navItems.map((item) => renderNavItem(item))}
            </div>

            {/* User info at bottom when sidebar is open */}
            <AnimatePresence initial={false}>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                      <User size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                        {user?.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.position} • {user?.lokasi}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto">
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}