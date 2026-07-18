import { useEffect, useState } from "react";
import { Building2, Plus } from "lucide-react";
import { NeuCard, PageHeader } from "@/components/layout/ui";
import { toast } from "sonner";
import { departmentsApi, reportsApi } from "@/lib/api";

function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentSummary, setDepartmentSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptData, summaryData] = await Promise.all([
          departmentsApi.getAll(),
          reportsApi.getDepartmentSummary(),
        ]);
        setDepartments(deptData.departments || []);
        setDepartmentSummary(summaryData || []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const data: any = Object.fromEntries(formData.entries());
      
      await departmentsApi.create(data);
      toast.success("Department created successfully");
      setShowForm(false);
      // Refresh departments
      const departmentsData = await departmentsApi.getAll();
      setDepartments(departmentsData.departments || []);
    } catch (error: any) {
      console.error('Failed to create department:', error);
      toast.error(error.message || "Failed to create department");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        subtitle="Organizational units, heads, and asset footprint."
        actions={
          <button onClick={() => setShowForm((v) => !v)} className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Plus className="h-4 w-4" /> New department
          </button>
        }
      />

      {showForm && (
        <NeuCard>
          <h3 className="mb-4 text-lg font-semibold">Create new department</h3>
          <form
            onSubmit={handleCreateDepartment}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {[
              { l: "Department name", p: "Engineering", n: "name" },
              { l: "Department code", p: "ENG", n: "code" },
              { l: "Location", p: "Building A", n: "location" },
              { l: "Description", p: "Department description", n: "description" },
            ].map((f) => (
              <label key={f.n} className="block">
                <span className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">{f.l}</span>
                <input 
                  name={f.n}
                  type="text"
                  placeholder={f.p} 
                  className="neu-inset w-full rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none" 
                />
              </label>
            ))}
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="neu-sm rounded-xl px-4 py-2.5 text-sm">Cancel</button>
              <button type="submit" className="neu-accent rounded-xl px-4 py-2.5 text-sm font-semibold">Create department</button>
            </div>
          </form>
        </NeuCard>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((d: any) => {
            // Find matching summary data for this department
            const summary = departmentSummary.find((s: any) => s._id === d._id);
            const assetCount = summary?.totalAssetCount || 0;
            const totalValue = summary?.totalValue || 0;
            
            return (
              <NeuCard key={d._id}>
                <div className="mb-4 flex items-start justify-between">
                  <div className="neu-inset grid h-11 w-11 place-items-center text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-muted-foreground">Head</span>
                </div>
                <h3 className="text-lg font-semibold">{d.name}</h3>
                <p className="text-sm text-muted-foreground">{d.headOfDepartment?.firstName && d.headOfDepartment?.lastName ? `${d.headOfDepartment.firstName} ${d.headOfDepartment.lastName}` : 'Not assigned'}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="neu-inset p-3">
                    <div className="font-display text-xl font-semibold">{d.employeeCount || d.employees?.length || 0}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Employees</div>
                  </div>
                  <div className="neu-inset p-3">
                    <div className="font-display text-xl font-semibold">{assetCount}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Assets</div>
                  </div>
                </div>
                {totalValue > 0 && (
                  <div className="mt-2 text-center">
                    <div className="text-xs text-muted-foreground">Total Value</div>
                    <div className="font-semibold">${totalValue.toLocaleString()}</div>
                  </div>
                )}
              </NeuCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DepartmentsPage;
