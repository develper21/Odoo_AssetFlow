import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeftRight, Check, X } from "lucide-react";
import { NeuCard, PageHeader, Badge, toneForStatus } from "@/components/app/ui";
import { ALLOCATIONS } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/allocations")({
  component: AllocationsPage,
});

function AllocationsPage() {
  const pending = ALLOCATIONS.filter((a) => a.status === "Pending");
  const active = ALLOCATIONS.filter((a) => a.status !== "Pending");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Allocations & Transfers"
        subtitle="Approve pending transfer requests and manage active allocations."
        actions={
          <button className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <ArrowLeftRight className="h-4 w-4" /> New allocation
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <NeuCard className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">Active allocations</h3>
          <div className="space-y-2">
            {active.map((a) => (
              <div key={a.id} className="neu-inset flex flex-wrap items-center gap-3 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/20 font-mono text-xs text-primary">
                  {a.asset.slice(-3)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{a.asset} → {a.employee}</div>
                  <div className="text-xs text-muted-foreground">From {a.from}{a.to ? ` · Until ${a.to}` : ""}</div>
                </div>
                <Badge tone={toneForStatus(a.status)}>{a.status}</Badge>
              </div>
            ))}
          </div>
        </NeuCard>

        <NeuCard>
          <h3 className="mb-4 text-lg font-semibold">Pending approvals</h3>
          <div className="space-y-3">
            {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending requests.</p>}
            {pending.map((a) => (
              <div key={a.id} className="neu-inset space-y-3 p-3">
                <div>
                  <div className="font-medium">{a.asset}</div>
                  <div className="text-xs text-muted-foreground">Requested by {a.employee} · {a.from}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toast.success("Approved")} className="neu-accent flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold">
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button onClick={() => toast.error("Rejected")} className="neu-sm flex flex-1 items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs">
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </NeuCard>
      </div>
    </div>
  );
}
