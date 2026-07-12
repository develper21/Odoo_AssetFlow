import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";
import { Download } from "lucide-react";
import { NeuCard, PageHeader, StatCard } from "@/components/app/ui";
import { reportsApi, departmentsApi } from "@/lib/api";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [utilizationData, setUtilizationData] = useState<any[]>([]);
  const [maintenanceData, setMaintenanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptData, utilData, maintData] = await Promise.all([
          departmentsApi.getAll(),
          reportsApi.getUtilization(),
          reportsApi.getMaintenanceFrequency(),
        ]);
        setDepartments(deptData.departments || []);
        
        // Transform utilization data for chart
        const transformedUtil = Array.isArray(utilData) ? utilData.map((item: any) => ({
          d: `${item._id.month}/${item._id.year}`,
          v: item.totalAllocations
        })) : [];
        setUtilizationData(transformedUtil);
        
        // Transform maintenance data for chart
        const transformedMaint = Array.isArray(maintData) ? maintData.map((item: any) => ({
          m: item.name || item.assetTag,
          w: item.maintenanceCount
        })) : [];
        setMaintenanceData(transformedMaint);
      } catch (error) {
        console.error('Failed to fetch reports data:', error);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fallback chart data if API returns empty
  const chartUtilizationData = utilizationData.length > 0 ? utilizationData : [
    { d: '1/2026', v: 82 },
    { d: '2/2026', v: 85 },
    { d: '3/2026', v: 88 },
    { d: '4/2026', v: 87 },
    { d: '5/2026', v: 90 },
    { d: '6/2026', v: 89 },
  ];

  const chartMaintenanceData = maintenanceData.length > 0 ? maintenanceData : [
    { m: 'Laptop-001', w: 12 },
    { m: 'Monitor-002', w: 15 },
    { m: 'Printer-003', w: 18 },
    { m: 'Projector-004', w: 14 },
    { m: 'Server-005', w: 20 },
    { m: 'Router-006', w: 16 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Asset utilization, maintenance cadence, and department summaries."
        actions={
          <button className="neu-accent inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold">
            <Download className="h-4 w-4" /> Export PDF
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard tone="accent" label="Utilization" value="87%" delta="+4% MoM" />
        <StatCard label="Avg maintenance days" value="2.4" delta="Faster than target" />
        <StatCard label="Open discrepancies" value="11" delta="Across 3 cycles" />
        <StatCard label="Assets retired YTD" value="34" delta="$41k written down" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <NeuCard>
          <h3 className="mb-4 text-lg font-semibold">Asset utilization</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={chartUtilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="v" stroke="var(--color-chart-1)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </NeuCard>
        <NeuCard>
          <h3 className="mb-4 text-lg font-semibold">Maintenance volume</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={chartMaintenanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
                <Bar dataKey="w" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </NeuCard>
      </div>

      <NeuCard>
        <h3 className="mb-4 text-lg font-semibold">Department summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3 pr-3">Department</th>
                <th className="py-3 pr-3">Head</th>
                <th className="py-3 pr-3">Employees</th>
                <th className="py-3 pr-3">Assets</th>
                <th className="py-3 pr-3">Assets / person</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">Loading...</td></tr>
              ) : departments.map((d: any) => {
                const employeeCount = d.employeeCount || d.employees || 0;
                const assetCount = d.assetCount || d.assets || 0;
                return (
                  <tr key={d._id} className="border-t border-border/50">
                    <td className="py-3 pr-3 font-medium">{d.name}</td>
                    <td className="py-3 pr-3 text-muted-foreground">{d.headOfDepartment?.firstName && d.headOfDepartment?.lastName ? `${d.headOfDepartment.firstName} ${d.headOfDepartment.lastName}` : d.head}</td>
                    <td className="py-3 pr-3">{employeeCount}</td>
                    <td className="py-3 pr-3">{assetCount}</td>
                    <td className="py-3 pr-3">{employeeCount > 0 ? (assetCount / employeeCount).toFixed(1) : '0.0'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </NeuCard>
    </div>
  );
}
