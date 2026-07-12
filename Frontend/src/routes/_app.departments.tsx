import { createFileRoute } from "@tanstack/react-router";
import { Building2, Plus } from "lucide-react";
import { NeuCard, PageHeader } from "@/components/app/ui";
import { DEPARTMENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/departments")({
  component: DepartmentsPage,
});

function DepartmentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle="Organizational units, heads, and asset footprint."
        actions={
          <button className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4" /> New department
          </button>
        }
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DEPARTMENTS.map((d) => (
          <NeuCard key={d.id}>
            <div className="mb-4 flex items-start justify-between">
              <div className="neu-inset grid h-11 w-11 place-items-center text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="text-xs text-muted-foreground">Head</span>
            </div>
            <h3 className="text-lg font-semibold">{d.name}</h3>
            <p className="text-sm text-muted-foreground">{d.head}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-center">
              <div className="neu-inset p-3">
                <div className="font-display text-xl font-semibold">{d.employees}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Employees</div>
              </div>
              <div className="neu-inset p-3">
                <div className="font-display text-xl font-semibold">{d.assets}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Assets</div>
              </div>
            </div>
          </NeuCard>
        ))}
      </div>
    </div>
  );
}
