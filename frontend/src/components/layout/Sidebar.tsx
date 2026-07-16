"use client";

import {
  Activity,
  Bell,
  CheckSquare,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
    roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
  },
  {
    label: "Activity",
    href: "/activity",
    icon: Activity,
    roles: ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"],
  },
];

export default function Sidebar({
  mobile = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();

    if (mobile) {
      onClose?.();
    }

    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border bg-surface shadow-lg">
      {/* Brand */}
      <div className="flex h-18 items-center justify-between border-b border-border px-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            TaskFlow
          </h1>

          <p className="text-xs text-text-secondary">
            Project Management
          </p>
        </div>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-background lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {navigationItems
          .filter((item) =>
            user ? item.roles.includes(user.role) : false,
          )
          .map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (mobile) {
                    onClose?.();
                  }
                }}
                className={[
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  isActive
                    ? "bg-primary-light text-primary"
                    : "text-text-secondary hover:bg-primary-light/60 hover:text-primary",
                ].join(" ")}
              >
                <Icon size={19} />

                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      {/* User */}
      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-background p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            {user?.firstName?.charAt(0) ?? "U"}
            {user?.lastName?.charAt(0) ?? ""}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">
              {user
                ? `${user.firstName} ${user.lastName}`
                : "TaskFlow User"}
            </p>

            <p className="truncate text-xs text-text-secondary">
              {user?.role.replaceAll("_", " ") ?? ""}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-danger transition hover:bg-red-50"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
}