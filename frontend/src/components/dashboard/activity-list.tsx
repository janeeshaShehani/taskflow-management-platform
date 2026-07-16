interface ActivityItem {
  id: string;
  action: string;
  description: string;
  createdAt: string;
}

interface ActivityListProps {
  title: string;
  activities: ActivityItem[];
}

export default function ActivityList({
  title,
  activities,
}: ActivityListProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="mb-5 text-lg font-semibold text-text-primary">
        {title}
      </h3>

      {activities.length === 0 ? (
        <p className="text-sm text-text-secondary">
          No recent activity.
        </p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="border-b border-border pb-3 last:border-none"
            >
              <p className="font-medium text-text-primary">
                {activity.action}
              </p>

              <p className="text-sm text-text-secondary">
                {activity.description}
              </p>

              <p className="mt-1 text-xs text-text-secondary">
                {new Date(activity.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}