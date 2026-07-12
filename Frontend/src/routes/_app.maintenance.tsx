import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader, Badge, toneForStatus } from "@/components/app/ui";
import { MAINTENANCE, type MaintenanceStage } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/maintenance")({
  component: MaintenancePage,
});

const STAGES: MaintenanceStage[] = ["Pending", "Approved", "Assigned", "In Progress", "Resolved"];

function MaintenancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        subtitle="Track requests through the full lifecycle from report to resolution."
        actions={
          <button className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4" /> Raise request
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {STAGES.map((s) => {
          const items = MAINTENANCE.filter((m) => m.stage === s);
          return (
            <div key={s} className="neu p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s}</div>
                <Badge tone={toneForStatus(s)}>{items.length}</Badge>
              </div>
              <div className="space-y-2">
                {items.map((m) => (
                  <div key={m.id} className="neu-inset p-3">
                    <div className="text-sm font-medium">{m.asset}</div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{m.issue}</div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>{m.reporter}</span>
                      <Badge tone={m.priority === "High" ? "danger" : m.priority === "Medium" ? "warn" : "neutral"}>
                        {m.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
                {items.length === 0 && <p className="text-xs text-muted-foreground">Empty</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
