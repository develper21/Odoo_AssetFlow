import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Boxes, CalendarCheck, ArrowLeftRight, Wrench, ShieldCheck } from "lucide-react";
import { NeuCard, PageHeader, Badge } from "@/components/app/ui";
import { notificationsApi } from "@/lib/api";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsPage,
});

const ICONS = {
  asset: Boxes, booking: CalendarCheck, transfer: ArrowLeftRight,
  maintenance: Wrench, audit: ShieldCheck,
} as const;

function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await notificationsApi.getAll();
        setNotifications(data.notifications || []);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="All updates from assets, bookings, transfers, maintenance, and audits."
        actions={
          <button className="neu-sm inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
            <Bell className="h-4 w-4" /> Mark all read
          </button>
        }
      />
      <NeuCard>
        {loading ? (
          <div className="text-center text-muted-foreground py-10">Loading...</div>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n: any) => {
              const Icon = ICONS[n.type as keyof typeof ICONS] || Boxes;
              return (
                <li key={n._id} className="neu-inset flex items-start gap-3 p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/20 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{n.title}</span>
                      {!n.isRead && <Badge tone="primary">New</Badge>}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.message}</p>
                  </div>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</span>
                </li>
              );
            })}
          </ul>
        )}
      </NeuCard>
    </div>
  );
}
