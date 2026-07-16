"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
} from "lucide-react";

import { getNotifications } from "@/services/notification.service";

export default function NotificationsPage() {
  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  });

  return (
    <section>
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Notifications
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          View task assignments and system updates.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-semibold text-text-primary">
              All Notifications
            </h2>

            {notificationsQuery.data && (
              <p className="mt-1 text-sm text-text-secondary">
                {notificationsQuery.data.unreadCount} unread notification
                {notificationsQuery.data.unreadCount === 1 ? "" : "s"}
              </p>
            )}
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
            <Bell size={20} />
          </div>
        </div>

        {notificationsQuery.isPending && (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-lg bg-background"
              />
            ))}
          </div>
        )}

        {notificationsQuery.isError && (
          <div className="p-6 text-sm text-danger">
            Unable to load notifications.
          </div>
        )}

        {notificationsQuery.data &&
          notificationsQuery.data.notifications.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center p-10 text-center">
              <CheckCircle2
                size={40}
                className="text-success"
              />

              <p className="mt-4 font-semibold text-text-primary">
                You are all caught up
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                There are no notifications to display.
              </p>
            </div>
          )}

        {notificationsQuery.data &&
          notificationsQuery.data.notifications.length > 0 && (
            <div className="divide-y divide-border">
              {notificationsQuery.data.notifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    className={[
                      "flex items-start gap-4 px-5 py-4",
                      notification.isRead
                        ? "bg-surface"
                        : "bg-primary-light/40",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "mt-2 h-2.5 w-2.5 shrink-0 rounded-full",
                        notification.isRead
                          ? "bg-border"
                          : "bg-primary",
                      ].join(" ")}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-text-primary">
                        {notification.title}
                      </p>

                      <p className="mt-1 text-sm text-text-secondary">
                        {notification.message}
                      </p>

                      {notification.task && (
                        <p className="mt-2 text-xs font-medium text-primary">
                          Task: {notification.task.title}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-text-secondary">
                        {new Date(
                          notification.createdAt,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
      </div>
    </section>
  );
}