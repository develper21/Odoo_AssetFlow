import { useEffect, useState } from "react";
import { ArrowLeftRight, Check, X } from "lucide-react";
import { NeuCard, PageHeader, Badge, toneForStatus } from "@/components/layout/ui";
import { toast } from "sonner";
import { allocationsApi, assetsApi, employeesApi } from "@/lib/api";

function AllocationsPage() {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allocationsData, assetsData, employeesData] = await Promise.all([
          allocationsApi.getAll(),
          assetsApi.getAll(),
          employeesApi.getAll(),
        ]);
        setAllocations(allocationsData.allocations || []);
        setAssets(assetsData.assets || []);
        setEmployees(employeesData.employees || []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pending = allocations.filter((a) => a.status === "pending" || a.status === "Pending");
  const active = allocations.filter((a) => a.status !== "pending" && a.status !== "Pending");

  const handleCreateAllocation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const data: any = Object.fromEntries(formData.entries());
      
      // Convert types for FormData
      if (data.expectedReturnDate) data.expectedReturnDate = new Date(data.expectedReturnDate).toISOString();
      
      await allocationsApi.checkout(data);
      toast.success("Allocation created successfully");
      setShowForm(false);
      // Refresh allocations
      const allocationsData = await allocationsApi.getAll();
      setAllocations(allocationsData.allocations || []);
    } catch (error: any) {
      console.error('Failed to create allocation:', error);
      toast.error(error.message || "Failed to create allocation");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Allocations & Transfers"
        subtitle="Approve pending transfer requests and manage active allocations."
        actions={
          <button onClick={() => setShowForm((v) => !v)} className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <ArrowLeftRight className="h-4 w-4" /> New allocation
          </button>
        }
      />

      {showForm && (
        <NeuCard>
          <h3 className="mb-4 text-lg font-semibold">Create new allocation</h3>
          <form
            onSubmit={handleCreateAllocation}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {[
              { l: "Asset", p: "Select asset", n: "asset", isSelect: true, options: assets },
              { l: "Allocation type", p: "Select type", n: "allocateToType", isSelect: true, options: [{_id: 'User', name: 'User'}, {_id: 'Department', name: 'Department'}] },
              { l: "Employee", p: "Select employee", n: "allocatedTo", isSelect: true, options: employees },
              { l: "Check-out condition", p: "Asset condition during checkout", n: "checkOutCondition" },
              { l: "Expected return date", p: "2026-08-12", n: "expectedReturnDate", type: "date" },
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
                      <option key={opt._id} value={opt._id}>{f.n === 'asset' ? `${opt.name} (${opt.serialNumber})` : `${opt.firstName} ${opt.lastName}`}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    name={f.n}
                    type={f.type || "text"}
                    placeholder={f.p} 
                    className="neu-inset w-full rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none" 
                  />
                )}
              </label>
            ))}
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="neu-sm rounded-xl px-4 py-2.5 text-sm">Cancel</button>
              <button type="submit" className="neu-accent rounded-xl px-4 py-2.5 text-sm font-semibold">Create allocation</button>
            </div>
          </form>
        </NeuCard>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <NeuCard className="lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">Active allocations</h3>
          {loading ? (
            <div className="text-center text-muted-foreground py-4">Loading...</div>
          ) : (
            <div className="space-y-2">
              {active.map((a: any) => (
                <div key={a._id} className="neu-inset flex flex-wrap items-center gap-3 p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/20 font-mono text-xs text-primary">
                    {a.asset?.serialNumber?.slice(-3) || 'N/A'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{a.asset?.serialNumber || 'Unknown'} → {a.allocatedTo?.firstName && a.allocatedTo?.lastName ? `${a.allocatedTo.firstName} ${a.allocatedTo.lastName}` : 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">From {new Date(a.allocatedDate).toLocaleDateString()}{a.expectedReturnDate ? ` · Until ${new Date(a.expectedReturnDate).toLocaleDateString()}` : ""}</div>
                  </div>
                  <Badge tone={toneForStatus(a.status)}>{a.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </NeuCard>

        <NeuCard>
          <h3 className="mb-4 text-lg font-semibold">Pending approvals</h3>
          {loading ? (
            <div className="text-center text-muted-foreground py-4">Loading...</div>
          ) : (
            <div className="space-y-3">
              {pending.length === 0 && <p className="text-sm text-muted-foreground">No pending requests.</p>}
              {pending.map((a: any) => (
                <div key={a._id} className="neu-inset space-y-3 p-3">
                  <div>
                    <div className="font-medium">{a.asset?.serialNumber || 'Unknown'}</div>
                    <div className="text-xs text-muted-foreground">Requested by {a.allocatedTo?.firstName && a.allocatedTo?.lastName ? `${a.allocatedTo.firstName} ${a.allocatedTo.lastName}` : 'Unknown'} · {new Date(a.allocatedDate).toLocaleDateString()}</div>
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
          )}
        </NeuCard>
      </div>
    </div>
  );
}

export default AllocationsPage;
