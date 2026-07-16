"use client";

import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/providers/auth-provider";

interface DashboardRouteLayoutProps {
  children: ReactNode;
}

export default function DashboardRouteLayout({
  children,
}: DashboardRouteLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" />

          <p className="mt-3 text-sm text-text-secondary">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}