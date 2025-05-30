// File: app/(pages)/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  IdCard,
  MapPin,
  Briefcase,
  Calendar,
  Mail,
  Building2,
  Shield,
  Clock,
  ExternalLink,
  Lock,
  Info,
  UserCheck,
  Settings,
  Globe,
  Activity,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ProfileField {
  label: string;
  value: string | undefined;
  icon: React.ReactNode;
  type?: "text" | "email" | "date" | "badge" | "timeago";
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  copyable?: boolean;
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for smooth UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Generate profile fields from AuthContext user data
  const getProfileFields = (): ProfileField[] => {
    if (!user) return [];

    return [
      // Personal Information
      {
        label: "Full Name",
        value: user.username || "Not Available",
        icon: <User size={18} />,
        type: "text",
        copyable: true
      },
      {
        label: "Employee ID",
        value: user.idnik || "Not Available",
        icon: <IdCard size={18} />,
        type: "text",
        copyable: true
      },
      {
        label: "Position",
        value: user.position || "Not Available",
        icon: <Briefcase size={18} />,
        type: "badge",
        badgeVariant: "default"
      },
      {
        label: "Location",
        value: user.lokasi || "Not Available",
        icon: <MapPin size={18} />,
        type: "badge",
        badgeVariant: "outline"
      },
      {
        label: "Email Address",
        value: user.username ? `${user.username.toLowerCase().replace(/\s+/g, '.')}@maagroup.co.id` : "Not Available",
        icon: <Mail size={18} />,
        type: "email"
      },
      {
        label: "Department",
        value: user.position?.includes('GA') || user.position?.includes('HRGA') 
          ? "Human Resources & General Affairs" 
          : "Inventory Management",
        icon: <Building2 size={18} />,
        type: "text"
      },
      
      // Employment Information
      {
        label: "Employment Status",
        value: "Active", // Assuming user is active if logged in
        icon: <UserCheck size={18} />,
        type: "badge",
        badgeVariant: "default"
      },
      {
        label: "Access Level",
        value: "Inventory Staff",
        icon: <Shield size={18} />,
        type: "badge",
        badgeVariant: "secondary"
      },
      {
        label: "Last Active",
        value: "Currently Online",
        icon: <Clock size={18} />,
        type: "text"
      },
      {
        label: "Session Status",
        value: "Active",
        icon: <Activity size={18} />,
        type: "badge",
        badgeVariant: "default"
      }
    ];
  };

  const profileFields = getProfileFields();
  const personalFields = profileFields.slice(0, 6);
  const employmentFields = profileFields.slice(6);

  // Copy to clipboard function
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      console.log(`${label} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Render profile field
  const renderField = (field: ProfileField, index: number) => (
    <motion.div
      key={field.label}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="space-y-2 group">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
        {field.icon}
        {field.label}
      </label>
      <div className="min-h-[2.5rem] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {field.type === "badge" ? (
            <Badge variant={field.badgeVariant || "default"}>
              {field.value}
            </Badge>
          ) : field.type === "email" ? (
            <a
              href={`mailto:${field.value}`}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
              {field.value}
            </a>
          ) : (
            <span className="text-gray-900 dark:text-gray-100 text-sm">
              {field.value}
            </span>
          )}
        </div>
        {field.copyable && field.value && field.value !== "Not Available" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => copyToClipboard(field.value!, field.label)}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </Button>
        )}
      </div>
    </motion.div>
  );

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Profile Not Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Unable to load user profile information.
          </p>
          <Link href="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Profile Information
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View your account details and information
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open('https://eip.maagroup.co.id/index.php?page=Profile', '_blank')}>
              <ExternalLink size={16} />
              Main Profile
            </Button>
          </div>
        </div>

        {/* Readonly Notice */}
        <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Lock size={16} />
              <span>
                This profile is read-only in the inventory system. To edit your information, 
                please use the main ERP system.
              </span>
            </div>
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-xl">
                  {user.username || "Unknown User"}
                </CardTitle>
                <CardDescription className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <IdCard size={14} />
                    <span>ID: {user.idnik || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Briefcase size={14} />
                    <span>{user.position || "Staff"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <MapPin size={14} />
                    <span>{user.lokasi || "Location"}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Separator className="mb-4" />
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <Activity size={12} className="mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Access Level</span>
                    <Badge variant="secondary">
                      <Shield size={12} className="mr-1" />
                      Staff
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Session</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-900 dark:text-gray-100 text-xs">Online</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Detailed Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6">
            
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Your basic profile and contact details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {personalFields.map((field, index) => renderField(field, index))}
                </div>
              </CardContent>
            </Card>

            {/* Employment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase size={20} />
                  Employment Information
                </CardTitle>
                <CardDescription>
                  Work-related details and access permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {employmentFields.map((field, index) => renderField(field, index))}
                </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings size={20} />
                  System Information
                </CardTitle>
                <CardDescription>
                  Application access and activity details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      <Globe size={18} />
                      System Access
                    </label>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Inventory Management System</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                      <Clock size={18} />
                      Session Status
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-900 dark:text-gray-100 text-sm">Active Session</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.open('https://eip.maagroup.co.id/index.php?page=Profile', '_blank')}>
            <ExternalLink size={16} />
            Edit Profile (Main System)
          </Button>
          
          <Link href="/dashboard">
            <Button variant="secondary" className="w-full sm:w-auto">
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}