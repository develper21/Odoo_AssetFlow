import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { NeuCard, PageHeader, Badge, toneForStatus } from "@/components/layout/ui";
import { toast } from "sonner";
import { maintenanceApi, assetsApi } from "@/lib/api";

const STAGES: ("Pending" | "Approved" | "Assigned" | "In Progress" | "Resolved")[] = ["Pending", "Approved", "Assigned", "In Progress", "Resolved"];

function MaintenancePage() {
  const [maintenance, setMaintenance] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [maintenanceData, assetsData] = await Promise.all([
          maintenanceApi.getAll(),
          assetsApi.getAll(),
        ]);
        setMaintenance(maintenanceData.requests || []);
        setAssets(assetsData.assets || []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateMaintenance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const data: any = Object.fromEntries(formData.entries());
      
      await maintenanceApi.create(data);
      toast.success("Maintenance request created successfully");
      setShowForm(false);
      // Refresh maintenance requests
      const maintenanceData = await maintenanceApi.getAll();
      setMaintenance(maintenanceData.requests || []);
    } catch (error: any) {
      console.error('Failed to create maintenance request:', error);
      toast.error(error.message || "Failed to create maintenance request");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Maintenance"
        subtitle="Track requests through the full lifecycle from report to resolution."
        actions={
          <button onClick={() => setShowForm((v) => !v)} className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4" /> Raise request
          </button>
        }
      />

      {showForm && (
        <NeuCard>
          <h3 className="mb-4 text-lg font-semibold">Raise maintenance request</h3>
          <form
            onSubmit={handleCreateMaintenance}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {[
              { l: "Asset", p: "Select asset", n: "asset", isSelect: true, options: assets },
              { l: "Priority", p: "high", n: "priority", isSelect: true, options: [{_id: 'low', name: 'Low'}, {_id: 'medium', name: 'Medium'}, {_id: 'high', name: 'High'}, {_id: 'critical', name: 'Critical'}] },
              { l: "Issue description", p: "Describe the issue (min 5 chars)", n: "issueDescription" },
            ].map((f) => (
              <label key={f.n} className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{f.l}</span>
                {f.isSelect ? (
                  <select 
                    name={f.n}
                    className="neu-inset w-full rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="">Select {f.l.toLowerCase()}</option>
                    {f.options.map((opt: any) => (
                      <option key={opt._id} value={opt._id}>{opt.name} ({opt.serialNumber})</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    name={f.n}
                    type="text"
                    placeholder={f.p} 
                    className="neu-inset w-full rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none" 
                  />
                )}
              </label>
            ))}
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="neu-sm rounded-xl px-4 py-2.5 text-sm">Cancel</button>
              <button type="submit" className="neu-accent rounded-xl px-4 py-2.5 text-sm font-semibold">Submit request</button>
            </div>
          </form>
        </NeuCard>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {STAGES.map((s) => {
            const stageKey = s.toLowerCase().replace(' ', '_');
            const items = maintenance.filter((m) => m.status === stageKey || m.status === s.toLowerCase());
            return (
              <div key={s} className="neu p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{s}</div>
                  <Badge tone={toneForStatus(s)}>{items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {items.map((m: any) => (
                    <div key={m._id} className="neu-inset p-3">
                      <div className="text-sm font-medium">{m.asset?.serialNumber || 'Unknown'}</div>
                      <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{m.issueDescription}</div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{m.raisedBy?.firstName && m.raisedBy?.lastName ? `${m.raisedBy.firstName} ${m.raisedBy.lastName}` : 'Unknown'}</span>
                        <Badge tone={m.priority === "high" ? "danger" : m.priority === "medium" ? "warn" : "neutral"}>
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
      )}
    </div>
  );
}

export default MaintenancePage;
