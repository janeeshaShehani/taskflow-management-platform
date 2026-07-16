"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell, Menu } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/providers/auth-provider";
import { getNotifications } from "@/services/notification.service";

interface TopNavbarProps {
  onOpenSidebar: () => void;
}

export default function TopNavbar({
  onOpenSidebar,
}: TopNavbarProps) {
  const { user } = useAuth();

  const notificationQuery = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: getNotifications,
    enabled: Boolean(user),
  });

  const unreadCount =
    notificationQuery.data?.unreadCount ?? 0;

  return (
    <header className="sticky top-0 z-30 flex min-h-18 items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-text-secondary transition hover:bg-primary-light hover:text-primary lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-text-primary sm:text-xl">
            Welcome Back
          </h2>

          <p className="truncate text-xs text-text-secondary sm:text-sm">
            {user
              ? `${user.firstName} ${user.lastName}`
              : "TaskFlow User"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
        <Link
          href="/notifications"
          aria-label="Open notifications"
          className="relative rounded-full p-2 transition hover:bg-primary-light"
        >
          <Bell
            size={21}
            className="text-text-secondary"
          />

          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white sm:h-10 sm:w-10">
            {user?.firstName?.charAt(0) ?? "U"}
            {user?.lastName?.charAt(0) ?? ""}
          </div>

          <div className="hidden min-w-0 sm:block">
            <p className="max-w-40 truncate text-sm font-semibold text-text-primary">
              {user
                ? `${user.firstName} ${user.lastName}`
                : "User"}
            </p>

            <p className="max-w-40 truncate text-xs text-text-secondary">
              {user?.role.replaceAll("_", " ") ?? ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}