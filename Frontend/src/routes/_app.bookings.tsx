import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck, Plus } from "lucide-react";
import { NeuCard, PageHeader, Badge, toneForStatus } from "@/components/app/ui";
import { BOOKINGS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/bookings")({
  component: BookingsPage,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function BookingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Resource Booking"
        subtitle="Book conference rooms, vehicles, cameras, and other shared resources."
        actions={
          <button className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4" /> New booking
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <NeuCard className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">This week</h3>
            <Badge tone="primary">Jul 13 – 19</Badge>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((d, i) => (
              <div key={d} className="neu-inset p-3">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{d}</div>
                <div className="mt-1 font-display text-xl font-semibold">{13 + i}</div>
                <div className="mt-3 space-y-1.5">
                  {BOOKINGS.filter((_, j) => j % 7 === i).slice(0, 2).map((b) => (
                    <div key={b.id} className="rounded-md bg-primary/15 px-2 py-1 text-[10px] font-medium text-primary">
                      {b.slot.split("–")[0]} · {b.resource.split(" ")[0]}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </NeuCard>

        <NeuCard className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">Upcoming bookings</h3>
          <ul className="space-y-2">
            {BOOKINGS.map((b) => (
              <li key={b.id} className="neu-inset flex items-center gap-3 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/20 text-primary">
                  <CalendarCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{b.resource}</div>
                  <div className="text-xs text-muted-foreground">{b.date} · {b.slot} · {b.requester}</div>
                </div>
                <Badge tone={toneForStatus(b.status)}>{b.status}</Badge>
              </li>
            ))}
          </ul>
        </NeuCard>
      </div>
    </div>
  );
}
