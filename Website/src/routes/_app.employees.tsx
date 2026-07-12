import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { NeuCard, PageHeader, Badge } from "@/components/app/ui";
import { toast } from "sonner";
import { employeesApi, departmentsApi } from "@/lib/api";

export const Route = createFileRoute("/_app/employees")({
  component: EmployeesPage,
});

function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesData, departmentsData] = await Promise.all([
          employeesApi.getAll(),
          departmentsApi.getAll(),
        ]);
        setEmployees(employeesData.employees || []);
        setDepartments(departmentsData.departments || []);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const data: any = Object.fromEntries(formData.entries());
      
      await employeesApi.create(data);
      toast.success("Employee created successfully");
      setShowForm(false);
      // Refresh employees
      const employeesData = await employeesApi.getAll();
      setEmployees(employeesData.employees || []);
    } catch (error: any) {
      console.error('Failed to create employee:', error);
      toast.error(error.message || "Failed to create employee");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory"
        subtitle="Promote employees, manage roles, and view assignments."
        actions={
          <button onClick={() => setShowForm((v) => !v)} className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <UserPlus className="h-4 w-4" /> Invite employee
          </button>
        }
      />

      {showForm && (
        <NeuCard>
          <h3 className="mb-4 text-lg font-semibold">Invite new employee</h3>
          <form
            onSubmit={handleCreateEmployee}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {[
              { l: "First name", p: "John", n: "firstName" },
              { l: "Last name", p: "Doe", n: "lastName" },
              { l: "Email", p: "john@example.com", n: "email", type: "email" },
              { l: "Password", p: "Password123", n: "password", type: "password" },
              { l: "Phone", p: "+1234567890", n: "phone" },
              { l: "Designation", p: "Software Engineer", n: "designation" },
              { l: "Department", p: "Select department", n: "department", isSelect: true, options: departments },
              { l: "Role", p: "employee", n: "role" },
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
              <button type="submit" className="neu-accent rounded-xl px-4 py-2.5 text-sm font-semibold">Invite employee</button>
            </div>
          </form>
        </NeuCard>
      )}

      <NeuCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 pr-3">Employee</th>
                <th className="py-3 pr-3">Email</th>
                <th className="py-3 pr-3">Department</th>
                <th className="py-3 pr-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="py-10 text-center text-muted-foreground">Loading...</td></tr>
              ) : employees.map((u: any) => (
                <tr key={u._id} className="border-t border-border/50 hover:bg-muted/30">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                        {u.firstName && u.lastName ? `${u.firstName[0]}${u.lastName[0]}` : 'NA'}
                      </div>
                      <span className="font-medium">{u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">{u.email}</td>
                  <td className="py-3 pr-3">{u.department?.name || u.department}</td>
                  <td className="py-3 pr-3">
                    <Badge tone={u.role === "admin" ? "primary" : "neutral"}>{u.role.replace("_", " ")}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeuCard>
    </div>
  );
}
