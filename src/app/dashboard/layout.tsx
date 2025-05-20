// dashboard/layout.tsx
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Nav item type definition
interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
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

  // Handle theme switching
  useEffect(() => {
    // Check if user has preferred dark mode before
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    setIsLoaded(true);
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
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

  // Navigation items with their paths and icons
  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      description: "Overview of inventory system",
    },
    {
      name: "Stock In",
      path: "/dashboard/stock-in",
      icon: <PackagePlus size={20} />,
      description: "Add new items to inventory",
    },
    {
      name: "Stock Out",
      path: "/dashboard/stock-out",
      icon: <PackageCheck size={20} />,
      description: "Process items leaving inventory",
    },
    {
      name: "Defects", // Tambahkan menu Defects
      path: "/dashboard/defects",
      icon: <AlertTriangle size={20} />, // Gunakan icon yang sesuai
      description: "Manage defective items",
    },
    {
      name: "Products",
      path: "/dashboard/products",
      icon: <Package size={20} />,
      description: "Manage product catalog",
    },
    {
      name: "Warehouses",
      path: "/dashboard/warehouses",
      icon: <Warehouse size={20} />,
      description: "Manage storage locations",
    },
    {
      name: "Categories",
      path: "/dashboard/categories",
      icon: <Tags size={20} />,
      description: "Organize product categories",
    },
    {
      name: "Suppliers",
      path: "/dashboard/suppliers",
      icon: <Truck size={20} />,
      description: "Manage vendor relationships",
    },
    {
      name: "Reports", // Tampilkan menu Reports
      path: "/dashboard/reports",
      icon: <BarChart3 size={20} />,
      description: "View inventory analytics",
    },
  ];

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
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.divisi || "Admin"}
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
                    className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="p-2 divide-y divide-gray-100 dark:divide-gray-700">
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/dashboard/profile"
                          className="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                          Profile Settings
                        </Link>
                        <button
                          className="w-full text-left group flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"
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
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`
                        flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors
                        ${
                          pathname === item.path
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}>
                      <span
                        className={`mr-3 ${pathname === item.path ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 dark:text-red-400"
                    onClick={logout}>
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
            <div className="px-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    relative group flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors
                    ${
                      pathname === item.path
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                  `}>
                  <span
                    className={`${pathname === item.path ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"}`}>
                    {item.icon}
                  </span>
                  <AnimatePresence initial={false}>
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3 whitespace-nowrap overflow-hidden">
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed sidebar */}
                  {!isSidebarOpen && item.description && (
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
              ))}
            </div>
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
