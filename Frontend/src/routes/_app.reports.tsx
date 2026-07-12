import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";
import { Download } from "lucide-react";
import { NeuCard, PageHeader, StatCard } from "@/components/app/ui";
import { SALES_ANALYTICS, UTILIZATION_TREND, DEPARTMENTS } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
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
              <LineChart data={UTILIZATION_TREND}>
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
              <BarChart data={SALES_ANALYTICS}>
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
              {DEPARTMENTS.map((d) => (
                <tr key={d.id} className="border-t border-border/50">
                  <td className="py-3 pr-3 font-medium">{d.name}</td>
                  <td className="py-3 pr-3 text-muted-foreground">{d.head}</td>
                  <td className="py-3 pr-3">{d.employees}</td>
                  <td className="py-3 pr-3">{d.assets}</td>
                  <td className="py-3 pr-3">{(d.assets / d.employees).toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </NeuCard>
    </div>
  );
}
