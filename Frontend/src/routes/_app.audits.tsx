import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Plus, AlertTriangle } from "lucide-react";
import { NeuCard, PageHeader, Badge, toneForStatus } from "@/components/app/ui";
import { AUDITS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/audits")({
  component: AuditsPage,
});

function AuditsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Cycles"
        subtitle="Plan inventory audits, verify assets, and resolve discrepancies."
        actions={
          <button className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4" /> New cycle
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {AUDITS.map((a) => (
          <NeuCard key={a.id}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="neu-inset grid h-11 w-11 place-items-center text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{a.name}</h3>
                  <p className="text-xs text-muted-foreground">{a.period}</p>
                </div>
              </div>
              <Badge tone={toneForStatus(a.status)}>{a.status}</Badge>
            </div>

            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{a.progress}%</span>
            </div>
            <div className="neu-inset h-3 overflow-hidden rounded-full">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${a.progress}%` }} />
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-4 w-4" /> {a.discrepancies} discrepancies
              </span>
              <button className="neu-sm rounded-xl px-3 py-1.5 text-xs">View report</button>
            </div>
          </NeuCard>
        ))}
      </div>
    </div>
  );
}
