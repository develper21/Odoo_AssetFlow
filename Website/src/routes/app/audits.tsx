import { useEffect, useState } from "react";
import { ShieldCheck, Plus, AlertTriangle } from "lucide-react";
import { NeuCard, PageHeader, Badge, toneForStatus } from "@/components/layout/ui";
import { toast } from "sonner";
import { auditsApi, employeesApi, departmentsApi } from "@/lib/api";

function AuditsPage() {
  const [audits, setAudits] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [auditsData, employeesData, departmentsData] = await Promise.all([
          auditsApi.getAll(),
          employeesApi.getAll(),
          departmentsApi.getAll(),
        ]);
        setAudits(auditsData.cycles || []);
        setEmployees(employeesData.employees || []);
        setDepartments(departmentsData.departments || []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateAudit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const data: any = Object.fromEntries(formData.entries());
      
      // Convert types for FormData
      if (data.startDate) data.startDate = new Date(data.startDate).toISOString();
      if (data.endDate) data.endDate = new Date(data.endDate).toISOString();
      
      // Handle multi-select for auditors
      if (data.auditors) {
        data.auditors = Array.isArray(data.auditors) ? data.auditors : [data.auditors];
      }
      
      await auditsApi.create(data);
      toast.success("Audit cycle created successfully");
      setShowForm(false);
      // Refresh audits
      const auditsData = await auditsApi.getAll();
      setAudits(auditsData.cycles || []);
    } catch (error: any) {
      console.error('Failed to create audit cycle:', error);
      toast.error(error.message || "Failed to create audit cycle");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Cycles"
        subtitle="Plan inventory audits, verify assets, and resolve discrepancies."
        actions={
          <button onClick={() => setShowForm((v) => !v)} className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4" /> New cycle
          </button>
        }
      />

      {showForm && (
        <NeuCard>
          <h3 className="mb-4 text-lg font-semibold">Create new audit cycle</h3>
          <form
            onSubmit={handleCreateAudit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {[
              { l: "Cycle name", p: "Q3 2026 Audit", n: "name" },
              { l: "Department", p: "Select department (optional)", n: "department", isSelect: true, options: departments },
              { l: "Auditors", p: "Select auditors", n: "auditors", isMulti: true, options: employees },
              { l: "Location", p: "Building A (optional)", n: "location" },
              { l: "Start date", p: "2026-07-12", n: "startDate", type: "date" },
              { l: "End date", p: "2026-07-20", n: "endDate", type: "date" },
            ].map((f) => (
              <label key={f.n} className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{f.l}</span>
                {f.isMulti ? (
                  <select 
                    name={f.n}
                    multiple
                    className="neu-inset w-full rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none"
                  >
                    {f.options.map((opt: any) => (
                      <option key={opt._id} value={opt._id}>{opt.firstName} {opt.lastName}</option>
                    ))}
                  </select>
                ) : f.isSelect ? (
                  <select 
                    name={f.n}
                    className="neu-inset w-full rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none"
                  >
                    <option value="">Select {f.l.toLowerCase()}</option>
                    {f.options.map((opt: any) => (
                      <option key={opt._id} value={opt._id}>{opt.name}</option>
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
              <button type="submit" className="neu-accent rounded-xl px-4 py-2.5 text-sm font-semibold">Create cycle</button>
            </div>
          </form>
        </NeuCard>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {audits.map((a: any) => (
            <NeuCard key={a._id}>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="neu-inset grid h-11 w-11 place-items-center text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{a.name}</h3>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                  </div>
                </div>
                <Badge tone={toneForStatus(a.status)}>{a.status}</Badge>
              </div>

              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">{a.progress || 0}%</span>
              </div>
              <div className="neu-inset h-3 overflow-hidden rounded-full">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${a.progress || 0}%` }} />
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" /> {a.discrepanciesFound || 0} discrepancies
                </span>
                <button className="neu-sm rounded-xl px-3 py-1.5 text-xs">View report</button>
              </div>
            </NeuCard>
          ))}
        </div>
      )}
    </div>
  );
}

export default AuditsPage;
