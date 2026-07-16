"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  CircleCheckBig,
  Clock3,
  ListTodo,
  Users,
} from "lucide-react";
import ActivityList from "@/components/dashboard/activity-list";
import StatCard from "@/components/dashboard/stat-card";
import { useAuth } from "@/providers/auth-provider";
import { getRecentActivities } from "@/services/activity.service";
import {
  getAdminDashboard,
  getManagerDashboard,
  getMemberDashboard,
} from "@/services/dashboard.service";
import NotificationList from "@/components/dashboard/notification-list";
import { getNotifications } from "@/services/notification.service";


export default function DashboardPage() {
  const { user } = useAuth();

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", user?.role, user?.id],
    queryFn: async () => {
      if (!user) {
        throw new Error("User is not available");
      }

      if (user.role === "ADMIN") {
        return {
          role: "ADMIN" as const,
          summary: await getAdminDashboard(),
        };
      }

      if (user.role === "PROJECT_MANAGER") {
        return {
          role: "PROJECT_MANAGER" as const,
          summary: await getManagerDashboard(),
        };
      }

      return {
        role: "TEAM_MEMBER" as const,
        summary: await getMemberDashboard(),
      };
    },
    enabled: Boolean(user),
  });

  const activityQuery = useQuery({
    queryKey: ["recent-activity", user?.id],
    queryFn: getRecentActivities,
    enabled: Boolean(user),
  });

  const notificationQuery = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: getNotifications,
    enabled: Boolean(user),
  });

  if (dashboardQuery.isPending) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-text-primary">
          Dashboard
        </h1>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-xl border border-border bg-surface"
            />
          ))}
        </div>

        <div className="mt-8 h-72 animate-pulse rounded-xl border border-border bg-surface" />
      </section>
    );
  }

  if (dashboardQuery.isError || !dashboardQuery.data) {
    return (
      <section>
        <h1 className="text-2xl font-bold text-text-primary">
          Dashboard
        </h1>

        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-danger">
          Unable to load dashboard information.
        </div>
      </section>
    );
  }

  const { role, summary } = dashboardQuery.data;

  return (
    <section>
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Dashboard
        </h1>
      </div>

      {role === "ADMIN" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={summary.users.total}
            description={`${summary.users.active} active users`}
            icon={Users}
          />

          <StatCard
            title="Total Projects"
            value={summary.projects.total}
            description={`${summary.projects.active} active projects`}
            icon={BriefcaseBusiness}
          />

          <StatCard
            title="Total Tasks"
            value={summary.tasks.total}
            description="Across all projects"
            icon={ListTodo}
          />

          <StatCard
            title="Completed Tasks"
            value={summary.tasks.completed}
            description={`${summary.tasks.overdue} overdue tasks`}
            icon={CircleCheckBig}
          />
        </div>
      )}

      {role === "PROJECT_MANAGER" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="My Projects"
            value={summary.projects.total}
            description={`${summary.projects.active} active projects`}
            icon={BriefcaseBusiness}
          />

          <StatCard
            title="Team Members"
            value={summary.teamMembers}
            description="Across managed projects"
            icon={Users}
          />

          <StatCard
            title="Pending Tasks"
            value={summary.tasks.pending}
            description={`${summary.tasks.total} total tasks`}
            icon={Clock3}
          />

          <StatCard
            title="Completed Tasks"
            value={summary.tasks.completed}
            description={`${summary.tasks.overdue} overdue tasks`}
            icon={CircleCheckBig}
          />
        </div>
      )}

      {role === "TEAM_MEMBER" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Assigned Projects"
            value={summary.projects.assigned}
            description="Projects you belong to"
            icon={BriefcaseBusiness}
          />

          <StatCard
            title="Assigned Tasks"
            value={summary.tasks.assigned}
            description={`${summary.tasks.pending} pending tasks`}
            icon={ListTodo}
          />

          <StatCard
            title="Completed Tasks"
            value={summary.tasks.completed}
            description={`${summary.tasks.completionPercentage}% completion`}
            icon={CircleCheckBig}
          />

          <StatCard
            title="Overdue Tasks"
            value={summary.tasks.overdue}
            description={`${summary.tasks.highPriority} high-priority tasks`}
            icon={Clock3}
          />
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Activity */}
        <div>
          {activityQuery.isPending && (
            <div className="h-72 animate-pulse rounded-xl border border-border bg-surface" />
          )}

          {activityQuery.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-danger">
              Unable to load recent activity.
            </div>
          )}

          {activityQuery.data && (
            <ActivityList
              title="Recent Activity"
              activities={activityQuery.data}
            />
          )}
        </div>

        {/* Notifications */}
        <div>
          {notificationQuery.isPending && (
            <div className="h-72 animate-pulse rounded-xl border border-border bg-surface" />
          )}

          {notificationQuery.isError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-danger">
              Unable to load notifications.
            </div>
          )}

          {notificationQuery.data && (
            <NotificationList
              title="Notifications"
              unreadCount={notificationQuery.data.unreadCount}
              notifications={notificationQuery.data.notifications}
            />
          )}
        </div>
      </div>
    </section>
  );
}