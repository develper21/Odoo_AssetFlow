import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { NeuCard, PageHeader, Badge } from "@/components/app/ui";
import { DEMO_USERS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/employees")({
  component: EmployeesPage,
});

const EXTRA = [
  { id: "u5", name: "Isla Moreno", email: "isla@assetflow.io", role: "dept_head", department: "Design" },
  { id: "u6", name: "Rohan Kapoor", email: "rohan@assetflow.io", role: "employee", department: "Finance" },
  { id: "u7", name: "Yuki Tanaka", email: "yuki@assetflow.io", role: "employee", department: "Engineering" },
  { id: "u8", name: "Leo Park", email: "leo@assetflow.io", role: "employee", department: "Operations" },
  { id: "u9", name: "Maya Iyer", email: "maya@assetflow.io", role: "asset_manager", department: "IT" },
];

function EmployeesPage() {
  const all = [...DEMO_USERS, ...EXTRA];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Directory"
        subtitle="Promote employees, manage roles, and view assignments."
        actions={
          <button className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <UserPlus className="h-4 w-4" /> Invite employee
          </button>
        }
      />
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
              {all.map((u) => (
                <tr key={u.id} className="border-t border-border/50 hover:bg-muted/30">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                        {u.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">{u.email}</td>
                  <td className="py-3 pr-3">{u.department}</td>
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
