"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  CheckCircle2,
} from "lucide-react";

import { getRecentActivities } from "@/services/activity.service";

export default function ActivityPage() {
  const activityQuery = useQuery({
    queryKey: ["recent-activity"],
    queryFn: getRecentActivities,
  });

  return (
    <section>
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Activity
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          View recent actions across the TaskFlow system.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light text-primary">
            <Activity size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-text-primary">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Latest recorded actions and updates.
            </p>
          </div>
        </div>

        {activityQuery.isPending && (
          <div className="space-y-4 p-6">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-lg bg-background"
              />
            ))}
          </div>
        )}

        {activityQuery.isError && (
          <div className="p-6 text-sm text-danger">
            Unable to load activity.
          </div>
        )}

        {activityQuery.data &&
          activityQuery.data.length === 0 && (
            <div className="flex min-h-64 flex-col items-center justify-center p-10 text-center">
              <CheckCircle2
                size={40}
                className="text-success"
              />

              <p className="mt-4 font-semibold text-text-primary">
                No activity found
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                New system actions will appear here.
              </p>
            </div>
          )}

        {activityQuery.data &&
          activityQuery.data.length > 0 && (
            <div className="divide-y divide-border">
              {activityQuery.data.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-background"
                >
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="font-semibold text-text-primary">
                        {activity.action.replaceAll("_", " ")}
                      </p>

                      <p className="text-xs text-text-secondary">
                        {new Date(
                          activity.createdAt,
                        ).toLocaleString()}
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-text-secondary">
                      {activity.description}
                    </p>

                    {activity.user && (
                      <p className="mt-2 text-xs text-text-secondary">
                        Performed by{" "}
                        <span className="font-medium text-text-primary">
                          {activity.user.firstName}{" "}
                          {activity.user.lastName}
                        </span>
                      </p>
                    )}

                    <p className="mt-1 text-xs text-text-secondary">
                      Entity:{" "}
                      {activity.entityType.replaceAll(
                        "_",
                        " ",
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>
    </section>
  );
}