import { Bell, CircleCheck } from "lucide-react";
import type { NotificationItem } from "@/services/notification.service";

interface NotificationListProps {
  title: string;
  unreadCount: number;
  notifications: NotificationItem[];
}

export default function NotificationList({
  title,
  unreadCount,
  notifications,
}: NotificationListProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">
            {title}
          </h3>

          <p className="mt-1 text-sm text-text-secondary">
            {unreadCount} unread notification
            {unreadCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
          <Bell size={20} />
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="flex min-h-40 flex-col items-center justify-center text-center">
          <CircleCheck
            size={32}
            className="text-success"
          />

          <p className="mt-3 font-medium text-text-primary">
            You are all caught up
          </p>

          <p className="mt-1 text-sm text-text-secondary">
            There are no notifications to display.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              className={[
                "rounded-lg border p-3",
                notification.isRead
                  ? "border-border bg-surface"
                  : "border-primary/20 bg-primary-light/50",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <span
                  className={[
                    "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                    notification.isRead
                      ? "bg-border"
                      : "bg-primary",
                  ].join(" ")}
                />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-text-primary">
                    {notification.title}
                  </p>

                  <p className="mt-1 text-sm text-text-secondary">
                    {notification.message}
                  </p>

                  <p className="mt-2 text-xs text-text-secondary">
                    {new Date(
                      notification.createdAt,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}